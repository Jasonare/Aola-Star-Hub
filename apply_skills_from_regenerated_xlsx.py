#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import json
import re
import subprocess
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Set

import pandas as pd


ROOT = Path(".")
SKILL_XLSX = ROOT / "yabi_info_regenerated_from_v3_fixed3.xlsx"
CHAIN_XLSX = ROOT / "yabi_100bt_processed_v3.xlsx"
SPECIES_JS = ROOT / "aola-species-data.js"


def norm_text(v: Any) -> str:
    if v is None:
        return ""
    return str(v).replace("\xa0", " ").strip()


def to_int(v: Any, default: int = 0) -> int:
    s = norm_text(v)
    m = re.search(r"-?\d+", s)
    return int(m.group(0)) if m else default


def parse_ids(v: Any) -> List[int]:
    return [int(x) for x in re.findall(r"\d+", norm_text(v))]


def find_node() -> Path:
    cands = [
        Path.home()
        / ".cache"
        / "codex-runtimes"
        / "codex-primary-runtime"
        / "dependencies"
        / "node"
        / "bin"
        / "node.exe",
        Path(r"C:\Program Files\nodejs\node.exe"),
    ]
    for p in cands:
        if p.exists():
            return p
    raise FileNotFoundError("未找到可用的 node.exe")


def load_species_by_node(path: Path) -> Dict[str, Any]:
    node = find_node()
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
        [str(node), "-e", script, str(path)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=True,
    )
    return json.loads(proc.stdout)


def save_species(path: Path, data: Dict[str, Any]) -> None:
    content = "(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = " + json.dumps(
        data, ensure_ascii=False, indent=2
    ) + ";\n})();\n"
    path.write_text(content, encoding="utf-8")


def normalize_element(s: str) -> str:
    t = norm_text(s)
    t = re.sub(r"[^A-Za-z\u4e00-\u9fff]", "", t)
    if not t:
        return "普通系"
    if t.endswith("系"):
        return t
    mapping = {
        "普通": "普通系",
        "木": "木系",
        "火": "火系",
        "水": "水系",
        "冰": "冰系",
        "土": "土系",
        "电": "电系",
        "光明": "光明系",
        "暗黑": "暗黑系",
        "神秘": "神秘系",
        "机械": "机械系",
        "飞行": "飞行系",
        "龙": "龙系",
        "上古": "上古系",
        "数码": "数码系",
        "格斗": "格斗系",
        "王": "王系",
        "神兵": "神兵系",
        "圣灵": "圣灵系",
        "爬行": "爬行系",
        "毒": "毒系",
    }
    return mapping.get(t, f"{t}系")


def normalize_attack_type(s: str) -> str:
    t = norm_text(s)
    if "特殊攻击" in t:
        return "特殊攻击"
    if "属性攻击" in t:
        return "属性攻击"
    if "普通攻击" in t:
        return "普通攻击"
    if "特殊" in t:
        return "特殊攻击"
    if "属性" in t:
        return "属性攻击"
    return "普通攻击"


def load_skills_from_fixed_xlsx(path: Path) -> Dict[int, List[Dict[str, Any]]]:
    df = pd.read_excel(path, sheet_name=1)
    required = ["亚比ID", "技能名称", "获取等级", "威力", "PP值", "命中率", "技能属性", "技能类型", "技能描述"]
    for c in required:
        if c not in df.columns:
            raise ValueError(f"技能表缺少列: {c}")

    by_id: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
    for _, row in df.iterrows():
        sid = to_int(row.get("亚比ID"), -1)
        if sid <= 0:
            continue
        name = norm_text(row.get("技能名称"))
        if not name:
            continue

        lv = to_int(row.get("获取等级"), 0)
        power = to_int(row.get("威力"), 0)
        pp = to_int(row.get("PP值"), 0)
        acc = to_int(row.get("命中率"), 100)
        if pp < 0:
            pp = 0
        if acc < 0:
            acc = 100

        attr = normalize_element(norm_text(row.get("技能属性")))
        atk_type = normalize_attack_type(norm_text(row.get("技能类型")))
        desc = norm_text(row.get("技能描述"))

        by_id[sid].append(
            {
                "name": name,
                "level": lv,
                "power": power,
                "pp": pp,
                "accuracy": acc,
                "type": f"{attr}/{atk_type}",
                "desc": desc,
            }
        )

    for sid, arr in list(by_id.items()):
        seen = set()
        uniq = []
        for sk in arr:
            key = (sk["name"], sk["level"], sk["power"], sk["pp"], sk["accuracy"], sk["type"], sk["desc"])
            if key in seen:
                continue
            seen.add(key)
            uniq.append(sk)
        by_id[sid] = uniq
    return by_id


def load_evolution_chains(path: Path) -> Dict[int, Set[int]]:
    df = pd.read_excel(path, sheet_name=1)
    if "页面标题" not in df.columns:
        raise ValueError("源技能表缺少页面标题列，无法构建形态链")

    chains: List[Set[int]] = []
    for v in df["页面标题"].tolist():
        ids = set(parse_ids(v))
        if not ids:
            continue
        chains.append(ids)

    merged: List[Set[int]] = []
    for cur in chains:
        placed = False
        for i, old in enumerate(merged):
            if cur & old:
                merged[i] = old | cur
                placed = True
                break
        if not placed:
            merged.append(set(cur))

    changed = True
    while changed:
        changed = False
        out: List[Set[int]] = []
        while merged:
            base = merged.pop()
            keep = []
            for s in merged:
                if base & s:
                    base |= s
                    changed = True
                else:
                    keep.append(s)
            merged = keep
            out.append(base)
        merged = out

    id_to_chain: Dict[int, Set[int]] = {}
    for c in merged:
        for sid in c:
            id_to_chain[sid] = c
    return id_to_chain


def main() -> None:
    if not SKILL_XLSX.exists():
        raise FileNotFoundError(f"未找到文件: {SKILL_XLSX}")
    if not CHAIN_XLSX.exists():
        raise FileNotFoundError(f"未找到文件: {CHAIN_XLSX}")
    if not SPECIES_JS.exists():
        raise FileNotFoundError(f"未找到文件: {SPECIES_JS}")

    skills_by_id = load_skills_from_fixed_xlsx(SKILL_XLSX)
    id_to_chain = load_evolution_chains(CHAIN_XLSX)

    # 同一只亚比不同形态技能一致：将同链路技能取并集，写给链上所有ID
    chain_skill_cache: Dict[str, List[Dict[str, Any]]] = {}

    def skills_for_id(sid: int) -> List[Dict[str, Any]]:
        chain = id_to_chain.get(sid)
        if not chain:
            return skills_by_id.get(sid, [])
        key = ",".join(str(x) for x in sorted(chain))
        if key in chain_skill_cache:
            return chain_skill_cache[key]
        merged: List[Dict[str, Any]] = []
        seen = set()
        for mid in sorted(chain):
            for sk in skills_by_id.get(mid, []):
                k = (sk["name"], sk["level"], sk["power"], sk["pp"], sk["accuracy"], sk["type"], sk["desc"])
                if k in seen:
                    continue
                seen.add(k)
                merged.append(sk)
        chain_skill_cache[key] = merged
        return merged

    species = load_species_by_node(SPECIES_JS)
    updated = 0
    untouched = 0
    for sid_str, entry in species.items():
        sid = to_int(sid_str, -1)
        if sid <= 0:
            continue
        merged_skills = skills_for_id(sid)
        if merged_skills:
            entry["skills"] = merged_skills
            updated += 1
        else:
            untouched += 1
        # 不改动 race / stats / 任何种族值字段

    save_species(SPECIES_JS, species)
    print("done")
    print(f"updated_species_skills={updated}")
    print(f"untouched_species={untouched}")
    print(f"source_skill_ids={len(skills_by_id)}")
    print(f"evolution_chains={len(chain_skill_cache)}")


if __name__ == "__main__":
    main()

