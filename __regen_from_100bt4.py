import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd


def norm_text(v: Any) -> str:
    if v is None:
        return ""
    # pandas/openpyxl may surface empty cells as NaN; treat them as empty text.
    if isinstance(v, float) and pd.isna(v):
        return ""
    s = str(v).replace("\xa0", " ").replace("\ufeff", "").strip()
    if s.lower() == "nan":
        return ""
    return s


def to_int(v: Any, default: int = 0) -> int:
    s = norm_text(v)
    m = re.search(r"-?\d+", s)
    return int(m.group(0)) if m else default


def parse_id_set(v: Any) -> List[int]:
    return [int(x) for x in re.findall(r"\d+", norm_text(v))]


def split_attr_type(v: str) -> (str, str):
    s = norm_text(v)
    if not s:
        return "", ""
    s = s.replace("／", "/").replace(" ", "")
    if "/" in s:
        a, b = s.split("/", 1)
        return a, b
    return s, ""


in_path = next(x for x in Path('.').glob('*原系亚比_100bt_编号_技能_种族值(4).xlsx') if not x.name.startswith('~$'))
out_path = Path('yabi_info_regenerated_from_100bt_4.xlsx')
out_json = Path('yabi_info_regenerated_from_100bt_4.json')

# Read sheets
skill_df = pd.read_excel(in_path, sheet_name=1)
race_df = pd.read_excel(in_path, sheet_name=2)

# Resolve columns by index (1-based -> 0-based)
# Skill sheet:
# A:亚比名 B:页面标题 C:详情链接 D:编号集合 E:表格序号 F:表格标题
# G-L mostly: G技能名 H学习等级 I威力 J使用次数 K技能属性 L攻击类型
# DN-DS fallback: DN技能名 DO攻击类型 DP技能属性 DQ使用次数 DR学习等级 DS技能描述
idx_skill_ids = 3
idx_g_name, idx_g_level, idx_g_power, idx_g_pp, idx_g_attr, idx_g_type = 6, 7, 8, 9, 10, 11
idx_dn_name, idx_dn_type, idx_dn_attr, idx_dn_pp, idx_dn_level, idx_dn_desc = 117, 118, 119, 120, 121, 122

skills_by_id: Dict[int, List[Dict[str, Any]]] = defaultdict(list)

for _, row in skill_df.iterrows():
    ids = parse_id_set(row.iloc[idx_skill_ids] if idx_skill_ids < len(row) else "")
    if not ids:
        continue

    # Pick source block: prefer G-L if skill name exists, else DN-DS
    name = norm_text(row.iloc[idx_g_name] if idx_g_name < len(row) else "")
    level = row.iloc[idx_g_level] if idx_g_level < len(row) else None
    power = row.iloc[idx_g_power] if idx_g_power < len(row) else None
    pp = row.iloc[idx_g_pp] if idx_g_pp < len(row) else None
    attr = norm_text(row.iloc[idx_g_attr] if idx_g_attr < len(row) else "")
    atk_type = norm_text(row.iloc[idx_g_type] if idx_g_type < len(row) else "")
    desc = norm_text(row.iloc[11] if 11 < len(row) else "")  # L列
    source = "g"

    if not name:
        name = norm_text(row.iloc[idx_dn_name] if idx_dn_name < len(row) else "")
        level = row.iloc[idx_dn_level] if idx_dn_level < len(row) else None
        # DN-DS块通常没有独立威力列；部分页面会在K列（idx_g_attr）出现威力数字，尝试兜底读取。
        power = to_int(row.iloc[idx_g_attr] if idx_g_attr < len(row) else None, -1)
        pp = row.iloc[idx_dn_pp] if idx_dn_pp < len(row) else None
        attr = norm_text(row.iloc[idx_dn_attr] if idx_dn_attr < len(row) else "")
        atk_type = norm_text(row.iloc[idx_dn_type] if idx_dn_type < len(row) else "")
        desc = norm_text(row.iloc[idx_dn_desc] if idx_dn_desc < len(row) else "")
        source = "dn"

    if not name:
        continue
    if name in {"技能名称", "技能名", "亚比技能"}:
        continue

    # If attr/type is combined in one cell, split it
    a1, t1 = split_attr_type(attr)
    if t1:
        attr = a1
        atk_type = t1
    if not atk_type and source == "g":
        # In this sheet, L列 often stores skill description, not attack type.
        # Fall back to combined attr/type split and keep empty when unavailable.
        atk_type = ""

    rec = {
        "技能名称": name,
        "获取等级": to_int(level, 0),
        "威力": to_int(power, 0),
        "PP值": max(0, to_int(pp, 0)),
        "技能属性": attr,
        "技能类型": atk_type,
        "技能描述": desc,
    }

    for sid in ids:
        skills_by_id[sid].append(rec)

# Deduplicate skills per id
for sid, arr in list(skills_by_id.items()):
    seen = set()
    out = []
    for it in arr:
        key = (
            it["技能名称"], it["获取等级"], it["威力"], it["PP值"],
            it["技能属性"], it["技能类型"], it["技能描述"],
        )
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
    skills_by_id[sid] = out

# Race sheet columns (0-based)
# 编号集合 at D(4)->3, race K-P (11-16)->10..15, last occurrence wins
idx_race_ids = 3
idx_hp, idx_atk, idx_def, idx_spa, idx_spd, idx_spe = 10, 11, 12, 13, 14, 15
races_by_id: Dict[int, Dict[str, int]] = {}

for _, row in race_df.iterrows():
    ids = parse_id_set(row.iloc[idx_race_ids] if idx_race_ids < len(row) else "")
    if not ids:
        continue

    vals = [to_int(row.iloc[c] if c < len(row) else None, -1) for c in (idx_hp, idx_atk, idx_def, idx_spa, idx_spd, idx_spe)]
    # 只保留K~P六列都是数字的行，过滤混入的表头/技能文本噪声
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
        races_by_id[sid] = race  # last occurrence overwrites

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

# Export
with pd.ExcelWriter(out_path, engine='openpyxl') as writer:
    pd.DataFrame(summary_rows).to_excel(writer, sheet_name='亚比总表', index=False)
    pd.DataFrame(skill_rows).to_excel(writer, sheet_name='技能表', index=False)
    pd.DataFrame(race_rows).to_excel(writer, sheet_name='种族值表', index=False)

out_json.write_text(json.dumps({
    "summary": summary_rows,
    "skills": skill_rows,
    "races": race_rows,
}, ensure_ascii=False, indent=2), encoding='utf-8')

print('done')
print('input=', in_path.name)
print('output_xlsx=', out_path.name)
print('output_json=', out_json.name)
print('total_ids=', len(all_ids))
print('ids_with_skills=', sum(1 for i in all_ids if i in skills_by_id))
print('ids_with_race=', sum(1 for i in all_ids if i in races_by_id))
print('skill_rows=', len(skill_rows))
print('race_rows=', len(race_rows))
