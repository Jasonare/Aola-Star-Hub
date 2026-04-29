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
    s = str(v).replace("\xa0", " ").replace("\ufeff", "").strip()
    return "" if s.lower() == "nan" else s


def to_int(v: Any, default: int = 0) -> int:
    m = re.search(r"-?\d+", norm_text(v))
    return int(m.group(0)) if m else default


def parse_id_set(v: Any) -> List[int]:
    return [int(x) for x in re.findall(r"\d+", norm_text(v))]


def split_attr_type(v: str):
    s = norm_text(v).replace("／", "/").replace(" ", "")
    if not s:
        return "", ""
    if "/" in s:
        a, b = s.split("/", 1)
        return a, b
    return s, ""


in_path = Path('原系亚比_100bt_编号_技能_种族值.xlsx')
out_xlsx = Path('yabi_info_regenerated_from_100bt.xlsx')
out_json = Path('yabi_info_regenerated_from_100bt.json')

if not in_path.exists():
    raise FileNotFoundError(in_path)

skill_df = pd.read_excel(in_path, sheet_name=1)
race_df = pd.read_excel(in_path, sheet_name=2)

# skill parse: only use G-L block per request
idx_ids = 3
idx_name, idx_level, idx_power, idx_pp, idx_attr_type, idx_desc = 6, 7, 8, 9, 10, 11

skills_by_id: Dict[int, List[Dict[str, Any]]] = defaultdict(list)

for _, row in skill_df.iterrows():
    ids = parse_id_set(row.iloc[idx_ids] if idx_ids < len(row) else "")
    if not ids:
        continue

    name = norm_text(row.iloc[idx_name] if idx_name < len(row) else "")
    level = row.iloc[idx_level] if idx_level < len(row) else None
    power = row.iloc[idx_power] if idx_power < len(row) else None
    pp = row.iloc[idx_pp] if idx_pp < len(row) else None
    attr_type = norm_text(row.iloc[idx_attr_type] if idx_attr_type < len(row) else "")
    desc = norm_text(row.iloc[idx_desc] if idx_desc < len(row) else "")

    if not name:
        continue
    if name in {"技能名称", "技能名", "亚比技能"}:
        continue
    if any(k in name for k in ["推荐", "学习力", "性格", "配招", "获取方式", "练级"]):
        continue

    attr, atk_type = split_attr_type(attr_type)

    rec = {
        "技能名称": name,
        "获取等级": max(0, to_int(level, 0)),  # 等级=获取等级
        "威力": to_int(power, 0),
        "PP值": max(0, to_int(pp, 0)),
        "技能属性": attr,
        "技能类型": atk_type,
        "技能描述": desc,
    }

    for sid in ids:
        skills_by_id[sid].append(rec)

# dedup + sort
for sid, arr in list(skills_by_id.items()):
    seen = set()
    out = []
    for it in arr:
        key = (it["技能名称"], it["获取等级"], it["威力"], it["PP值"], it["技能属性"], it["技能类型"], it["技能描述"])
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
    out.sort(key=lambda x: (x["获取等级"], x["技能名称"]))
    skills_by_id[sid] = out

# race parse: 编号集合重复时，取最后一条有效K-P
idx_race_ids = 4  # this sheet has 编号集合 at col5(0-based 4)
idx_hp, idx_atk, idx_def, idx_spa, idx_spd, idx_spe = 10, 11, 12, 13, 14, 15  # K-P
races_by_id: Dict[int, Dict[str, int]] = {}

for _, row in race_df.iterrows():
    ids = parse_id_set(row.iloc[idx_race_ids] if idx_race_ids < len(row) else "")
    if not ids:
        continue

    vals = [to_int(row.iloc[c] if c < len(row) else None, -1) for c in (idx_hp, idx_atk, idx_def, idx_spa, idx_spd, idx_spe)]
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
        races_by_id[sid] = race  # last valid row wins

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

with pd.ExcelWriter(out_xlsx, engine='openpyxl') as writer:
    pd.DataFrame(summary_rows).to_excel(writer, sheet_name='亚比总表', index=False)
    pd.DataFrame(skill_rows).to_excel(writer, sheet_name='技能表', index=False)
    pd.DataFrame(race_rows).to_excel(writer, sheet_name='种族值表', index=False)

out_json.write_text(json.dumps({'summary': summary_rows, 'skills': skill_rows, 'races': race_rows}, ensure_ascii=False, indent=2), encoding='utf-8')

print('done')
print('input=', in_path.name)
print('output_xlsx=', out_xlsx.name)
print('output_json=', out_json.name)
print('total_ids=', len(all_ids))
print('ids_with_skills=', sum(1 for i in all_ids if i in skills_by_id))
print('ids_with_race=', sum(1 for i in all_ids if i in races_by_id))
print('skill_rows=', len(skill_rows))
print('race_rows=', len(race_rows))
