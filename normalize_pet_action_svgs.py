import argparse
import base64
import json
import re
import xml.etree.ElementTree as ET
from io import BytesIO
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent / "pet-action"
REFERENCE_CODE = "1"
BODY_ANCHOR_ACTION_CODES = {"4", "6"}
DEFAULT_BODY_ANCHOR_FRAMES = 8
SVG_NS = "{http://www.w3.org/2000/svg}"
XLINK_HREF = "{http://www.w3.org/1999/xlink}href"


def parse_number(value, default=0.0):
    if value is None:
        return default
    match = re.match(r"\s*(-?\d+(?:\.\d+)?)", str(value))
    return float(match.group(1)) if match else default


def read_svg_size(root):
    view_box = root.get("viewBox")
    if view_box:
        parts = [parse_number(part) for part in re.split(r"[\s,]+", view_box.strip()) if part]
        if len(parts) == 4 and parts[2] > 0 and parts[3] > 0:
            return parts[0], parts[1], parts[2], parts[3]
    width = parse_number(root.get("width"), 1.0)
    height = parse_number(root.get("height"), 1.0)
    return 0.0, 0.0, max(1.0, width), max(1.0, height)


def image_href(element):
    return element.get("href") or element.get(XLINK_HREF) or ""


def decode_data_uri_png(href):
    prefix = "data:image/png;base64,"
    if not href.startswith(prefix):
        return None
    try:
        return Image.open(BytesIO(base64.b64decode(href[len(prefix):]))).convert("RGBA")
    except Exception:
        return None


def merge_bbox(result, bbox):
    if bbox is None:
        return result
    if result is None:
        return list(bbox)
    result[0] = min(result[0], bbox[0])
    result[1] = min(result[1], bbox[1])
    result[2] = max(result[2], bbox[2])
    result[3] = max(result[3], bbox[3])
    return result


def frame_boxes(action_file):
    tree = ET.parse(action_file)
    root = tree.getroot()
    view_x, view_y, width, height = read_svg_size(root)
    boxes = []

    for group_node in root.iter(f"{SVG_NS}g"):
        image_node = group_node.find(f"{SVG_NS}image")
        if image_node is None:
            continue
        href = image_href(image_node)
        image = decode_data_uri_png(href)
        if image is None:
            continue
        bbox = image.getbbox()
        sequence = int(parse_number(group_node.get("data-sequence"), len(boxes) + 1))
        frame = int(parse_number(group_node.get("data-frame"), sequence))
        source = group_node.get("data-source") or ""
        if not bbox:
            boxes.append({"bbox": None, "tag": group_node.get("data-tag") or "", "sequence": sequence, "frame": frame, "source": source})
            continue

        node_x = parse_number(image_node.get("x"), 0.0) - view_x
        node_y = parse_number(image_node.get("y"), 0.0) - view_y
        node_w = parse_number(image_node.get("width"), image.width)
        node_h = parse_number(image_node.get("height"), image.height)
        scale_x = node_w / max(1, image.width)
        scale_y = node_h / max(1, image.height)
        mapped = (
            node_x + bbox[0] * scale_x,
            node_y + bbox[1] * scale_y,
            node_x + bbox[2] * scale_x,
            node_y + bbox[3] * scale_y,
        )
        boxes.append({"bbox": mapped, "tag": group_node.get("data-tag") or "", "sequence": sequence, "frame": frame, "source": source})

    return width, height, boxes


def box_size(bbox):
    if not bbox:
        return 0.0, 0.0
    return max(0.0, bbox[2] - bbox[0]), max(0.0, bbox[3] - bbox[1])


def box_center_x(bbox):
    return (bbox[0] + bbox[2]) / 2


def box_bottom(bbox):
    return bbox[3]


def median(values):
    if not values:
        return 0.0
    ordered = sorted(values)
    mid = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[mid]
    return (ordered[mid - 1] + ordered[mid]) / 2


def box_score_against_idle(bbox, idle_bbox):
    width, height = box_size(bbox)
    idle_w, idle_h = box_size(idle_bbox)
    if width <= 0 or height <= 0 or idle_w <= 0 or idle_h <= 0:
        return float("inf")
    width_ratio = width / idle_w
    height_ratio = height / idle_h
    size_score = abs(width_ratio - 1.0) + abs(height_ratio - 1.0)
    if width_ratio > 1.75:
        size_score += (width_ratio - 1.75) * 4.0
    if height_ratio > 1.75:
        size_score += (height_ratio - 1.75) * 4.0
    if width_ratio < 0.45:
        size_score += (0.45 - width_ratio) * 3.0
    if height_ratio < 0.45:
        size_score += (0.45 - height_ratio) * 3.0
    aspect = width / max(1.0, height)
    idle_aspect = idle_w / max(1.0, idle_h)
    aspect_score = abs(aspect - idle_aspect) / max(0.35, idle_aspect)
    return size_score + aspect_score


def body_candidate_rows(boxes, idle_bbox):
    idle_w, idle_h = box_size(idle_bbox)
    if idle_w <= 0 or idle_h <= 0:
        return [row for row in boxes if row.get("bbox")]

    stop_tags = {"att", "eff", "read", "shake"}
    candidates = []
    for index, row in enumerate(boxes):
        bbox = row.get("bbox")
        if not bbox:
            continue
        tag = str(row.get("tag") or "").strip().lower()
        width, height = box_size(bbox)
        score = box_score_against_idle(bbox, idle_bbox)
        if tag in stop_tags:
            score += 4.0
        if width > idle_w * 2.2 or height > idle_h * 2.35:
            score += 6.0
        candidates.append({
            "index": index,
            "bbox": bbox,
            "tag": tag,
            "score": score,
        })
    return candidates


def best_body_window(candidates):
    if not candidates:
        return []

    best = []
    best_score = float("inf")
    for start in range(len(candidates)):
        merged = None
        total_score = 0.0
        for end in range(start, min(len(candidates), start + 10)):
            current = candidates[end]
            if end > start and current["index"] != candidates[end - 1]["index"] + 1:
                break
            merged = merge_bbox(merged, current["bbox"])
            total_score += current["score"]
            count = end - start + 1
            width, height = box_size(merged)
            merged_score = total_score / count
            merged_score += width * 0.001 + height * 0.001
            merged_score -= min(count, 4) * 0.18
            if current["tag"] in {"att", "eff", "read", "shake"} and count > 1:
                merged_score += 2.0
            if merged_score < best_score:
                best_score = merged_score
                best = candidates[start:end + 1]
    return best


def initial_anchor_boxes(boxes, anchor_frames=None):
    if not anchor_frames or anchor_frames <= 0:
        return boxes
    initial = boxes[:anchor_frames]
    return initial if any(row.get("bbox") for row in initial) else boxes


def selected_body_rows(boxes, idle_bbox=None, anchor_frames=None):
    if not boxes:
        return []
    if not idle_bbox:
        return [{"bbox": row.get("bbox"), "tag": row.get("tag") or "", "index": index, "score": 0.0} for index, row in enumerate(boxes) if row.get("bbox")]

    anchor_boxes = initial_anchor_boxes(boxes, anchor_frames)
    candidates = body_candidate_rows(anchor_boxes, idle_bbox)
    selected_rows = best_body_window(candidates)
    if not selected_rows and anchor_boxes is not boxes:
        selected_rows = best_body_window(body_candidate_rows(boxes, idle_bbox))
    return selected_rows


def merge_body_rows(selected_rows, fallback_boxes):
    selected = [row["bbox"] for row in selected_rows if row.get("bbox")]
    if not selected:
        selected = [row["bbox"] for row in fallback_boxes if row.get("bbox")]
    result = None
    for bbox in selected:
        result = merge_bbox(result, bbox)
    return result


def body_anchor_from_rows(selected_rows, fallback_bbox):
    boxes = [row["bbox"] for row in selected_rows if row.get("bbox")]
    if not boxes and fallback_bbox:
        boxes = [fallback_bbox]
    if not boxes:
        return None
    return [median([box_center_x(bbox) for bbox in boxes]), median([box_bottom(bbox) for bbox in boxes])]


def body_bbox_from_boxes(boxes, idle_bbox=None, anchor_frames=None):
    selected_rows = selected_body_rows(boxes, idle_bbox, anchor_frames)
    return merge_body_rows(selected_rows, boxes)


def read_action_layout(action_file, idle_bbox=None, body_anchor_frames=None):
    width, height, boxes = frame_boxes(action_file)
    union = None
    for row in boxes:
        union = merge_bbox(union, row.get("bbox"))
    selected_rows = selected_body_rows(boxes, idle_bbox, body_anchor_frames)
    body_bbox = merge_body_rows(selected_rows, boxes)
    body_anchor = body_anchor_from_rows(selected_rows, body_bbox)

    rounded_bbox = [round(v, 3) for v in union] if union else None
    rounded_body_bbox = [round(v, 3) for v in body_bbox] if body_bbox else rounded_bbox
    rounded_body_anchor = [round(v, 3) for v in body_anchor] if body_anchor else None
    return {
        "w": round(width, 3),
        "h": round(height, 3),
        "bbox": rounded_bbox,
        "bodyBbox": rounded_body_bbox,
        "bodyAnchor": rounded_body_anchor,
        "frames": len(boxes),
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Generate pet action layout metadata from animated SVG assets.")
    parser.add_argument("--id-min", type=int, default=1, help="Minimum pet id, inclusive.")
    parser.add_argument("--id-max", type=int, default=None, help="Maximum pet id, inclusive.")
    parser.add_argument("--layout-output", default="pet-action-layout.json", help="Output layout JSON path.")
    parser.add_argument("--body-anchor-frames", type=int, default=DEFAULT_BODY_ANCHOR_FRAMES, help="Sequence frames used to anchor action 4/6 body boxes.")
    return parser.parse_args()


def action_sort_key(code):
    return (0, int(code)) if str(code).isdigit() else (1, str(code))


def discover_side_actions(pet_dir, pet_id, side):
    pattern = re.compile(rf"^pet{re.escape(str(pet_id))}_{re.escape(str(side))}_(\d+)\.svg$")
    actions = {}
    for action_file in pet_dir.glob(f"pet{pet_id}_{side}_*.svg"):
        match = pattern.match(action_file.name)
        if not match:
            continue
        actions[match.group(1)] = action_file
    return actions


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
            action_files = discover_side_actions(pet_dir, pet_id, side)
            idle_file = action_files.get(REFERENCE_CODE)
            if not idle_file or not idle_file.exists():
                continue
            idle_layout = read_action_layout(idle_file)
            side_layout = {
                "idle": idle_layout,
                "actions": {},
            }
            checked += 1
            side_layout["actions"][REFERENCE_CODE] = side_layout["idle"]
            for code in sorted(action_files, key=action_sort_key):
                if code == REFERENCE_CODE:
                    continue
                action_file = action_files[code]
                anchor_frames = args.body_anchor_frames if code in BODY_ANCHOR_ACTION_CODES else None
                side_layout["actions"][code] = read_action_layout(action_file, idle_layout.get("bodyBbox") or idle_layout.get("bbox"), anchor_frames)
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
