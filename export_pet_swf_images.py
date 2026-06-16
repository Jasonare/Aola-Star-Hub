#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Export bitmap/image resources from pet SWF files with JPEXS FFDec.

Default workflow:
  input : ./swf/{id}/pet{id}_*.swf
  output: ./pet-action/images/*.png

The script is resumable. Existing output files are skipped unless --force is
used. FFDec exports one SWF into a temporary folder first, then this script
copies the exported images into the final flat images directory with a source
suffix when a filename collision would otherwise overwrite an existing file.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path


DEFAULT_FFDEC = Path(r"C:\Program Files (x86)\FFDec\ffdec-cli.exe")
CREATE_NO_WINDOW = 0x08000000 if sys.platform.startswith("win") else 0
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"}
PET_SWF_RE = re.compile(r"^pet(?P<id>\d+)_(?P<part>\d+)\.swf$", re.IGNORECASE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export all image resources from ./swf/{id}/pet{id}_*.swf via FFDec."
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).resolve().parent,
        help="Project root. Defaults to this script directory.",
    )
    parser.add_argument(
        "--ffdec",
        type=Path,
        default=DEFAULT_FFDEC,
        help="Path to ffdec-cli.exe.",
    )
    parser.add_argument(
        "--swf-root",
        type=Path,
        default=None,
        help="Root directory containing swf/{id}. Defaults to <project-root>/swf.",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=None,
        help="Final image output directory. Defaults to <project-root>/pet-action/images.",
    )
    parser.add_argument(
        "--tmp-dir",
        type=Path,
        default=None,
        help="Temporary FFDec export directory. Defaults to <project-root>/_tmp_ffdec_pet_images.",
    )
    parser.add_argument(
        "--log-dir",
        type=Path,
        default=None,
        help="Directory for JSONL logs. Defaults to <project-root>/_export_logs.",
    )
    parser.add_argument("--id", type=int, default=0, help="Export one pet id only.")
    parser.add_argument("--id-min", type=int, default=0, help="Minimum pet id, inclusive.")
    parser.add_argument("--id-max", type=int, default=0, help="Maximum pet id, inclusive.")
    parser.add_argument("--limit", type=int, default=0, help="Process at most N SWF files.")
    parser.add_argument("--timeout", type=int, default=120, help="Seconds per FFDec export.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing exported images.")
    parser.add_argument("--keep-temp", action="store_true", help="Keep per-SWF temp export folders.")
    parser.add_argument("--clean-temp", action="store_true", help="Remove tmp dir before starting.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned SWF files without exporting.")
    return parser.parse_args()


def resolve_path(path: Path, base: Path) -> Path:
    return path if path.is_absolute() else (base / path).resolve()


def pet_id_from_path(path: Path) -> int | None:
    match = PET_SWF_RE.match(path.name)
    if match:
        return int(match.group("id"))
    parent = path.parent.name
    return int(parent) if parent.isdigit() else None


def collect_swf_files(swf_root: Path, pet_id: int, id_min: int, id_max: int) -> list[Path]:
    if pet_id > 0:
        candidates = sorted((swf_root / str(pet_id)).glob("*.swf"))
    else:
        candidates = sorted(swf_root.glob("*/*.swf"))

    out: list[Path] = []
    for swf in candidates:
        sid = pet_id_from_path(swf)
        if sid is None:
            continue
        if id_min and sid < id_min:
            continue
        if id_max and sid > id_max:
            continue
        out.append(swf)
    return out


def run_ffdec(command: list[str], cwd: Path, timeout: int) -> tuple[int, str, bool]:
    process = subprocess.Popen(
        command,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        creationflags=CREATE_NO_WINDOW,
    )
    try:
        output, _ = process.communicate(timeout=timeout)
        return process.returncode, output, False
    except subprocess.TimeoutExpired:
        kill_process_tree(process.pid)
        return -1, "", True


def kill_process_tree(pid: int) -> None:
    if sys.platform.startswith("win"):
        subprocess.run(
            ["taskkill", "/F", "/T", "/PID", str(pid)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        return
    subprocess.run(["kill", "-TERM", str(pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)


def iter_exported_images(work_dir: Path) -> list[Path]:
    return sorted(
        path for path in work_dir.rglob("*")
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS
    )


def final_image_path(out_dir: Path, image: Path, swf_stem: str, force: bool) -> Path:
    base = out_dir / image.name
    if force or not base.exists():
        return base
    suffixed = out_dir / f"{image.stem}__from_{swf_stem}{image.suffix}"
    if force or not suffixed.exists():
        return suffixed
    index = 2
    while True:
        candidate = out_dir / f"{image.stem}__from_{swf_stem}_{index}{image.suffix}"
        if not candidate.exists():
            return candidate
        index += 1


def export_one(
    *,
    ffdec: Path,
    project_root: Path,
    swf: Path,
    out_dir: Path,
    tmp_dir: Path,
    timeout: int,
    force: bool,
    keep_temp: bool,
) -> dict:
    pet_id = pet_id_from_path(swf)
    work_dir = tmp_dir / swf.stem
    if work_dir.exists():
        shutil.rmtree(work_dir, ignore_errors=True)
    work_dir.mkdir(parents=True, exist_ok=True)

    command = [
        str(ffdec),
        "-format",
        "image:png_gif_jpeg",
        "-onerror",
        "ignore",
        "-export",
        "image",
        str(work_dir),
        str(swf),
    ]

    try:
        return_code, output, timed_out = run_ffdec(command, project_root, timeout)
        if timed_out:
            return {"status": "timeout", "pet_id": pet_id, "swf": str(swf)}

        images = iter_exported_images(work_dir)
        copied = 0
        skipped = 0
        for image in images:
            target = final_image_path(out_dir, image, swf.stem, force)
            if target.exists() and target.stat().st_size > 0 and not force:
                skipped += 1
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(image, target)
            copied += 1

        status = "exported" if copied > 0 else ("exists" if skipped > 0 else "no_images")
        return {
            "status": status,
            "pet_id": pet_id,
            "swf": str(swf),
            "copied": copied,
            "skipped": skipped,
            "return_code": return_code,
            "log_tail": output[-1000:] if status == "no_images" else "",
        }
    except Exception as exc:  # Keep batch export moving; details go to JSONL.
        return {"status": "error", "pet_id": pet_id, "swf": str(swf), "error": str(exc)}
    finally:
        if not keep_temp:
            shutil.rmtree(work_dir, ignore_errors=True)


def main() -> None:
    args = parse_args()
    project_root = args.project_root.resolve()
    ffdec = resolve_path(args.ffdec, project_root)
    swf_root = resolve_path(args.swf_root, project_root) if args.swf_root else project_root / "swf"
    out_dir = resolve_path(args.out_dir, project_root) if args.out_dir else project_root / "pet-action" / "images"
    tmp_dir = resolve_path(args.tmp_dir, project_root) if args.tmp_dir else project_root / "_tmp_ffdec_pet_images"
    log_dir = resolve_path(args.log_dir, project_root) if args.log_dir else project_root / "_export_logs"

    if not ffdec.exists():
        raise SystemExit(f"FFDec CLI not found: {ffdec}")
    if not swf_root.exists():
        raise SystemExit(f"SWF root not found: {swf_root}")
    if args.id_min and args.id_max and args.id_min > args.id_max:
        raise SystemExit("--id-min cannot be greater than --id-max")

    out_dir.mkdir(parents=True, exist_ok=True)
    log_dir.mkdir(parents=True, exist_ok=True)
    if args.clean_temp and tmp_dir.exists():
        shutil.rmtree(tmp_dir, ignore_errors=True)
    tmp_dir.mkdir(parents=True, exist_ok=True)

    swf_files = collect_swf_files(swf_root, args.id, args.id_min, args.id_max)
    if args.limit > 0:
        swf_files = swf_files[:args.limit]

    print(f"[start] swf_files={len(swf_files)}")
    print(f"[ffdec] {ffdec}")
    print(f"[input] {swf_root}")
    print(f"[output] {out_dir}")
    if args.dry_run:
        for swf in swf_files[:50]:
            print(swf)
        if len(swf_files) > 50:
            print(f"... and {len(swf_files) - 50} more")
        return

    log_path = log_dir / f"export_pet_swf_images_{time.strftime('%Y%m%d_%H%M%S')}.jsonl"
    counts: dict[str, int] = {}
    total_copied = 0
    total_skipped = 0
    started = time.time()
    with log_path.open("w", encoding="utf-8") as log:
        for index, swf in enumerate(swf_files, 1):
            result = export_one(
                ffdec=ffdec,
                project_root=project_root,
                swf=swf,
                out_dir=out_dir,
                tmp_dir=tmp_dir,
                timeout=args.timeout,
                force=args.force,
                keep_temp=args.keep_temp,
            )
            status = str(result.get("status", "unknown"))
            counts[status] = counts.get(status, 0) + 1
            total_copied += int(result.get("copied") or 0)
            total_skipped += int(result.get("skipped") or 0)
            log.write(json.dumps(result, ensure_ascii=False) + "\n")
            log.flush()
            print(
                f"[{index}/{len(swf_files)}] {status} "
                f"copied={result.get('copied', 0)} skipped={result.get('skipped', 0)} "
                f"{swf}"
            )

    elapsed = time.time() - started
    print("[done]")
    print(json.dumps({
        "swf_files": len(swf_files),
        "counts": counts,
        "copied": total_copied,
        "skipped": total_skipped,
        "elapsed_sec": round(elapsed, 2),
        "log": str(log_path),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
