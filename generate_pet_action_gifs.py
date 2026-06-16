from __future__ import annotations

import argparse
import base64
from io import BytesIO
import re
from collections import defaultdict
from pathlib import Path

from PIL import Image


DEFAULT_PROJECT_ROOT = Path(__file__).resolve().parent
DEFAULT_IMAGES_DIR = DEFAULT_PROJECT_ROOT / "pet-action" / "images"
DEFAULT_OUT_ROOT = DEFAULT_PROJECT_ROOT / "pet-action"
FRAME_DURATION_MS = 80

# 输入目录：导出的 PNG
# 输出根目录：每个 id 一个子目录

# 识别形如：...pet3_1_6_1.png / ...pet794_2_6_9.png
# 含义：pet{id}_{side}_x_y
name_re = re.compile(
    r"pet(?P<pet_id>\d+)_(?P<side>\d+)_(?P<x>\d+)_(?P<y>\d+)\.png$",
    re.IGNORECASE,
)


def parse_args():
    parser = argparse.ArgumentParser(description="Build pet action animated SVG files from exported PNG frames.")
    parser.add_argument("--images-dir", type=Path, default=DEFAULT_IMAGES_DIR, help="导出的 PNG 目录")
    parser.add_argument("--out-root", type=Path, default=DEFAULT_OUT_ROOT, help="输出根目录")
    parser.add_argument("--ids", default="", help="只处理指定 id，逗号分隔")
    parser.add_argument("--id-min", type=int, default=1, help="最小 id，包含")
    parser.add_argument("--id-max", type=int, default=1985, help="最大 id，包含")
    parser.add_argument("--force", action="store_true", help="覆盖已存在的 SVG")
    return parser.parse_args()


def parse_ids(raw):
    if not raw:
        return None
    return {int(part.strip()) for part in raw.split(",") if part.strip()}


def encode_png_data_uri(image):
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    data = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{data}"


def build_frame_style(frame_count):
    total_ms = max(1, frame_count) * FRAME_DURATION_MS
    lines = [
        f".frame {{ opacity: 0; animation-duration: {total_ms}ms; animation-iteration-count: infinite; animation-timing-function: step-end; }}",
    ]
    for index in range(frame_count):
        start = index * 100 / frame_count
        end = (index + 1) * 100 / frame_count
        hide_at = min(100, end + 0.001)
        lines.append(f".f{index} {{ animation-name: show{index}; }}")
        if index == frame_count - 1:
            lines.append(
                f"@keyframes show{index} {{ 0% {{ opacity: 0; }} {start:.6f}% {{ opacity: 1; }} 100% {{ opacity: 1; }} }}"
            )
        else:
            lines.append(
                f"@keyframes show{index} {{ 0% {{ opacity: 0; }} {start:.6f}% {{ opacity: 1; }} {end:.6f}% {{ opacity: 1; }} {hide_at:.6f}% {{ opacity: 0; }} 100% {{ opacity: 0; }} }}"
            )
    return "\n".join(lines)


def write_animated_svg(out_svg, frames, width, height):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
        "  <style><![CDATA[",
        build_frame_style(len(frames)),
        "  ]]></style>",
        '  <rect width="100%" height="100%" fill="none"/>',
    ]
    for index, (y, image, source_name) in enumerate(frames):
        data_uri = encode_png_data_uri(image)
        lines.append(f'  <g class="frame f{index}" data-frame="{y}" data-source="{source_name}">')
        lines.append(f'    <image x="0" y="0" width="{width}" height="{height}" href="{data_uri}"/>')
        lines.append("  </g>")
    lines.append("</svg>")
    out_svg.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    args = parse_args()
    images_dir = args.images_dir
    out_root = args.out_root
    selected_ids = parse_ids(args.ids)

    # key=(pet_id, side, x) -> list[(y, path)]
    groups = defaultdict(list)
    skipped = []

    # 若 C:\工作娱乐\Aola-Star-Hub\pet-action\{id} 已存在，则整组跳过

    for p in images_dir.iterdir():
        if not p.is_file():
            continue
        m = name_re.search(p.name)
        if not m:
            continue
        pet_id = int(m.group("pet_id"))
        if selected_ids is not None and pet_id not in selected_ids:
            continue
        if args.id_min is not None and pet_id < args.id_min:
            continue
        if args.id_max is not None and pet_id > args.id_max:
            continue
        side = int(m.group("side"))
        x = int(m.group("x"))
        y = int(m.group("y"))
        groups[(pet_id, side, x)].append((y, p))

    if not groups:
        raise SystemExit("No frames matched pattern: pet{id}_{side}_x_y.png")

    created = []

    # 同一只亚比同一朝向的所有动作共用同一画布，避免攻击/属性动作比 idle 动作显示更小。
    side_canvas = defaultdict(lambda: [0, 0])
    side_idle_body = {}
    for (pet_id, side, _x), items in groups.items():
        max_w, max_h = side_canvas[(pet_id, side)]
        for _y, frame_path in items:
            with Image.open(frame_path) as im:
                max_w = max(max_w, im.width)
                max_h = max(max_h, im.height)
                if _x == 1:
                    bbox = im.convert("RGBA").getbbox()
                    if bbox:
                        body_w = bbox[2] - bbox[0]
                        body_h = bbox[3] - bbox[1]
                        old = side_idle_body.get((pet_id, side), (0, 0))
                        side_idle_body[(pet_id, side)] = (max(old[0], body_w), max(old[1], body_h))
        side_canvas[(pet_id, side)] = [max_w, max_h]

    for (pet_id, side, x), items in sorted(groups.items()):
        # 按 y 升序
        items.sort(key=lambda t: t[0])

        # 读取帧，统一到该亚比该朝向的最大画布
        src_frames = []
        max_w, max_h = side_canvas[(pet_id, side)]
        idle_body_w, idle_body_h = side_idle_body.get((pet_id, side), (0, 0))
        for y, frame_path in items:
            im = Image.open(frame_path).convert("RGBA")
            bbox = im.getbbox()
            if x != 1 and bbox and idle_body_h > 0:
                body_w = bbox[2] - bbox[0]
                body_h = bbox[3] - bbox[1]
                if body_h > 0 and body_h < idle_body_h * 0.92:
                    ratio = idle_body_h / body_h
                    new_w = max(1, round(im.width * ratio))
                    new_h = max(1, round(im.height * ratio))
                    im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
                    max_w = max(max_w, new_w)
                    max_h = max(max_h, new_h)
            src_frames.append((y, im, frame_path.name))

        # 统一画布并底部居中对齐
        aligned = []
        for y, im, source_name in src_frames:
            canvas = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
            x_offset = (max_w - im.width) // 2
            y_offset = max_h - im.height
            canvas.alpha_composite(im, (x_offset, y_offset))
            aligned.append((y, canvas, source_name))

        out_dir = out_root / str(pet_id)
        out_dir.mkdir(parents=True, exist_ok=True)
        out_svg = out_dir / f"pet{pet_id}_{side}_{x}.svg"

        if out_svg.exists() and not args.force:
            skipped.append(str(out_svg))
        else:
            write_animated_svg(out_svg, aligned, max_w, max_h)
            created.append((pet_id, side, x, len(items), str(out_svg)))

        for _, im, _ in src_frames:
            im.close()
        for _, im, _ in aligned:
            im.close()

    print("Generated animated SVGs:")
    for pet_id, side, x, n, out in created:
        print(f"pet_id={pet_id} side={side} x={x} frames={n} -> {out}")

    if skipped:
        print("Skipped existing SVGs:")
        print("\n".join(map(str, skipped)))


if __name__ == "__main__":
    main()
