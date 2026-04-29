import json, re
from pathlib import Path
from collections import defaultdict
import pandas as pd

ROOT = Path('.')
base_xlsx = ROOT / 'yabi_info_regenerated_from_100bt_4.xlsx'
out_xlsx = ROOT / 'yabi_info_regenerated_from_100bt_4_processed.xlsx'
ref_xlsx = next(x for x in ROOT.glob('*原系亚比_100bt_编号_技能_种族值(4).xlsx') if not x.name.startswith('~$'))
json_path = ROOT / '亚比大全.json'


def norm(v):
    if v is None:
        return ''
    return str(v).replace('\xa0', ' ').replace('\ufeff', '').strip()


def parse_int(v, default=None):
    m = re.search(r'-?\d+', norm(v))
    return int(m.group(0)) if m else default


def parse_id_set(v):
    return [int(x) for x in re.findall(r'\d+', norm(v))]


def load_name_map(p: Path):
    raw = p.read_bytes()
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

    def add(name, dex):
        n = norm(name)
        d = parse_int(dex, None)
        if n and d is not None:
            name_to_dex[n] = d

    if isinstance(obj, list):
        for it in obj:
            if isinstance(it, dict):
                add(it.get('name') or it.get('名称') or it.get('亚比名') or it.get('title'),
                    it.get('id') or it.get('ID') or it.get('petId') or it.get('pet_id') or it.get('编号'))
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (str, int, float)):
                add(k, v)
        for key in ('data', 'list', 'items', '亚比列表'):
            arr = obj.get(key)
            if isinstance(arr, list):
                for it in arr:
                    if isinstance(it, dict):
                        add(it.get('name') or it.get('名称') or it.get('亚比名') or it.get('title'),
                            it.get('id') or it.get('ID') or it.get('petId') or it.get('pet_id') or it.get('编号'))
    return name_to_dex


def extract_names_from_title(title: str):
    t = norm(title)
    t = t.replace('（', '(').replace('）', ')')
    # Keep only the name segment after 奥拉星 and before common suffix markers
    m = re.search(r'奥拉星(.+?)(技能表|种族值|配招|练级|$)', t)
    if not m:
        return []
    segment = m.group(1)
    # split by obvious separators, keep exact tokens only
    parts = re.split(r'[\s、,，/\\|]+', segment)
    out = []
    seen = set()
    for p in parts:
        x = norm(p)
        if x and x not in seen:
            seen.add(x)
            out.append(x)
    return out


name_to_dex = load_name_map(json_path)

# Build precise yabiID -> dex list from reference page-title + id set
ref_skill = pd.read_excel(ref_xlsx, sheet_name=1)
id_to_dex = {}
id_to_names = {}
for _, r in ref_skill.iterrows():
    ids = parse_id_set(r.iloc[3] if len(r) > 3 else '')
    title = norm(r.iloc[1] if len(r) > 1 else '')
    if not ids or not title:
        continue

    names = extract_names_from_title(title)
    matched = [n for n in names if n in name_to_dex]
    dexes = [name_to_dex[n] for n in matched]

    if not dexes:
        continue
    dex_str = '[' + ','.join(str(x) for x in dexes) + ']'
    for yid in ids:
        id_to_dex[yid] = dex_str
        id_to_names[yid] = matched

# Load workbook to rewrite dexId only (keep current PP/命中率 cleaning from processed file if exists)
src_for_rewrite = out_xlsx if out_xlsx.exists() else base_xlsx
s0 = pd.read_excel(src_for_rewrite, sheet_name=0)
s1 = pd.read_excel(src_for_rewrite, sheet_name=1)
s2 = pd.read_excel(src_for_rewrite, sheet_name=2)

for df in (s0, s1, s2):
    if 'dexId' not in df.columns:
        df.insert(1, 'dexId', '')
    else:
        df['dexId'] = ''

for df in (s0, s1, s2):
    id_col = '亚比ID' if '亚比ID' in df.columns else df.columns[0]
    for i, v in df[id_col].items():
        yid = parse_int(v, None)
        if yid is None:
            continue
        if yid in id_to_dex:
            df.at[i, 'dexId'] = id_to_dex[yid]

with pd.ExcelWriter(out_xlsx, engine='openpyxl') as writer:
    s0.to_excel(writer, sheet_name='亚比总表', index=False)
    s1.to_excel(writer, sheet_name='技能表', index=False)
    s2.to_excel(writer, sheet_name='种族值表', index=False)

print('done')
print('output=', out_xlsx.name)
print('strict_mapped_ids=', len(id_to_dex))
print('mapped_rows=', int((s0['dexId'].astype(str)!='').sum()), int((s1['dexId'].astype(str)!='').sum()), int((s2['dexId'].astype(str)!='').sum()))
for sid in sorted(list(id_to_names.keys()))[:10]:
    print('sample', sid, id_to_names[sid], id_to_dex[sid])
