#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate animated SVG pet action files from pet SWFs.

Default workflow:
  input : ./swf/{id}/pet{id}_*.swf
  assets: ./swf/{id}/svg-assets/{swf_stem}/...
  output: ./pet-action/{id}/pet{id}_{side}_{action}.svg

The generated SVG files embed PNG frames as data URIs and use CSS animation to
switch frames. They are animated SVG containers, not true vector redraws.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path
from xml.sax.saxutils import escape, quoteattr


DEFAULT_FFDEC = Path(r"C:\Program Files (x86)\FFDec\ffdec-cli.exe")
CREATE_NO_WINDOW = 0x08000000 if sys.platform.startswith("win") else 0
PET_SWF_RE = re.compile(r"^pet(?P<id>\d+)_(?P<side>\d+)\.swf$", re.IGNORECASE)
PET_IMAGE_RE = re.compile(
    r"^(?P<chid>\d+)_mmo\.petfight\.bitmap\.pet(?P<id>\d+)_(?P<side>\d+)_(?P<action>\d+)_(?P<frame>\d+)\.png$",
    re.IGNORECASE,
)
FRAME_DURATION_MS = 80


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate animated SVG pet actions from ./swf/{id}/pet{id}_*.swf.")
    parser.add_argument("--project-root", type=Path, default=Path(__file__).resolve().parent, help="Project root.")
    parser.add_argument("--ffdec", type=Path, default=DEFAULT_FFDEC, help="Path to ffdec-cli.exe.")
    parser.add_argument("--swf-root", type=Path, default=None, help="SWF root. Defaults to <project-root>/swf.")
    parser.add_argument("--out-root", type=Path, default=None, help="SVG output root. Defaults to <project-root>/pet-action.")
    parser.add_argument("--asset-root", type=Path, default=None, help="Central FFDec asset root. Defaults to swf/{id}/svg-assets.")
    parser.add_argument("--log-dir", type=Path, default=None, help="Log directory. Defaults to <project-root>/_export_logs.")
    parser.add_argument("--id", type=int, default=0, help="Generate one pet id only.")
    parser.add_argument("--id-min", type=int, default=1986, help="Minimum pet id, inclusive.")
    parser.add_argument("--id-max", type=int, default=2020, help="Maximum pet id, inclusive.")
    parser.add_argument("--limit", type=int, default=0, help="Process at most N pet ids.")
    parser.add_argument("--timeout", type=int, default=180, help="Seconds per FFDec export.")
    parser.add_argument("--frame-ms", type=int, default=FRAME_DURATION_MS, help="Frame duration in milliseconds.")
    parser.add_argument("--force", action="store_true", help="Overwrite existing assets and SVG files.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned pet ids and SWFs without exporting.")
    return parser.parse_args()


def resolve_path(path: Path, base: Path) -> Path:
    return path if path.is_absolute() else (base / path).resolve()


def swf_meta(path: Path) -> tuple[int, int] | None:
    match = PET_SWF_RE.match(path.name)
    if not match:
        return None
    return int(match.group("id")), int(match.group("side"))


def collect_pet_swfs(swf_root: Path, pet_id: int, id_min: int, id_max: int, limit: int) -> dict[int, list[Path]]:
    if pet_id > 0:
        candidates = sorted((swf_root / str(pet_id)).glob(f"pet{pet_id}_*.swf"))
    else:
        candidates = sorted(swf_root.glob("*/*.swf"))

    grouped: dict[int, list[Path]] = {}
    for swf in candidates:
        meta = swf_meta(swf)
        if not meta:
            continue
        sid, _side = meta
        if sid < id_min or sid > id_max:
            continue
        grouped.setdefault(sid, []).append(swf)

    selected = dict(sorted(grouped.items()))
    if limit > 0:
        selected = dict(list(selected.items())[:limit])
    return selected


def kill_process_tree(pid: int) -> None:
    if sys.platform.startswith("win"):
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
        return
    subprocess.run(["kill", "-TERM", str(pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)


def run_command(command: list[str], cwd: Path, timeout: int) -> tuple[int, str, bool]:
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


def per_pet_asset_root(swf_root: Path, pet_id: int, asset_root: Path | None) -> Path:
    if asset_root:
        return asset_root / str(pet_id)
    return swf_root / str(pet_id) / "svg-assets"


def has_exported_assets(work_dir: Path) -> bool:
    return any((work_dir / "images").glob("*.png")) and any((work_dir / "binaryData").glob("*.bin"))


def export_swf_assets(
    *,
    ffdec: Path,
    project_root: Path,
    swf: Path,
    work_dir: Path,
    timeout: int,
    force: bool,
) -> dict:
    if work_dir.exists() and force:
        shutil.rmtree(work_dir, ignore_errors=True)
    if has_exported_assets(work_dir) and not force:
        return {"status": "assets_exist", "swf": str(swf), "work_dir": str(work_dir)}

    work_dir.mkdir(parents=True, exist_ok=True)
    command = [
        str(ffdec),
        "-format",
        "image:png_gif_jpeg,binaryData:raw",
        "-onerror",
        "ignore",
        "-export",
        "image,binaryData,symbolClass",
        str(work_dir),
        str(swf),
    ]
    return_code, output, timed_out = run_command(command, project_root, timeout)
    if timed_out:
        return {"status": "timeout", "swf": str(swf), "work_dir": str(work_dir)}
    if return_code != 0:
        return {"status": "ffdec_error", "swf": str(swf), "return_code": return_code, "log_tail": output[-1200:]}
    return {
        "status": "exported_assets",
        "swf": str(swf),
        "work_dir": str(work_dir),
        "images": len(list((work_dir / "images").glob("*.png"))),
        "configs": len(list((work_dir / "binaryData").glob("*.bin"))),
    }


def png_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Not a PNG file: {path}")
    return int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")


def parse_movie_config(text: str) -> dict[int, list[dict[str, object]]]:
    actions: dict[int, list[dict[str, object]]] = {}
    for block in text.strip().strip("#").split("#"):
        if not block or ":" not in block:
            continue
        action_text, frames_text = block.split(":", 1)
        action = int(action_text)
        frames: list[dict[str, object]] = []
        for item in frames_text.split(";"):
            parts = [part for part in item.split(",") if part != ""]
            if len(parts) < 3:
                continue
            frames.append(
                {
                    "frame": int(parts[0]),
                    "x": int(parts[1]),
                    "y": int(parts[2]),
                    "tag": parts[3] if len(parts) > 3 else "",
                }
            )
        actions[action] = frames
    return actions


def load_movie_config(work_dir: Path) -> dict[int, list[dict[str, object]]]:
    config_files = sorted((work_dir / "binaryData").glob("*.bin"))
    if not config_files:
        raise FileNotFoundError(f"No MovieConfig binaryData found in {work_dir}")
    return parse_movie_config(config_files[0].read_text(encoding="utf-8"))


def build_image_map(images_dir: Path) -> dict[tuple[int, int], Path]:
    mapped: dict[tuple[int, int], Path] = {}
    for path in images_dir.glob("*.png"):
        match = PET_IMAGE_RE.match(path.name)
        if not match:
            continue
        action = int(match.group("action"))
        frame = int(match.group("frame"))
        mapped[(action, frame)] = path
    return mapped


def frame_css(frame_count: int, frame_ms: int) -> str:
    total_ms = max(1, frame_count) * max(1, frame_ms)
    lines = [
        f"    .frame {{ opacity: 0; animation-duration: {total_ms}ms; animation-iteration-count: infinite; animation-timing-function: step-end; }}",
    ]
    for index in range(frame_count):
        start = index * 100 / frame_count
        end = (index + 1) * 100 / frame_count
        hide_at = min(100, end + 0.001)
        lines.append(f"    .f{index} {{ animation-name: show{index}; }}")
        if index == frame_count - 1:
            lines.append(
                f"    @keyframes show{index} {{ 0% {{ opacity: 0; }} {start:.6f}% {{ opacity: 1; }} 100% {{ opacity: 1; }} }}"
            )
        else:
            lines.append(
                f"    @keyframes show{index} {{ 0% {{ opacity: 0; }} {start:.6f}% {{ opacity: 1; }} {end:.6f}% {{ opacity: 1; }} {hide_at:.6f}% {{ opacity: 0; }} 100% {{ opacity: 0; }} }}"
            )
    return "\n".join(lines)


def build_action_svg(
    *,
    out_path: Path,
    stem: str,
    action: int,
    frames: list[dict[str, object]],
    images: dict[tuple[int, int], Path],
    frame_ms: int,
    force: bool,
) -> dict:
    if out_path.exists() and out_path.stat().st_size > 0 and not force:
        return {"status": "svg_exists", "svg": str(out_path), "action": action}

    entries = []
    min_x = min_y = 0
    max_x = max_y = 0
    missing_frames = 0
    for sequence, frame_info in enumerate(frames, start=1):
        image_path = images.get((action, int(frame_info["frame"])))
        if image_path is None:
            missing_frames += 1
            continue
        width, height = png_size(image_path)
        x = int(frame_info["x"])
        y = int(frame_info["y"])
        min_x = min(min_x, x)
        min_y = min(min_y, y)
        max_x = max(max_x, x + width)
        max_y = max(max_y, y + height)
        entries.append((sequence, frame_info, image_path, width, height))

    if not entries:
        return {"status": "no_frames", "svg": str(out_path), "action": action, "missing_frames": missing_frames}

    svg_width = max(1, max_x - min_x)
    svg_height = max(1, max_y - min_y)
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{svg_width}" height="{svg_height}" viewBox="0 0 {svg_width} {svg_height}">',
        f"  <title>{escape(stem)} action {action}</title>",
        f"  <desc>{escape(stem)} action {action}; {len(entries)} frames; {max(1, frame_ms)}ms per frame; PNG frames embedded as data URIs.</desc>",
        "  <style><![CDATA[",
        frame_css(len(entries), frame_ms),
        "  ]]></style>",
        '  <rect width="100%" height="100%" fill="none"/>',
    ]
    for index, (sequence, frame_info, image_path, width, height) in enumerate(entries):
        x = int(frame_info["x"]) - min_x
        y = int(frame_info["y"]) - min_y
        data = base64.b64encode(image_path.read_bytes()).decode("ascii")
        tag = str(frame_info.get("tag", ""))
        source = image_path.name
        lines.append(
            f'  <g class="frame f{index}" data-sequence="{sequence}" data-frame="{frame_info["frame"]}" '
            f"data-tag={quoteattr(tag)} data-source={quoteattr(source)}>"
        )
        lines.append(f'    <image x="{x}" y="{y}" width="{width}" height="{height}" href="data:image/png;base64,{data}"/>')
        lines.append("  </g>")
    lines.append("</svg>")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return {
        "status": "generated",
        "svg": str(out_path),
        "action": action,
        "frames": len(entries),
        "missing_frames": missing_frames,
        "width": svg_width,
        "height": svg_height,
    }


def generate_svgs_for_swf(
    *,
    swf: Path,
    work_dir: Path,
    out_root: Path,
    frame_ms: int,
    force: bool,
) -> list[dict]:
    meta = swf_meta(swf)
    if not meta:
        return [{"status": "invalid_swf_name", "swf": str(swf)}]
    pet_id, side = meta
    actions = load_movie_config(work_dir)
    images = build_image_map(work_dir / "images")
    results = []
    for action, frames in sorted(actions.items()):
        out_path = out_root / str(pet_id) / f"pet{pet_id}_{side}_{action}.svg"
        results.append(
            build_action_svg(
                out_path=out_path,
                stem=swf.stem,
                action=action,
                frames=frames,
                images=images,
                frame_ms=frame_ms,
                force=force,
            )
        )
    return results


def main() -> None:
    args = parse_args()
    project_root = args.project_root.resolve()
    ffdec = resolve_path(args.ffdec, project_root)
    swf_root = resolve_path(args.swf_root, project_root) if args.swf_root else project_root / "swf"
    out_root = resolve_path(args.out_root, project_root) if args.out_root else project_root / "pet-action"
    asset_root = resolve_path(args.asset_root, project_root) if args.asset_root else None
    log_dir = resolve_path(args.log_dir, project_root) if args.log_dir else project_root / "_export_logs"

    if not ffdec.exists():
        raise SystemExit(f"FFDec CLI not found: {ffdec}")
    if not swf_root.exists():
        raise SystemExit(f"SWF root not found: {swf_root}")
    if args.id_min > args.id_max:
        raise SystemExit("--id-min cannot be greater than --id-max")

    pet_swfs = collect_pet_swfs(swf_root, args.id, args.id_min, args.id_max, args.limit)
    print(f"[start] pet_ids={len(pet_swfs)} id_min={args.id_min} id_max={args.id_max}")
    print(f"[ffdec] {ffdec}")
    print(f"[input] {swf_root}")
    print(f"[output] {out_root}")
    print(f"[assets] {asset_root or 'swf/{id}/svg-assets'}")

    if args.dry_run:
        for pet_id, swfs in list(pet_swfs.items())[:60]:
            names = ", ".join(swf.name for swf in swfs)
            print(f"{pet_id}: {names}")
        if len(pet_swfs) > 60:
            print(f"... and {len(pet_swfs) - 60} more pet ids")
        return

    out_root.mkdir(parents=True, exist_ok=True)
    log_dir.mkdir(parents=True, exist_ok=True)
    log_path = log_dir / f"generate_pet_action_svgs_from_swf_{time.strftime('%Y%m%d_%H%M%S')}.jsonl"

    counts: dict[str, int] = {}
    started = time.time()
    with log_path.open("w", encoding="utf-8") as log:
        for index, (pet_id, swfs) in enumerate(pet_swfs.items(), start=1):
            if len(swfs) != 2:
                event = {"status": "unexpected_swf_count", "pet_id": pet_id, "count": len(swfs), "swfs": [str(swf) for swf in swfs]}
                log.write(json.dumps(event, ensure_ascii=False) + "\n")
                counts[event["status"]] = counts.get(event["status"], 0) + 1

            pet_asset_root = per_pet_asset_root(swf_root, pet_id, asset_root)
            generated = 0
            skipped = 0
            failed = 0
            for swf in swfs:
                work_dir = pet_asset_root / swf.stem
                export_result = export_swf_assets(
                    ffdec=ffdec,
                    project_root=project_root,
                    swf=swf,
                    work_dir=work_dir,
                    timeout=args.timeout,
                    force=args.force,
                )
                log.write(json.dumps({"pet_id": pet_id, **export_result}, ensure_ascii=False) + "\n")
                counts[export_result["status"]] = counts.get(export_result["status"], 0) + 1
                if export_result["status"] in {"timeout", "ffdec_error"}:
                    failed += 1
                    continue

                try:
                    svg_results = generate_svgs_for_swf(
                        swf=swf,
                        work_dir=work_dir,
                        out_root=out_root,
                        frame_ms=args.frame_ms,
                        force=args.force,
                    )
                except Exception as exc:
                    svg_results = [{"status": "svg_error", "swf": str(swf), "error": str(exc)}]

                for result in svg_results:
                    log.write(json.dumps({"pet_id": pet_id, "swf": str(swf), **result}, ensure_ascii=False) + "\n")
                    status = str(result["status"])
                    counts[status] = counts.get(status, 0) + 1
                    if status == "generated":
                        generated += 1
                    elif status == "svg_exists":
                        skipped += 1
                    else:
                        failed += 1

            print(f"[{index}/{len(pet_swfs)}] pet_id={pet_id} generated={generated} skipped={skipped} failed={failed}")

    elapsed = time.time() - started
    print(f"[done] elapsed={elapsed:.1f}s log={log_path}")
    print("[summary] " + ", ".join(f"{key}={value}" for key, value in sorted(counts.items())))


if __name__ == "__main__":
    main()
