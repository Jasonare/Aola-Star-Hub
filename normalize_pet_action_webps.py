import argparse
import json
from pathlib import Path
from PIL import Image, ImageSequence


ROOT = Path(__file__).resolve().parent / "pet-action"
ACTION_CODES = {"2", "4", "6"}
REFERENCE_CODE = "1"


def union_bbox(image):
    result = None
    frames = 0
    for frame in ImageSequence.Iterator(image):
        frames += 1
        bbox = frame.convert("RGBA").getbbox()
        if not bbox:
            continue
        if result is None:
            result = list(bbox)
        else:
            result[0] = min(result[0], bbox[0])
            result[1] = min(result[1], bbox[1])
            result[2] = max(result[2], bbox[2])
            result[3] = max(result[3], bbox[3])
    return (tuple(result) if result else None), frames


def read_action_layout(action_file):
    image = Image.open(action_file)
    bbox, frames = union_bbox(image)
    return {
        "w": image.size[0],
        "h": image.size[1],
        "bbox": list(bbox) if bbox else None,
        "frames": frames
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Generate pet action layout metadata without rewriting WEBP assets.")
    parser.add_argument("--id-min", type=int, default=1, help="最小亚比编号，包含。")
    parser.add_argument("--id-max", type=int, default=None, help="最大亚比编号，包含；默认不限制。")
    parser.add_argument("--layout-output", default="pet-action-layout.json", help="输出动作布局元数据 JSON。")
    return parser.parse_args()


def main():
    args = parse_args()
    layout = {}
    checked = 0
    for pet_dir in sorted([p for p in ROOT.iterdir() if p.is_dir() and p.name.isdigit()], key=lambda p: int(p.name)):
        pet_id = pet_dir.name
        pet_id_num = int(pet_id)
        if pet_id_num < args.id_min:
            continue
        if args.id_max is not None and pet_id_num > args.id_max:
            continue
        pet_layout = {}
        for side in ("1", "2"):
            idle_file = pet_dir / f"pet{pet_id}_{side}_{REFERENCE_CODE}.webp"
            if not idle_file.exists():
                continue
            side_layout = {
                "idle": read_action_layout(idle_file),
                "actions": {}
            }
            checked += 1
            side_layout["actions"][REFERENCE_CODE] = side_layout["idle"]
            for code in ACTION_CODES:
                action_file = pet_dir / f"pet{pet_id}_{side}_{code}.webp"
                if not action_file.exists():
                    continue
                side_layout["actions"][code] = read_action_layout(action_file)
                checked += 1
            pet_layout[side] = side_layout
        if pet_layout:
            layout[pet_id] = pet_layout
    out_file = Path(args.layout_output)
    if not out_file.is_absolute():
        out_file = Path(__file__).resolve().parent / out_file
    out_file.write_text(json.dumps(layout, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"checked={checked}")
    print(f"layout_pets={len(layout)}")
    print(f"layout={out_file}")


if __name__ == "__main__":
    main()
