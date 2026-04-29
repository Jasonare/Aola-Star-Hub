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


in_path = next(x for x in Path('.').glob('*编号_技能_种族值(6).xlsx') if not x.name.startswith('~$'))
out_xlsx = Path('yabi_info_regenerated_from_100bt_6.xlsx')
out_json = Path('yabi_info_regenerated_from_100bt_6.json')

skill_df = pd.read_excel(in_path, sheet_name=1)
race_df = pd.read_excel(in_path, sheet_name=2)

# skill columns (0-based)
# D编号集合=3
# G-L: 6..11 (G技能名 H等级 I威力 JPP K属性/类型 L描述)
# DO-DT: 118..123 (DO技能名 DP攻击类型 DQ技能属性 DR使用次数 DS学习等级 DT特殊效果)
idx_ids = 3
idx_g_name, idx_g_level, idx_g_power, idx_g_pp, idx_g_attr_type, idx_g_desc = 6, 7, 8, 9, 10, 11
idx_do_name, idx_dp_type, idx_dq_attr, idx_dr_pp, idx_ds_level, idx_dt_desc = 118, 119, 120, 121, 122, 123

skills_by_id: Dict[int, List[Dict[str, Any]]] = defaultdict(list)

for _, row in skill_df.iterrows():
    ids = parse_id_set(row.iloc[idx_ids] if idx_ids < len(row) else "")
    if not ids:
        continue

    # prefer G-L
    name = norm_text(row.iloc[idx_g_name] if idx_g_name < len(row) else "")
    level = row.iloc[idx_g_level] if idx_g_level < len(row) else None
    power = row.iloc[idx_g_power] if idx_g_power < len(row) else None
    pp = row.iloc[idx_g_pp] if idx_g_pp < len(row) else None
    attr_type = norm_text(row.iloc[idx_g_attr_type] if idx_g_attr_type < len(row) else "")
    desc = norm_text(row.iloc[idx_g_desc] if idx_g_desc < len(row) else "")

    attr = ""
    atk_type = ""
    a, t = split_attr_type(attr_type)
    if a:
        attr = a
    if t:
        atk_type = t

    source = 'g'

    if not name:
        # fallback DO-DT
        name = norm_text(row.iloc[idx_do_name] if idx_do_name < len(row) else "")
        level = row.iloc[idx_ds_level] if idx_ds_level < len(row) else None
        power = -1  # fallback block has no dedicated power
        pp = row.iloc[idx_dr_pp] if idx_dr_pp < len(row) else None
        atk_type = norm_text(row.iloc[idx_dp_type] if idx_dp_type < len(row) else "")
        attr = norm_text(row.iloc[idx_dq_attr] if idx_dq_attr < len(row) else "")
        desc = norm_text(row.iloc[idx_dt_desc] if idx_dt_desc < len(row) else "")
        source = 'do'

    if not name:
        continue

    if name in {"技能名称", "技能名", "亚比技能"}:
        continue
    if any(k in name for k in ["推荐", "学习力", "性格", "配招", "获取方式", "练级"]):
        continue

    if not attr and not atk_type and source == 'g':
        # some rows put combined value elsewhere; keep empty if none
        pass

    rec = {
        "技能名称": name,
        "获取等级": max(0, to_int(level, 0)),
        "威力": to_int(power, 0),
        "PP值": max(0, to_int(pp, 0)),
        "技能属性": attr,
        "技能类型": atk_type,
        "技能描述": desc,
    }

    for sid in ids:
        skills_by_id[sid].append(rec)

# dedup+sort
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

# race: D=3, K-P=10..15, last valid row wins
idx_race_ids = 3
idx_hp, idx_atk, idx_def, idx_spa, idx_spd, idx_spe = 10, 11, 12, 13, 14, 15
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
        races_by_id[sid] = race

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
