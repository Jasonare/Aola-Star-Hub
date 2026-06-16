from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "time-tunnel-environments"
W, H = 1600, 900


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def mix(c1, c2, t: float):
    return tuple(lerp(c1[i], c2[i], t) for i in range(3))


def rgba(c, a=255):
    return (c[0], c[1], c[2], a)


def gradient(top, bottom):
    img = Image.new("RGB", (W, H), top)
    px = img.load()
    for y in range(H):
        t = y / max(1, H - 1)
        c = mix(top, bottom, t)
        for x in range(W):
            px[x, y] = c
    return img.convert("RGBA")


def overlay(base, layer, blur=0):
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)


def poly(draw, pts, fill):
    draw.polygon([(int(x), int(y)) for x, y in pts], fill=fill)


def draw_sunbeams(base, color, seed, count=7):
    rng = random.Random(seed)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, "RGBA")
    origin_x = rng.randint(560, 1040)
    for i in range(count):
        x1 = origin_x + rng.randint(-240, 240)
        width = rng.randint(140, 300)
        pts = [(x1, -40), (x1 + width, -40), (x1 + width * 0.45, H), (x1 - width * 0.7, H)]
        d.polygon(pts, fill=rgba(color, rng.randint(22, 46)))
    overlay(base, layer, blur=22)


def draw_mist(base, color, seed, bands=6):
    rng = random.Random(seed)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, "RGBA")
    for i in range(bands):
        y = rng.randint(130, 590)
        h = rng.randint(70, 150)
        d.ellipse((-120, y - h, W + 120, y + h), fill=rgba(color, rng.randint(18, 42)))
    overlay(base, layer, blur=26)


def draw_leaf_cluster(draw, cx, cy, r, color, alpha=230):
    draw.ellipse((cx - r * 1.2, cy - r * 0.72, cx + r * 1.2, cy + r * 0.72), fill=rgba(color, alpha))
    draw.ellipse((cx - r * 0.62, cy - r * 1.05, cx + r * 0.62, cy + r * 0.25), fill=rgba(color, alpha))
    draw.ellipse((cx - r * 0.25, cy - r * 0.65, cx + r * 1.25, cy + r * 0.8), fill=rgba(color, alpha))
    draw.ellipse((cx - r * 1.15, cy - r * 0.5, cx + r * 0.15, cy + r * 0.9), fill=rgba(color, alpha))


def brush_blob(draw, rng, cx, cy, rx, ry, color, alpha=180, points=18):
    pts = []
    for i in range(points):
        a = math.tau * i / points
        wobble = 0.72 + rng.random() * 0.58
        pts.append((cx + math.cos(a) * rx * wobble, cy + math.sin(a) * ry * wobble))
    draw.polygon(pts, fill=rgba(color, alpha))


def brush_stroke(draw, rng, x1, y1, x2, y2, color, width=8, alpha=180, steps=7):
    last = (x1, y1)
    pts = [last]
    for i in range(1, steps):
        t = i / steps
        x = x1 + (x2 - x1) * t + rng.randint(-14, 14)
        y = y1 + (y2 - y1) * t + rng.randint(-10, 10)
        pts.append((x, y))
    pts.append((x2, y2))
    draw.line(pts, fill=rgba(color, alpha), width=width, joint="curve")


def draw_forest_scene(path: Path, seed=11, palette=None):
    p = palette or {
        "sky1": (184, 236, 231),
        "sky2": (43, 105, 83),
        "sun": (255, 250, 176),
        "leaf": (77, 168, 82),
        "leaf2": (161, 220, 99),
        "deep": (9, 45, 31),
        "trunk": (73, 47, 23),
        "water": (99, 207, 215),
        "ground": (39, 123, 51),
    }
    rng = random.Random(seed)
    img = gradient(p["sky1"], p["sky2"])
    d = ImageDraw.Draw(img, "RGBA")
    draw_sunbeams(img, p["sun"], seed + 1, 8)
    draw_mist(img, (205, 245, 226), seed + 2, 7)

    # Distant painterly forest silhouettes.
    for layer_idx, (ybase, alpha, scale) in enumerate([(350, 66, 0.55), (430, 92, 0.75), (520, 122, 1.0)]):
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer, "RGBA")
        for x in range(-80, W + 80, int(58 * scale)):
            h = rng.randint(int(110 * scale), int(260 * scale))
            tw = rng.randint(int(10 * scale), int(26 * scale))
            c = mix(p["deep"], p["leaf"], layer_idx * 0.13)
            ld.rounded_rectangle((x, ybase - h, x + tw, H), radius=max(3, tw // 2), fill=rgba(c, alpha))
            for _ in range(4):
                brush_blob(
                    ld, rng, x + rng.randint(-30, 45), ybase - h + rng.randint(6, 70),
                    rng.randint(int(34 * scale), int(82 * scale)),
                    rng.randint(int(20 * scale), int(52 * scale)),
                    mix(c, p["leaf2"], rng.random() * 0.45), alpha
                )
        overlay(img, layer, blur=4 if layer_idx == 0 else 2)

    # Ground banks and winding stream.
    d = ImageDraw.Draw(img, "RGBA")
    left_bank = [(0, H), (0, 640), (180, 590), (390, 602), (575, 675), (650, H)]
    right_bank = [(W, H), (W, 606), (1350, 574), (1080, 612), (890, 708), (790, H)]
    poly(d, left_bank, rgba(mix(p["ground"], p["deep"], 0.22), 255))
    poly(d, right_bank, rgba(mix(p["ground"], p["deep"], 0.12), 255))
    stream = [(646, 520), (726, 552), (790, 600), (768, 656), (828, 724), (765, 900),
              (590, 900), (644, 732), (602, 660), (624, 592)]
    poly(d, stream, rgba(p["water"], 210))
    for i in range(22):
        y = 542 + i * 18
        x = 660 + math.sin(i * 0.72) * 50
        d.arc((x - 80, y - 10, x + 165, y + 34), 188, 345, fill=rgba((226, 255, 236), 78), width=2)
    for i in range(80):
        x = rng.randint(520, 930)
        y = rng.randint(590, 850)
        d.ellipse((x - rng.randint(7, 22), y - rng.randint(3, 8), x + rng.randint(8, 24), y + rng.randint(3, 9)), fill=rgba((84, 91, 70), rng.randint(92, 165)))

    # Foreground trees and canopy, using irregular strokes instead of round icons.
    trunk_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    td = ImageDraw.Draw(trunk_layer, "RGBA")
    for x, w, darkness in [(36, 72, 0.48), (154, 44, 0.22), (300, 80, 0.36), (1268, 78, 0.42), (1436, 54, 0.28), (1548, 66, 0.5)]:
        top = rng.randint(-60, 42)
        trunk_col = mix(p["trunk"], (8, 18, 13), darkness)
        pts = [(x, H + 50), (x + w, H + 50), (x + w + rng.randint(-12, 12), top), (x + rng.randint(-10, 10), top)]
        td.polygon(pts, fill=rgba(trunk_col, 238))
        for k in range(8):
            xx = x + rng.randint(6, max(8, w - 4))
            td.line((xx, top + 40, xx + rng.randint(-18, 18), H), fill=rgba(mix(trunk_col, (245, 211, 121), 0.18), rng.randint(38, 82)), width=rng.randint(2, 5))
        for k in range(3):
            sx = x + rng.randint(15, w - 4)
            ex = sx + rng.choice([-1, 1]) * rng.randint(90, 190)
            brush_stroke(td, rng, sx, rng.randint(80, 260), ex, rng.randint(170, 360), trunk_col, rng.randint(8, 18), 185)
    overlay(img, trunk_layer, blur=0.2)

    canopy = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(canopy, "RGBA")
    for side_x in [-80, 1200]:
        for _ in range(34):
            cx = side_x + rng.randint(0, 520)
            cy = rng.randint(-40, 300)
            rx = rng.randint(42, 130)
            ry = rng.randint(26, 82)
            col = mix(p["leaf"], p["leaf2"], rng.random())
            brush_blob(cd, rng, cx, cy, rx, ry, col, rng.randint(120, 210), points=rng.randint(11, 19))
    for _ in range(28):
        cx = rng.randint(230, 1370)
        cy = rng.randint(-30, 210)
        brush_blob(cd, rng, cx, cy, rng.randint(44, 108), rng.randint(24, 66), mix(p["leaf"], p["leaf2"], rng.random() * 0.85), rng.randint(54, 116), points=14)
    overlay(img, canopy, blur=0.5)

    # Grass, flowers and stones
    for i in range(420):
        x = rng.randint(0, W)
        y = rng.randint(570, 890)
        if 610 < x < 855 and y > 610:
            continue
        length = rng.randint(16, 58)
        col = mix(p["leaf"], p["leaf2"], rng.random() * 0.7)
        brush_stroke(d, rng, x, y, x + rng.randint(-18, 18), y - length, col, rng.randint(1, 3), rng.randint(130, 230), steps=3)
    for i in range(70):
        x = rng.choice([rng.randint(75, 420), rng.randint(1130, 1510)])
        y = rng.randint(610, 830)
        flower = rng.choice([(255, 213, 84), (114, 201, 255), (247, 255, 233), (255, 148, 70)])
        d.ellipse((x - 6, y - 4, x + 6, y + 4), fill=rgba(flower, 220))
    # Painterly highlight pass
    hl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl, "RGBA")
    for i in range(240):
        x = rng.randint(0, W)
        y = rng.randint(70, 730)
        hd.ellipse((x - 2, y - 2, x + 2, y + 2), fill=rgba((240, 255, 190), rng.randint(45, 140)))
    for i in range(90):
        x = rng.randint(0, W)
        y = rng.randint(120, 760)
        brush_stroke(hd, rng, x, y, x + rng.randint(-70, 70), y + rng.randint(-18, 18), mix(p["leaf2"], (255, 255, 200), 0.45), rng.randint(2, 6), rng.randint(22, 58), steps=4)
    overlay(img, hl, blur=0.2)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=4))
    img.save(path)


def draw_theme_scene(path: Path, env, seed):
    motif = env["motif"]
    tone = tuple(int(env["tone"].lstrip("#")[i:i+2], 16) for i in (0, 2, 4))
    accent = tuple(int(env["accent"].lstrip("#")[i:i+2], 16) for i in (0, 2, 4))
    ground = tuple(int(env["ground"].lstrip("#")[i:i+2], 16) for i in (0, 2, 4))

    if motif == "forest":
        draw_forest_scene(path, seed)
        return

    # Reuse the layered landscape composition for the other elements, with motif-specific silhouettes.
    rng = random.Random(seed)
    img = gradient(mix(tone, (230, 245, 255), 0.55), mix(ground, (0, 0, 0), 0.18))
    d = ImageDraw.Draw(img, "RGBA")
    draw_sunbeams(img, accent, seed + 3, 6)
    draw_mist(img, mix(accent, (255, 255, 255), 0.25), seed + 4, 5)

    for ybase, alpha, sc in [(420, 100, 0.8), (560, 140, 1.0)]:
        pts = [(0, H)]
        for x in range(-80, W + 120, 140):
            pts.append((x, ybase + rng.randint(-70, 45)))
        pts.append((W, H))
        poly(d, pts, rgba(mix(ground, tone, 0.18 * sc), alpha))

    if motif in {"lake", "ice", "sky"}:
        water = [(0, H), (0, 640), (330, 600), (650, 635), (1030, 590), (W, 625), (W, H)]
        poly(d, water, rgba(mix(tone, accent, 0.45), 190))
        for i in range(26):
            y = 650 + i * 9
            d.arc((100 + i * 18, y, W - 120 - i * 9, y + 45), 190, 350, fill=rgba((235, 255, 255), 64), width=2)
    elif motif == "lava":
        river = [(620, 510), (760, 560), (850, 680), (930, H), (620, H), (670, 700), (590, 600)]
        poly(d, river, rgba((255, 83, 24), 235))
        for i in range(35):
            x = rng.randint(580, 980)
            y = rng.randint(560, 880)
            d.line((x, y, x + rng.randint(-90, 90), y + rng.randint(8, 38)), fill=rgba((255, 232, 89), 120), width=rng.randint(2, 5))
    else:
        path_pts = [(0, H), (360, 660), (700, 590), (920, 635), (1220, H)]
        poly(d, path_pts, rgba(mix(ground, accent, 0.24), 175))

    for i in range(34):
        x = rng.randint(20, W - 20)
        base_y = rng.randint(500, 880)
        h = rng.randint(75, 270)
        w = rng.randint(28, 90)
        if motif in {"mecha", "grid"}:
            d.rounded_rectangle((x, base_y - h, x + w, H), radius=6, fill=rgba(mix(tone, (20, 20, 30), 0.35), rng.randint(120, 210)))
            for yy in range(base_y - h + 18, base_y, 34):
                d.line((x + 8, yy, x + w - 8, yy), fill=rgba(accent, 90), width=2)
        elif motif in {"ruin", "royal", "holy", "light", "mystic", "blade"}:
            d.polygon([(x, base_y), (x + w // 2, base_y - h), (x + w, base_y)], fill=rgba(mix(tone, ground, 0.35), rng.randint(120, 205)))
            d.line((x + w // 2, base_y - h, x + w // 2, base_y), fill=rgba(accent, 95), width=3)
        elif motif in {"storm", "dragon", "dark"}:
            d.line((x, base_y, x + rng.randint(-80, 80), base_y - h), fill=rgba(mix(tone, accent, 0.3), rng.randint(130, 230)), width=rng.randint(7, 18))
        else:
            d.ellipse((x - w, base_y - h, x + w, base_y + h // 3), fill=rgba(mix(tone, accent, 0.28), rng.randint(92, 180)))

    # Motif-specific effects.
    fx = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(fx, "RGBA")
    for i in range(160):
        x = rng.randint(0, W)
        y = rng.randint(60, 830)
        r = rng.randint(1, 4)
        fd.ellipse((x - r, y - r, x + r, y + r), fill=rgba(accent, rng.randint(40, 145)))
    if motif in {"storm", "sky"}:
        for i in range(9):
            x = rng.randint(160, 1450)
            pts = [(x, rng.randint(60, 220)), (x - 30, rng.randint(220, 380)), (x + 25, rng.randint(360, 520)), (x - 35, rng.randint(520, 700))]
            fd.line(pts, fill=rgba(accent, 150), width=4)
    if motif == "grid":
        for x in range(0, W, 80):
            fd.line((x, 0, x, H), fill=rgba(accent, 34), width=1)
        for y in range(0, H, 64):
            fd.line((0, y, W, y), fill=rgba(accent, 28), width=1)
    overlay(img, fx, blur=0.3)
    img = img.filter(ImageFilter.UnsharpMask(radius=1.1, percent=112, threshold=4))
    img.save(path)


ENVIRONMENTS = [
    {"element": "木系", "tone": "#22c55e", "accent": "#bef264", "ground": "#14532d", "motif": "forest"},
    {"element": "水系", "tone": "#0ea5e9", "accent": "#67e8f9", "ground": "#075985", "motif": "lake"},
    {"element": "火系", "tone": "#f97316", "accent": "#fde047", "ground": "#7f1d1d", "motif": "lava"},
    {"element": "土系", "tone": "#a16207", "accent": "#facc15", "ground": "#422006", "motif": "crystal"},
    {"element": "冰系", "tone": "#38bdf8", "accent": "#e0f2fe", "ground": "#0c4a6e", "motif": "ice"},
    {"element": "电系", "tone": "#facc15", "accent": "#a78bfa", "ground": "#312e81", "motif": "storm"},
    {"element": "数码系", "tone": "#22d3ee", "accent": "#34d399", "ground": "#042f2e", "motif": "grid"},
    {"element": "机械系", "tone": "#94a3b8", "accent": "#38bdf8", "ground": "#334155", "motif": "mecha"},
    {"element": "神秘系", "tone": "#a855f7", "accent": "#f0abfc", "ground": "#3b0764", "motif": "mystic"},
    {"element": "飞行系", "tone": "#60a5fa", "accent": "#f8fafc", "ground": "#1d4ed8", "motif": "sky"},
    {"element": "爬行系", "tone": "#84cc16", "accent": "#fbbf24", "ground": "#365314", "motif": "vine"},
    {"element": "上古系", "tone": "#f59e0b", "accent": "#fde68a", "ground": "#78350f", "motif": "ruin"},
    {"element": "格斗系", "tone": "#ef4444", "accent": "#fed7aa", "ground": "#7f1d1d", "motif": "arena"},
    {"element": "暗黑系", "tone": "#6366f1", "accent": "#c084fc", "ground": "#111827", "motif": "dark"},
    {"element": "光明系", "tone": "#fef08a", "accent": "#ffffff", "ground": "#b45309", "motif": "light"},
    {"element": "龙系", "tone": "#14b8a6", "accent": "#fb7185", "ground": "#134e4a", "motif": "dragon"},
    {"element": "圣灵系", "tone": "#f9a8d4", "accent": "#fef3c7", "ground": "#831843", "motif": "holy"},
    {"element": "神兵系", "tone": "#eab308", "accent": "#e5e7eb", "ground": "#44403c", "motif": "blade"},
    {"element": "王系", "tone": "#f59e0b", "accent": "#fef3c7", "ground": "#581c87", "motif": "royal"},
]


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for idx, env in enumerate(ENVIRONMENTS):
        draw_theme_scene(OUT_DIR / f"{env['element']}.png", env, 20260520 + idx * 97)


if __name__ == "__main__":
    main()
