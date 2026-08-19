#!/usr/bin/env python3
"""Export Aola skill effect SWF files to GIF with JPEXS FFDec.

Default workflow:
  input : ./resource/skill-effect/swf/effect{skill_id}.swf
  output: ./resource/skill-effect/effect{skill_id}.gif

The script is resumable. Existing GIF files are skipped unless --force is used.
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
SWF_NAME_RE = re.compile(r"effect(\d+)\.swf$", re.IGNORECASE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export skill-effect SWF files to main GIF animations."
    )
    parser.add_argument(
        "--project-root",
        default=Path(__file__).resolve().parent,
        type=Path,
        help="Project root. Defaults to this script directory.",
    )
    parser.add_argument(
        "--ffdec",
        default=DEFAULT_FFDEC,
        type=Path,
        help="Path to ffdec-cli.exe.",
    )
    parser.add_argument(
        "--swf-dir",
        default=None,
        type=Path,
        help="Directory containing effect*.swf. Defaults to resource/skill-effect/swf.",
    )
    parser.add_argument(
        "--out-dir",
        default=None,
        type=Path,
        help="Directory for effect*.gif. Defaults to resource/skill-effect.",
    )
    parser.add_argument(
        "--tmp-dir",
        default=None,
        type=Path,
        help="Temporary export directory. Defaults to skill-effect/_tmp_export_skill_gifs.",
    )
    parser.add_argument(
        "--log-dir",
        default=None,
        type=Path,
        help="Log directory. Defaults to skill-effect/_export_logs.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Only process N pending SWF files. 0 means all pending files.",
    )
    parser.add_argument(
        "--id-min",
        type=int,
        default=26231,
        help="Minimum skill id to convert (inclusive).",
    )
    parser.add_argument(
        "--id-max",
        type=int,
        default=26240,
        help="Maximum skill id to convert (inclusive).",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=45,
        help="Seconds before killing one FFDec export.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-export even when the target GIF already exists.",
    )
    parser.add_argument(
        "--keep-temp",
        action="store_true",
        help="Keep temporary FFDec export folders for debugging.",
    )
    parser.add_argument(
        "--clean-temp",
        action="store_true",
        help="Remove the temporary export directory before starting.",
    )
    return parser.parse_args()


def skill_id_from_swf(path: Path) -> int | None:
    match = SWF_NAME_RE.match(path.name)
    return int(match.group(1)) if match else None


def run_with_timeout(command: list[str], cwd: Path, timeout: int) -> tuple[int, str, bool]:
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
    subprocess.run(
        ["kill", "-TERM", str(pid)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )


def pick_main_gif(work_dir: Path, skill_id: int) -> Path | None:
    gifs = list(work_dir.rglob("frames.gif"))
    if not gifs:
        return None

    expected_class = f"mmo.petfight.effect{skill_id}".lower()
    for gif in gifs:
        if expected_class in str(gif).lower():
            return gif

    # FFDec sometimes omits class text from folder names. The main effect sprite
    # is usually the largest animation after exporting all sprites.
    return max(gifs, key=lambda item: item.stat().st_size)


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
    skill_id = skill_id_from_swf(swf)
    if skill_id is None:
        return {"file": swf.name, "status": "skip", "reason": "bad filename"}

    target = out_dir / f"effect{skill_id}.gif"
    if target.exists() and target.stat().st_size > 0 and not force:
        return {
            "skill_id": skill_id,
            "status": "exists",
            "gif": str(target),
            "size": target.stat().st_size,
        }

    work_dir = tmp_dir / f"effect{skill_id}"
    if work_dir.exists():
        shutil.rmtree(work_dir, ignore_errors=True)
    work_dir.mkdir(parents=True, exist_ok=True)

    command = [
        str(ffdec),
        "-format",
        "sprite:gif",
        "-onerror",
        "ignore",
        "-export",
        "sprite",
        str(work_dir),
        str(swf),
    ]

    try:
        return_code, output, timed_out = run_with_timeout(command, project_root, timeout)
        if timed_out:
            return {"skill_id": skill_id, "status": "timeout", "swf": str(swf)}

        main_gif = pick_main_gif(work_dir, skill_id)
        if main_gif and main_gif.exists() and main_gif.stat().st_size > 0:
            shutil.copy2(main_gif, target)
            return {
                "skill_id": skill_id,
                "status": "exported",
                "gif": str(target),
                "size": target.stat().st_size,
            }

        return {
            "skill_id": skill_id,
            "status": "no_gif",
            "swf": str(swf),
            "return_code": return_code,
            "log_tail": output[-1000:],
        }
    except Exception as exc:  # Keep batch export moving; details go to JSON logs.
        return {
            "skill_id": skill_id,
            "status": "error",
            "swf": str(swf),
            "error": f"{type(exc).__name__}: {exc}",
        }
    finally:
        if not keep_temp:
            shutil.rmtree(work_dir, ignore_errors=True)


def main() -> int:
    args = parse_args()
    project_root = args.project_root.resolve()
    ffdec = args.ffdec.resolve()
    base_dir = project_root / "resource" / "skill-effect"
    swf_dir = (args.swf_dir or base_dir / "swf").resolve()
    out_dir = (args.out_dir or base_dir).resolve()
    tmp_dir = (args.tmp_dir or base_dir / "_tmp_export_skill_gifs").resolve()
    log_dir = (args.log_dir or base_dir / "_export_logs").resolve()

    if not ffdec.exists():
        print(f"FFDec not found: {ffdec}", file=sys.stderr)
        return 2
    if not swf_dir.exists():
        print(f"SWF directory not found: {swf_dir}", file=sys.stderr)
        return 2

    out_dir.mkdir(parents=True, exist_ok=True)
    log_dir.mkdir(parents=True, exist_ok=True)
    if args.clean_temp and tmp_dir.exists():
        shutil.rmtree(tmp_dir, ignore_errors=True)
    tmp_dir.mkdir(parents=True, exist_ok=True)

    all_swfs = sorted(
        [path for path in swf_dir.glob("effect*.swf") if skill_id_from_swf(path)],
        key=lambda path: skill_id_from_swf(path) or 0,
    )
    id_min = max(1, int(args.id_min) or 1)
    id_max = max(id_min, int(args.id_max) or id_min)
    all_swfs = [
        path
        for path in all_swfs
        if id_min <= (skill_id_from_swf(path) or 0) <= id_max
    ]
    pending = [
        path
        for path in all_swfs
        if args.force
        or not (out_dir / f"effect{skill_id_from_swf(path)}.gif").exists()
    ]
    batch = pending[: args.limit] if args.limit and args.limit > 0 else pending

    print(f"project_root={project_root}")
    print(f"ffdec={ffdec}")
    print(f"swf_dir={swf_dir}")
    print(f"out_dir={out_dir}")
    print(f"total_swf={len(all_swfs)} pending={len(pending)} batch={len(batch)}")

    started = time.time()
    results: list[dict] = []
    counts: dict[str, int] = {}

    for index, swf in enumerate(batch, 1):
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
        results.append(result)
        status = str(result.get("status", "unknown"))
        counts[status] = counts.get(status, 0) + 1

        if index % 10 == 0 or index == len(batch):
            elapsed = time.time() - started
            print(
                f"progress={index}/{len(batch)} counts={counts} elapsed={elapsed:.1f}s",
                flush=True,
            )

    remaining = [
        path
        for path in all_swfs
        if not (out_dir / f"effect{skill_id_from_swf(path)}.gif").exists()
    ]
    summary = {
        "total_swf": len(all_swfs),
        "processed": len(batch),
        "counts": counts,
        "gif_files": len(list(out_dir.glob("effect*.gif"))),
        "remaining": len(remaining),
        "elapsed_seconds": round(time.time() - started, 2),
        "swf_dir": str(swf_dir),
        "out_dir": str(out_dir),
        "ffdec": str(ffdec),
    }

    timestamp = time.strftime("%Y%m%d_%H%M%S")
    result_path = log_dir / f"export_skill_effect_gifs_{timestamp}.json"
    summary_path = log_dir / "export_skill_effect_gifs_latest_summary.json"
    result_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"log={result_path}")
    print(f"summary={summary_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
