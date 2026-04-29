import json
import random
import re
from collections import defaultdict
from pathlib import Path

import pandas as pd

random.seed(20260424)

ROOT = Path('.')
in_xlsx = ROOT / 'yabi_info_regenerated_from_100bt_4.xlsx'
ref_xlsx = next(x for x in ROOT.glob('*原系亚比_100bt_编号_技能_种族值(4).xlsx') if not x.name.startswith('~$'))
out_xlsx = ROOT / 'yabi_info_regenerated_from_100bt_4_processed.xlsx'
json_path = ROOT / '亚比大全.json'


def norm(v):
    if v is None:
        return ''
    return str(v).replace('\xa0', ' ').replace('\ufeff', '').strip()


def parse_int(v, default=None):
    m = re.search(r'-?\d+', norm(v))
    if not m:
        return default
    return int(m.group(0))


def parse_id_set(v):
    return [int(x) for x in re.findall(r'\d+', norm(v))]


def extract_names_from_title(title: str):
    t = norm(title).replace('（', '(').replace('）', ')')
    m = re.search(r'奥拉星(.+?)(技能表|种族值|配招|练级|$)', t)
    if not m:
        return []
    seg = m.group(1)
    parts = re.split(r'[\s、,，/\\|]+', seg)
    out = []
    seen = set()
    for p in parts:
        x = norm(p)
        if x and x not in seen:
            seen.add(x)
            out.append(x)
    return out


# load json name->dex map
raw = json_path.read_bytes()
obj = None
for enc in ('utf-8', 'utf-8-sig', 'gb18030', 'gbk'):
    try:
        obj = json.loads(raw.decode(enc))
        break
    except Exception:
        pass
if obj is None:
    raise RuntimeError('亚比大全.json 解析失败')

name_to_dex = {}


def add_map(name, dex):
    n = norm(name)
    d = parse_int(dex, None)
    if n and d is not None:
        name_to_dex[n] = d


if isinstance(obj, list):
    for it in obj:
        if isinstance(it, dict):
            add_map(
                it.get('name') or it.get('名称') or it.get('亚比名') or it.get('title'),
                it.get('id') or it.get('ID') or it.get('petId') or it.get('pet_id') or it.get('编号'),
            )
elif isinstance(obj, dict):
    for k, v in obj.items():
        if isinstance(v, (str, int, float)):
            add_map(k, v)
    for key in ('data', 'list', 'items', '亚比列表'):
        arr = obj.get(key)
        if isinstance(arr, list):
            for it in arr:
                if isinstance(it, dict):
                    add_map(
                        it.get('name') or it.get('名称') or it.get('亚比名') or it.get('title'),
                        it.get('id') or it.get('ID') or it.get('petId') or it.get('pet_id') or it.get('编号'),
                    )

# precise mapping: only extracted names from title, then exact match to json names
ref_skill = pd.read_excel(ref_xlsx, sheet_name=1)
id_to_names = defaultdict(list)
for _, r in ref_skill.iterrows():
    id_set = parse_id_set(r.iloc[3] if len(r) > 3 else '')
    title = norm(r.iloc[1] if len(r) > 1 else '')
    if not id_set or not title:
        continue

    title_names = extract_names_from_title(title)
    matched = [nm for nm in title_names if nm in name_to_dex]
    if not matched:
        continue

    for yid in id_set:
        cur = id_to_names[yid]
        for n in matched:
            if n not in cur:
                cur.append(n)

id_to_dexlist = {k: [name_to_dex[n] for n in v if n in name_to_dex] for k, v in id_to_names.items()}

# load target workbook
s0 = pd.read_excel(in_xlsx, sheet_name=0)
s1 = pd.read_excel(in_xlsx, sheet_name=1)
s2 = pd.read_excel(in_xlsx, sheet_name=2)

for df in (s0, s1, s2):
    if 'dexId' not in df.columns:
        df.insert(1, 'dexId', '')
    else:
        df['dexId'] = ''

for df in (s0, s1, s2):
    col_id = '亚比ID' if '亚比ID' in df.columns else df.columns[0]
    for i, v in df[col_id].items():
        yid = parse_int(v, None)
        if yid is None:
            continue
        dexes = id_to_dexlist.get(yid, [])
        if dexes:
            df.at[i, 'dexId'] = '[' + ','.join(str(x) for x in dexes) + ']'

# PP/命中率处理
if 'PP值' not in s1.columns:
    raise RuntimeError('技能表缺少PP值列')
if '命中率' not in s1.columns:
    s1.insert(s1.columns.get_loc('PP值') + 1, '命中率', 0)

s1['PP值'] = pd.to_numeric(s1['PP值'], errors='coerce')
s1['命中率'] = pd.to_numeric(s1['命中率'], errors='coerce')

for i, row in s1.iterrows():
    pp_raw = parse_int(row.get('PP值'), None)
    if pp_raw is None:
        s1.at[i, '命中率'] = int(random.choice([70, 80, 95]))
        s1.at[i, 'PP值'] = int(random.choice([5, 10, 15, 20, 25]))
        continue

    if pp_raw > 50 or pp_raw < 0:
        acc = 100 if pp_raw < 0 else pp_raw
        s1.at[i, '命中率'] = int(acc)
        s1.at[i, 'PP值'] = int(random.choice([5, 10, 15, 20, 25]))
    else:
        s1.at[i, '命中率'] = int(random.choice([70, 80, 95]))
        s1.at[i, 'PP值'] = int(pp_raw)

s1['PP值'] = pd.to_numeric(s1['PP值'], errors='coerce').fillna(0).astype(int)
s1['命中率'] = pd.to_numeric(s1['命中率'], errors='coerce').fillna(100).astype(int)

with pd.ExcelWriter(out_xlsx, engine='openpyxl') as writer:
    s0.to_excel(writer, sheet_name='亚比总表', index=False)
    s1.to_excel(writer, sheet_name='技能表', index=False)
    s2.to_excel(writer, sheet_name='种族值表', index=False)

print('done')
print('output=', out_xlsx.name)
print('mapped_ids=', len(id_to_dexlist))
print('rows=', len(s0), len(s1), len(s2))
print('dex_mapped_rows=', int((s0['dexId'].astype(str) != '').sum()), int((s1['dexId'].astype(str) != '').sum()), int((s2['dexId'].astype(str) != '').sum()))
print('acc_filled=', int((s1['命中率'].astype(str) != '').sum()))
print('pp_out_of_range_after=', int(((s1['PP值'] > 50) | (s1['PP值'] < 0)).sum()))
