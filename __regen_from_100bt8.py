import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd


def norm_text(v: Any) -> str:
    if v is None:
        return ""
    if isinstance(v, float) and pd.isna(v):
        return ""
    s = str(v).replace("\ufeff", "").replace("\xa0", " ").strip()
    return "" if s.lower() == "nan" else s


def to_int(v: Any, default: int = 0) -> int:
    m = re.search(r"-?\d+", norm_text(v))
    return int(m.group(0)) if m else default


def parse_ids(v: Any) -> List[int]:
    return [int(x) for x in re.findall(r"\d+", norm_text(v))]


def is_noise_skill(name: str) -> bool:
    s = re.sub(r"\s+|[：:·\-—_\|丨/\\]+", "", norm_text(name))
    if not s:
        return True
    if s in {"技能名", "技能名称", "亚比技能"}:
        return True
    return any(k in s for k in ["推荐", "学习力", "性格", "配招", "获取方式", "练级"])


in_path = Path("原系亚比_100bt_编号_技能_种族值(8).xlsx")
out_xlsx = Path("yabi_info_regenerated_from_100bt_8.xlsx")
out_json = Path("yabi_info_regenerated_from_100bt_8.json")

if not in_path.exists():
    raise FileNotFoundError(in_path)

skill_df = pd.read_excel(in_path, sheet_name=1)
race_df = pd.read_excel(in_path, sheet_name=2)

# 技能表: 编号集合=D(4)->idx3
# 大多数在 G-L，但该文件实际为 G-M:
# G技能名(6), H攻击类型(7), I技能属性(8), J威力(9), K使用次数(10), L学习等级(11), M特殊效果(12)
idx_skill_ids = 3
idx_name, idx_type, idx_attr = 6, 7, 8
idx_power, idx_pp, idx_level, idx_desc = 9, 10, 11, 12

skills_by_id: Dict[int, List[Dict[str, Any]]] = defaultdict(list)

for _, row in skill_df.iterrows():
    ids = parse_ids(row.iloc[idx_skill_ids] if idx_skill_ids < len(row) else "")
    if not ids:
        continue

    name = norm_text(row.iloc[idx_name] if idx_name < len(row) else "")
    if is_noise_skill(name):
        continue

    rec = {
        "技能名称": name,
        "获取等级": max(0, to_int(row.iloc[idx_level] if idx_level < len(row) else None, 0)),
        "威力": max(0, to_int(row.iloc[idx_power] if idx_power < len(row) else None, 0)),
        "PP值": max(0, to_int(row.iloc[idx_pp] if idx_pp < len(row) else None, 0)),
        "技能属性": norm_text(row.iloc[idx_attr] if idx_attr < len(row) else ""),
        "技能类型": norm_text(row.iloc[idx_type] if idx_type < len(row) else ""),
        "技能描述": norm_text(row.iloc[idx_desc] if idx_desc < len(row) else ""),
    }

    for sid in ids:
        skills_by_id[sid].append(rec)

# 去重+排序
for sid, arr in list(skills_by_id.items()):
    seen = set()
    out = []
    for it in arr:
        key = (
            it["技能名称"],
            it["获取等级"],
            it["威力"],
            it["PP值"],
            it["技能属性"],
            it["技能类型"],
            it["技能描述"],
        )
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
    out.sort(key=lambda x: (x["获取等级"], x["技能名称"]))
    skills_by_id[sid] = out

# 种族值表: 编号集合=D(4)->idx3
# 用户指定 I-N -> idx8..13: 体力,攻击,防御,特攻,特防,速度
idx_race_ids = 3
idx_hp, idx_atk, idx_def, idx_spa, idx_spd, idx_spe = 8, 9, 10, 11, 12, 13

races_by_id: Dict[int, Dict[str, int]] = {}

for _, row in race_df.iterrows():
    ids = parse_ids(row.iloc[idx_race_ids] if idx_race_ids < len(row) else "")
    if not ids:
        continue

    vals = [
        to_int(row.iloc[idx_hp] if idx_hp < len(row) else None, -1),
        to_int(row.iloc[idx_atk] if idx_atk < len(row) else None, -1),
        to_int(row.iloc[idx_def] if idx_def < len(row) else None, -1),
        to_int(row.iloc[idx_spa] if idx_spa < len(row) else None, -1),
        to_int(row.iloc[idx_spd] if idx_spd < len(row) else None, -1),
        to_int(row.iloc[idx_spe] if idx_spe < len(row) else None, -1),
    ]
    if any(v < 0 for v in vals):
        continue

    race = {
        "体力": vals[0],
        "攻击": vals[1],
        "防御": vals[2],
        "特攻": vals[3],
        "特防": vals[4],
        "速度": vals[5],
    }
    for sid in ids:
        races_by_id[sid] = race  # 最后一行覆盖

all_ids = sorted(set(skills_by_id.keys()) | set(races_by_id.keys()))

summary_rows = []
skill_rows = []
race_rows = []

for sid in all_ids:
    sks = skills_by_id.get(sid, [])
    race = races_by_id.get(sid, {})
    summary_rows.append({"亚比ID": sid, "技能数": len(sks), "有种族值": 1 if race else 0})

    for sk in sks:
        row = {"亚比ID": sid}
        row.update(sk)
        skill_rows.append(row)

    if race:
        row = {"亚比ID": sid}
        row.update(race)
        race_rows.append(row)

with pd.ExcelWriter(out_xlsx, engine="openpyxl") as writer:
    pd.DataFrame(summary_rows).to_excel(writer, sheet_name="亚比总表", index=False)
    pd.DataFrame(skill_rows).to_excel(writer, sheet_name="技能表", index=False)
    pd.DataFrame(race_rows).to_excel(writer, sheet_name="种族值表", index=False)

out_json.write_text(
    json.dumps({"summary": summary_rows, "skills": skill_rows, "races": race_rows}, ensure_ascii=False, indent=2),
    encoding="utf-8",
)

print("done")
print("input=", in_path.name)
print("output_xlsx=", out_xlsx.name)
print("output_json=", out_json.name)
print("total_ids=", len(all_ids))
print("ids_with_skills=", sum(1 for i in all_ids if i in skills_by_id))
print("ids_with_race=", sum(1 for i in all_ids if i in races_by_id))
print("skill_rows=", len(skill_rows))
print("race_rows=", len(race_rows))
