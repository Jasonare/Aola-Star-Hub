import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List
import pandas as pd

in_path = next(x for x in Path('.').glob('*原系亚比_100bt_编号_技能_种族值.xlsx') if not x.name.startswith('~$') and '(4)' not in x.name and '(6)' not in x.name)
out_xlsx = Path('yabi_info_regenerated_from_100bt.xlsx')
out_json = Path('yabi_info_regenerated_from_100bt.json')

def norm(v: Any) -> str:
    if v is None:
        return ''
    if isinstance(v, float) and pd.isna(v):
        return ''
    s = str(v).replace('\xa0', ' ').replace('\ufeff', '').strip()
    return '' if s.lower() == 'nan' else s

def to_int(v: Any, d: int = 0) -> int:
    m = re.search(r'-?\d+', norm(v))
    return int(m.group(0)) if m else d

def parse_ids(v: Any) -> List[int]:
    return [int(x) for x in re.findall(r'\d+', norm(v))]

def split_attr_type(v: Any):
    s = norm(v).replace('／', '/').replace(' ', '')
    if not s:
        return '', ''
    if '/' in s:
        a, b = s.split('/', 1)
        return a, b
    return s, ''

skill_df = pd.read_excel(in_path, sheet_name=1)
race_df = pd.read_excel(in_path, sheet_name=2)

# sheet2 fixed columns
idx_ids = 3
idx_name, idx_lv, idx_pw, idx_pp, idx_at, idx_desc = 6, 7, 8, 9, 10, 11

skills_by_id: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
for _, row in skill_df.iterrows():
    ids = parse_ids(row.iloc[idx_ids] if idx_ids < len(row) else '')
    if not ids:
        continue
    name = norm(row.iloc[idx_name] if idx_name < len(row) else '')
    if not name:
        continue
    if name in {'技能名称', '技能名', '亚比技能'}:
        continue
    if any(k in name for k in ['推荐', '学习力', '性格', '配招', '获取方式', '练级']):
        continue
    attr, typ = split_attr_type(row.iloc[idx_at] if idx_at < len(row) else '')
    rec = {
        '技能名称': name,
        '获取等级': max(0, to_int(row.iloc[idx_lv] if idx_lv < len(row) else None, 0)),
        '威力': to_int(row.iloc[idx_pw] if idx_pw < len(row) else None, 0),
        'PP值': max(0, to_int(row.iloc[idx_pp] if idx_pp < len(row) else None, 0)),
        '技能属性': attr,
        '技能类型': typ,
        '技能描述': norm(row.iloc[idx_desc] if idx_desc < len(row) else ''),
    }
    for sid in ids:
        skills_by_id[sid].append(rec)

for sid, arr in list(skills_by_id.items()):
    seen = set(); out = []
    for it in arr:
        key = (it['技能名称'], it['获取等级'], it['威力'], it['PP值'], it['技能属性'], it['技能类型'], it['技能描述'])
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
    out.sort(key=lambda x: (x['获取等级'], x['技能名称']))
    skills_by_id[sid] = out

# sheet3: D编号集合(0-based3), K-P(0-based10..15)
idx_race_ids = 3
idx_hp, idx_atk, idx_def, idx_spa, idx_spd, idx_spe = 10, 11, 12, 13, 14, 15
races_by_id: Dict[int, Dict[str, int]] = {}

for _, row in race_df.iterrows():
    ids = parse_ids(row.iloc[idx_race_ids] if idx_race_ids < len(row) else '')
    if not ids:
        continue
    vals = [to_int(row.iloc[c] if c < len(row) else None, -1) for c in (idx_hp, idx_atk, idx_def, idx_spa, idx_spd, idx_spe)]
    if any(v < 0 for v in vals):
        continue
    race = {
        '体力': vals[0],
        '攻击': vals[1],
        '防御': vals[2],
        '特攻': vals[3],
        '特防': vals[4],
        '速度': vals[5],
    }
    for sid in ids:
        races_by_id[sid] = race

all_ids = sorted(set(skills_by_id.keys()) | set(races_by_id.keys()))
summary = []
skill_rows = []
race_rows = []

for sid in all_ids:
    sks = skills_by_id.get(sid, [])
    rc = races_by_id.get(sid, {})
    summary.append({'亚比ID': sid, '技能数': len(sks), '有种族值': 1 if rc else 0})
    for sk in sks:
        row = {'亚比ID': sid}
        row.update(sk)
        skill_rows.append(row)
    if rc:
        row = {'亚比ID': sid}
        row.update(rc)
        race_rows.append(row)

with pd.ExcelWriter(out_xlsx, engine='openpyxl') as w:
    pd.DataFrame(summary).to_excel(w, sheet_name='亚比总表', index=False)
    pd.DataFrame(skill_rows).to_excel(w, sheet_name='技能表', index=False)
    pd.DataFrame(race_rows).to_excel(w, sheet_name='种族值表', index=False)

out_json.write_text(json.dumps({'summary': summary, 'skills': skill_rows, 'races': race_rows}, ensure_ascii=False, indent=2), encoding='utf-8')

print('done')
print('input', in_path.name)
print('output_xlsx', out_xlsx.name)
print('total_ids', len(all_ids))
print('ids_with_skills', sum(1 for i in all_ids if i in skills_by_id))
print('ids_with_race', sum(1 for i in all_ids if i in races_by_id))
print('skill_rows', len(skill_rows))
print('race_rows', len(race_rows))
print('sample_race_ids', sorted(list(races_by_id.keys()))[:40])
