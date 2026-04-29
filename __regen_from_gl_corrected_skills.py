import json
import re
from pathlib import Path
from collections import defaultdict

import pandas as pd

src = Path(r"C:\工作娱乐\Aola-Star-Hub\原系亚比_100bt_编号_技能_种族值_skill_retry_v3_GL校正.xlsx")
out_xlsx = Path(r"C:\工作娱乐\Aola-Star-Hub\yabi_info_regenerated_from_100bt_skill_retry_v3_gl.xlsx")
out_json = Path(r"C:\工作娱乐\Aola-Star-Hub\yabi_info_regenerated_from_100bt_skill_retry_v3_gl.json")

s0 = pd.read_excel(src, sheet_name=0)
s1 = pd.read_excel(src, sheet_name=1)


def norm(v):
    if v is None:
        return ""
    s = str(v).replace("\ufeff", "").replace("\xa0", " ").strip()
    return "" if s.lower() == "nan" else s


def to_int(v, d=0):
    m = re.search(r"-?\d+", norm(v))
    return int(m.group(0)) if m else d


def parse_ids(v):
    return [int(x) for x in re.findall(r"\d+", norm(v))]


# skill sheet columns (mapped to G-L semantics)
c_ids = next((c for c in s1.columns if '编号集合' in str(c)), None)
c_name = next((c for c in s1.columns if str(c) == '技能名称'), None)
c_lv = next((c for c in s1.columns if str(c) in ('等级','获取等级','学习等级')), None)
c_power = next((c for c in s1.columns if str(c) == '威力'), None)
c_pp = next((c for c in s1.columns if str(c) in ('PP','PP值','使用次数')), None)
c_attr_type = next((c for c in s1.columns if str(c) == '技能属性/类型'), None)
c_desc = next((c for c in s1.columns if str(c) in ('技能描述','特殊效果')), None)

if not all([c_ids, c_name, c_lv, c_power, c_pp, c_attr_type, c_desc]):
    raise RuntimeError(f"列缺失: ids={c_ids}, name={c_name}, lv={c_lv}, power={c_power}, pp={c_pp}, attrType={c_attr_type}, desc={c_desc}")

skills_by_id = defaultdict(list)

for _, r in s1.iterrows():
    ids = parse_ids(r.get(c_ids))
    if not ids:
        continue

    name = norm(r.get(c_name))
    if not name or name in ('技能名称','技能名','亚比技能'):
        continue

    rec = {
        '技能名称': name,
        '获取等级': max(0, to_int(r.get(c_lv), 0)),
        '威力': to_int(r.get(c_power), 0),
        'PP值': max(0, to_int(r.get(c_pp), 0)),
        '技能属性/技能类型': norm(r.get(c_attr_type)),
        '技能描述': norm(r.get(c_desc)),
    }

    for sid in ids:
        skills_by_id[sid].append(rec)

# dedup & sort per id
for sid, arr in list(skills_by_id.items()):
    seen = set()
    out = []
    for it in arr:
        key = (
            it['技能名称'], it['获取等级'], it['威力'], it['PP值'],
            it['技能属性/技能类型'], it['技能描述']
        )
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
    out.sort(key=lambda x: (x['获取等级'], x['技能名称']))
    skills_by_id[sid] = out

all_ids = sorted(skills_by_id.keys())

summary_rows = []
skill_rows = []
for sid in all_ids:
    sks = skills_by_id.get(sid, [])
    summary_rows.append({'亚比ID': sid, '技能数': len(sks)})
    for sk in sks:
        row = {'亚比ID': sid}
        row.update(sk)
        skill_rows.append(row)

with pd.ExcelWriter(out_xlsx, engine='openpyxl') as w:
    pd.DataFrame(summary_rows).to_excel(w, sheet_name='亚比总表', index=False)
    pd.DataFrame(skill_rows).to_excel(w, sheet_name='技能表', index=False)

out_json.write_text(
    json.dumps({'summary': summary_rows, 'skills': skill_rows}, ensure_ascii=False, indent=2),
    encoding='utf-8'
)

print('done')
print('input=', src.name)
print('output_xlsx=', out_xlsx.name)
print('output_json=', out_json.name)
print('total_ids=', len(all_ids))
print('skill_rows=', len(skill_rows))
