#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import re
import subprocess
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Set

from openpyxl import load_workbook


ROOT = Path(".")
IN_XLSX = ROOT / "yabi_100bt_processed_v3.xlsx"
OUT_XLSX = ROOT / "yabi_100bt_processed_v4.xlsx"
SPECIES_JS = ROOT / "aola-species-data.js"


def norm_text(v: Any) -> str:
    if v is None:
        return ""
    return str(v).replace("\xa0", " ").strip()


def parse_int(v: Any) -> int | None:
    m = re.search(r"-?\d+", norm_text(v))
    return int(m.group(0)) if m else None


def parse_id_set(v: Any) -> List[int]:
    s = norm_text(v)
    if not s:
        return []
    return [int(x) for x in re.findall(r"\d+", s)]


def normalize_numset(v: Any) -> str:
    ids = parse_id_set(v)
    if not ids:
        return ""
    return ",".join(str(x) for x in sorted(set(ids)))


def load_species_data_by_node(species_js: Path) -> Dict[str, Any]:
    from shutil import which

    candidates = [
        Path.home() / '.cache' / 'codex-runtimes' / 'codex-primary-runtime' / 'dependencies' / 'node' / 'bin' / 'node.exe',
        Path(r'C:\Program Files\nodejs\node.exe'),
    ]
    node = next((x for x in candidates if x.exists()), None)
    if node is None:
        w = which('node')
        if w:
            node = Path(w)
    if node is None:
        raise FileNotFoundError('?????? node.exe')

    script = r"""
const fs=require('fs');
const vm=require('vm');
const p=process.argv[1];
const code=fs.readFileSync(p,'utf8');
const ctx={window:{}};
vm.createContext(ctx);
vm.runInContext(code,ctx);
process.stdout.write(JSON.stringify(ctx.window.AOLA_SPECIES_DATA_BY_DEX||{}));
"""
    proc = subprocess.run(
        [str(node), '-e', script, str(species_js)],
        capture_output=True,
        text=True,
        encoding='utf-8',
        errors='replace',
        check=True,
    )
    return json.loads(proc.stdout)


def save_species_data(species_js: Path, data_obj: Dict[str, Any]) -> None:
    content = "(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = " + json.dumps(
        data_obj, ensure_ascii=False, indent=2
    ) + ";\n})();\n"
    species_js.write_text(content, encoding="utf-8")


def build_skill_type(attr: str, atk_type: str) -> str:
    a = norm_text(attr)
    t = norm_text(atk_type)
    if not a:
        a = "???"
    if a and not a.endswith("?"):
        a = f"{a}?"
    if not t:
        t = "????"
    return f"{a}/{t}"


def main() -> None:
    if not IN_XLSX.exists():
        raise FileNotFoundError(f"???????: {IN_XLSX}")
    if not SPECIES_JS.exists():
        raise FileNotFoundError(f"?????????: {SPECIES_JS}")

    wb = load_workbook(IN_XLSX)
    if len(wb.worksheets) < 3:
        raise ValueError("Excel ????? 3 ?")
    ws2 = wb.worksheets[1]  # ???
    ws3 = wb.worksheets[2]  # ????

    # ???????????
    # ws2: ??ID=2, ????=4, ???=9??????, ??????????
    # ws3: ??ID=1, ????=5, L~Q=12..17
    s2_col_id = 2
    s2_col_numset = 4
    s2_col_acc_fix = 9
    s2_col_skill_name = 8
    s2_col_level = 9
    s2_col_power = 10
    s2_col_pp = 11
    s2_col_acc = 12
    s2_col_attr_type = 13
    s2_col_desc = 14
    s2_col_atk_type = 16
    s2_col_attr = 17

    s3_col_id = 1
    s3_col_numset = 5
    s3_col_hp = 12
    s3_col_atk = 13
    s3_col_def = 14
    s3_col_spa = 15
    s3_col_spd = 16
    s3_col_spe = 17

    # 1) ???????? -> ID??????????ID
    numset_to_ids: Dict[str, Set[int]] = defaultdict(set)
    for r in range(2, ws3.max_row + 1):
        k = normalize_numset(ws3.cell(r, s3_col_numset).value)
        if not k:
            continue
        ids = [x for x in parse_id_set(ws3.cell(r, s3_col_id).value) if x <= 2370]
        for x in ids:
            numset_to_ids[k].add(x)

    s2_updated = 0
    s2_missing = 0
    acc_fixed = 0
    for r in range(2, ws2.max_row + 1):
        k = normalize_numset(ws2.cell(r, s2_col_numset).value)
        ids = sorted(numset_to_ids.get(k, set()))
        if ids:
            ws2.cell(r, s2_col_id).value = "[" + ",".join(str(x) for x in ids) + "]"
            s2_updated += 1
        else:
            ws2.cell(r, s2_col_id).value = ""
            s2_missing += 1

        # ???????????9????0?100
        n = parse_int(ws2.cell(r, s2_col_acc_fix).value)
        if n is not None and n < 0:
            ws2.cell(r, s2_col_acc_fix).value = 100
            acc_fixed += 1

    # 2) ?????ID???????????>2370
    s3_updated = 0
    for r in range(2, ws3.max_row + 1):
        k = normalize_numset(ws3.cell(r, s3_col_numset).value)
        ids = sorted(numset_to_ids.get(k, set()))
        ws3.cell(r, s3_col_id).value = ("[" + ",".join(str(x) for x in ids) + "]") if ids else ""
        if ids:
            s3_updated += 1

    wb.save(OUT_XLSX)

    # 3) ? v4 Excel ?? skills/race ???????? aola-species-data.js
    skills_by_id: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
    for r in range(2, ws2.max_row + 1):
        ids = parse_id_set(ws2.cell(r, s2_col_id).value)
        if not ids:
            continue
        name = norm_text(ws2.cell(r, s2_col_skill_name).value)
        if not name:
            continue

        lv = parse_int(ws2.cell(r, s2_col_level).value) or 0
        power = parse_int(ws2.cell(r, s2_col_power).value) or 0
        pp = parse_int(ws2.cell(r, s2_col_pp).value) or 0
        if pp < 0:
            pp = 0

        acc = parse_int(ws2.cell(r, s2_col_acc).value)
        if acc is None or acc < 0:
            acc = 100

        attr = norm_text(ws2.cell(r, s2_col_attr).value)
        atk_type = norm_text(ws2.cell(r, s2_col_atk_type).value)
        if not attr or not atk_type:
            combo = norm_text(ws2.cell(r, s2_col_attr_type).value)
            if "/" in combo:
                p1, p2 = combo.split("/", 1)
                if not attr:
                    attr = norm_text(p1)
                if not atk_type:
                    atk_type = norm_text(p2)

        desc = norm_text(ws2.cell(r, s2_col_desc).value)

        rec = {
            "name": name,
            "level": lv,
            "power": power,
            "pp": pp,
            "accuracy": acc,
            "type": build_skill_type(attr, atk_type),
            "desc": desc,
        }
        for i in ids:
            skills_by_id[i].append(rec)

    # ??
    for i, arr in list(skills_by_id.items()):
        seen = set()
        out = []
        for s in arr:
            key = (s["name"], s["level"], s["power"], s["pp"], s["accuracy"], s["type"], s["desc"])
            if key in seen:
                continue
            seen.add(key)
            out.append(s)
        skills_by_id[i] = out

    # race by id???ID????? L~Q
    races_by_id: Dict[int, Dict[str, int]] = {}
    for r in range(2, ws3.max_row + 1):
        ids = parse_id_set(ws3.cell(r, s3_col_id).value)
        if not ids:
            continue
        hp = parse_int(ws3.cell(r, s3_col_hp).value)
        atk = parse_int(ws3.cell(r, s3_col_atk).value)
        de = parse_int(ws3.cell(r, s3_col_def).value)
        sa = parse_int(ws3.cell(r, s3_col_spa).value)
        sd = parse_int(ws3.cell(r, s3_col_spd).value)
        sp = parse_int(ws3.cell(r, s3_col_spe).value)
        if None in (hp, atk, de, sa, sd, sp):
            continue
        race = {
            "hp": int(hp),
            "atk": int(atk),
            "def": int(de),
            "spAtk": int(sa),
            "spDef": int(sd),
            "speed": int(sp),
            "total": int(hp + atk + de + sa + sd + sp),
        }
        for i in ids:
            races_by_id[i] = race

    species = load_species_data_by_node(SPECIES_JS)

    updated_skill_species = 0
    updated_race_species = 0
    for sid, entry in species.items():
        i = parse_int(sid)
        if i is None:
            continue
        if i in skills_by_id and skills_by_id[i]:
            entry["skills"] = skills_by_id[i]
            updated_skill_species += 1
        if i in races_by_id:
            race = races_by_id[i]
            old = entry.get("raceStats") or {}
            entry["raceStats"] = {
                "id": str(i),
                "name": norm_text(old.get("name")) or norm_text(entry.get("name")),
                "hp": race["hp"],
                "atk": race["atk"],
                "def": race["def"],
                "spAtk": race["spAtk"],
                "spDef": race["spDef"],
                "speed": race["speed"],
                "total": race["total"],
            }
            updated_race_species += 1

    # ?????????????????????
    normalized_skill_total = 0
    for _, entry in species.items():
        skills = entry.get("skills")
        if not isinstance(skills, list):
            continue
        for sk in skills:
            acc = parse_int(sk.get("accuracy"))
            sk["accuracy"] = 100 if acc is None or acc < 0 else int(acc)

            t = norm_text(sk.get("type"))
            if "/" in t:
                left, right = t.split("/", 1)
                left = norm_text(left) or "???"
                if left and not left.endswith("?"):
                    left = f"{left}?"
                right = norm_text(right) or "????"
                sk["type"] = f"{left}/{right}"
            else:
                left = norm_text(t) or "???"
                if left and not left.endswith("?"):
                    left = f"{left}?"
                sk["type"] = f"{left}/????"
            normalized_skill_total += 1

    save_species_data(SPECIES_JS, species)

    print("done")
    print(f"in_xlsx={IN_XLSX.name}")
    print(f"out_xlsx={OUT_XLSX.name}")
    print(f"s2_updated={s2_updated}")
    print(f"s2_missing={s2_missing}")
    print(f"s2_acc_fix_col9={acc_fixed}")
    print(f"s3_updated={s3_updated}")
    print(f"species_skill_updated={updated_skill_species}")
    print(f"species_race_updated={updated_race_species}")
    print(f"skills_normalized={normalized_skill_total}")


if __name__ == "__main__":
    main()
