import json
import re
import subprocess
from pathlib import Path
from collections import defaultdict

import pandas as pd

ROOT = Path(r"C:\工作娱乐\Aola-Star-Hub")
xlsx = ROOT / 'yabi_info_regenerated_from_100bt_skill_retry_v3_gl_processed.xlsx'
species_js = ROOT / 'aola-species-data.js'
report = ROOT / '__import_100bt_skill_retry_v3_gl_processed_report.json'


def norm(v):
    if v is None:
        return ''
    return str(v).replace('\ufeff','').replace('\xa0',' ').strip()


def to_int(v,d=0):
    m = re.search(r'-?\d+', norm(v))
    return int(m.group(0)) if m else d


def parse_ids(v):
    return [int(x) for x in re.findall(r'\d+', norm(v))]


def is_noise(name):
    s = re.sub(r'\s+|[：:·\-—_\|丨/\\]+','', norm(name))
    if not s:
        return True
    return any(k in s for k in ['推荐','学习力','性格','获取方式','配招','练级'])


def load_species(path: Path):
    node = Path.home()/'.cache'/'codex-runtimes'/'codex-primary-runtime'/'dependencies'/'node'/'bin'/'node.exe'
    if not node.exists():
        node = Path(r'C:\Program Files\nodejs\node.exe')
    script = r'''
const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(process.argv[1],'utf8');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(code,ctx);
process.stdout.write(JSON.stringify(ctx.window.AOLA_SPECIES_DATA_BY_DEX||{}));
'''
    p = subprocess.run([str(node), '-e', script, str(path)], capture_output=True, text=True, encoding='utf-8', errors='replace', check=True)
    return json.loads(p.stdout)


def save_species(path: Path, data):
    txt = '(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n})();\n'
    path.write_text(txt, encoding='utf-8')


if not xlsx.exists():
    raise FileNotFoundError(xlsx)
if not species_js.exists():
    raise FileNotFoundError(species_js)

xl = pd.ExcelFile(xlsx)
sheet_names = xl.sheet_names

s_skill = pd.read_excel(xlsx, sheet_name=1)
s_race = None
if len(sheet_names) >= 3 and '种族值表' in sheet_names:
    s_race = pd.read_excel(xlsx, sheet_name='种族值表')

# skills
sk_cols = list(s_skill.columns)
def pick(cols, key, fallback_idx):
    for c in cols:
        if key in str(c):
            return c
    return cols[fallback_idx] if fallback_idx < len(cols) else cols[-1]

c_dex = pick(sk_cols, 'dexId', 1)
c_name = pick(sk_cols, '技能名称', 2)
c_lv = pick(sk_cols, '获取等级', 3)
c_pow = pick(sk_cols, '威力', 4)
c_pp = pick(sk_cols, 'PP', 5)
c_acc = pick(sk_cols, '命中', 6)
# 本文件合并了“技能属性/技能类型”
c_attr_type = pick(sk_cols, '技能属性/技能类型', 7)
c_desc = pick(sk_cols, '技能描述', 8)

skills_by_dex = defaultdict(list)
for _, r in s_skill.iterrows():
    ds = parse_ids(r.get(c_dex))
    if not ds:
        continue
    nm = norm(r.get(c_name))
    if is_noise(nm):
        continue
    t = norm(r.get(c_attr_type))
    rec = {
        'name': nm,
        'level': max(0, to_int(r.get(c_lv), 0)),
        'power': to_int(r.get(c_pow), 0),
        'pp': max(0, to_int(r.get(c_pp), 0)),
        'accuracy': max(0, to_int(r.get(c_acc), 100)),
        'type': t,
        'desc': norm(r.get(c_desc)),
    }
    for d in ds:
        skills_by_dex[d].append(rec)

for d, arr in list(skills_by_dex.items()):
    seen = set(); out = []
    for s in arr:
        k = (s['name'], s['level'], s['power'], s['pp'], s['accuracy'], s['type'], s['desc'])
        if k in seen:
            continue
        seen.add(k); out.append(s)
    out.sort(key=lambda x: (x['level'], x['name']))
    skills_by_dex[d] = out

# races (if present)
races_by_dex = {}
if s_race is not None and len(s_race.columns) > 0:
    rc = list(s_race.columns)
    r_dex = pick(rc, 'dexId', 1)
    r_hp = pick(rc, '体力', 2)
    r_atk = pick(rc, '攻击', 3)
    r_def = pick(rc, '防御', 4)
    r_spa = pick(rc, '特攻', 5)
    r_spd = pick(rc, '特防', 6)
    r_spe = pick(rc, '速度', 7)
    for _, r in s_race.iterrows():
        ds = parse_ids(r.get(r_dex))
        if not ds:
            continue
        rr = {
            'id': '', 'name': '',
            'hp': max(0, to_int(r.get(r_hp), 0)),
            'atk': max(0, to_int(r.get(r_atk), 0)),
            'def': max(0, to_int(r.get(r_def), 0)),
            'spAtk': max(0, to_int(r.get(r_spa), 0)),
            'spDef': max(0, to_int(r.get(r_spd), 0)),
            'speed': max(0, to_int(r.get(r_spe), 0)),
        }
        rr['total'] = rr['hp'] + rr['atk'] + rr['def'] + rr['spAtk'] + rr['spDef'] + rr['speed']
        for d in ds:
            races_by_dex[d] = rr

species = load_species(species_js)
upd_sk = []; upd_r = []; miss_sk = []; miss_r = []

for d, arr in skills_by_dex.items():
    k = str(d)
    if k not in species:
        miss_sk.append(d)
        continue
    species[k]['skills'] = arr
    upd_sk.append(d)

for d, rr in races_by_dex.items():
    k = str(d)
    if k not in species:
        miss_r.append(d)
        continue
    x = dict(rr)
    x['id'] = k
    x['name'] = norm(species[k].get('name'))
    species[k]['raceStats'] = x
    upd_r.append(d)

save_species(species_js, species)

rep = {
    'mode': 'overwrite_by_dex_from_skill_retry_v3_gl_processed',
    'source_xlsx': xlsx.name,
    'sheet_names': sheet_names,
    'skills_dex_keys': len(skills_by_dex),
    'race_dex_keys': len(races_by_dex),
    'updated_skills': len(set(upd_sk)),
    'updated_races': len(set(upd_r)),
    'missing_skills': sorted(set(miss_sk))[:120],
    'missing_races': sorted(set(miss_r))[:120],
}
report.write_text(json.dumps(rep, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(rep, ensure_ascii=False))
