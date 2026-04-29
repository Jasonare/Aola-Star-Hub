import json, re, subprocess
from pathlib import Path
from collections import defaultdict
import pandas as pd

ROOT = Path('.')
XLSX = ROOT / 'yabi_info_regenerated_from_100bt_4_processed_strict.xlsx'
SPECIES_JS = ROOT / 'aola-species-data.js'
NAME_JSON = ROOT / '亚比大全.json'
REPORT = ROOT / '__import_strict_extend_species_report.json'


def norm(v):
    if v is None:
        return ''
    return str(v).replace('\ufeff', '').replace('\xa0', ' ').strip()


def to_int(v, default=0):
    m = re.search(r'-?\d+', norm(v))
    return int(m.group(0)) if m else default


def parse_ids(v):
    return [int(x) for x in re.findall(r'\d+', norm(v))]


def is_noise(name: str) -> bool:
    s = re.sub(r'\s+|[：:·\-—_\|丨/\\]+', '', norm(name))
    if not s:
        return True
    return any(k in s for k in ['推荐', '学习力', '性格', '获取方式', '配招', '练级'])


def load_name_by_dex(json_path: Path):
    raw = json_path.read_bytes()
    obj = None
    for enc in ('utf-8', 'utf-8-sig', 'gb18030', 'gbk'):
        try:
            obj = json.loads(raw.decode(enc))
            break
        except Exception:
            pass
    if obj is None:
        return {}

    out = {}

    def add(name, dex):
        n = norm(name)
        d = to_int(dex, -1)
        if n and d > 0:
            out[d] = n

    if isinstance(obj, list):
        for it in obj:
            if isinstance(it, dict):
                add(
                    it.get('name') or it.get('名称') or it.get('亚比名') or it.get('title'),
                    it.get('id') or it.get('ID') or it.get('petId') or it.get('pet_id') or it.get('编号'),
                )
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, (str, int, float)):
                add(k, v)
        for key in ('data', 'list', 'items', '亚比列表'):
            arr = obj.get(key)
            if isinstance(arr, list):
                for it in arr:
                    if isinstance(it, dict):
                        add(
                            it.get('name') or it.get('名称') or it.get('亚比名') or it.get('title'),
                            it.get('id') or it.get('ID') or it.get('petId') or it.get('pet_id') or it.get('编号'),
                        )
    return out


def load_species(path: Path):
    node = Path.home() / '.cache' / 'codex-runtimes' / 'codex-primary-runtime' / 'dependencies' / 'node' / 'bin' / 'node.exe'
    if not node.exists():
        node = Path(r'C:\Program Files\nodejs\node.exe')
    script = r'''
const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(process.argv[1],'utf8');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(code,ctx);
process.stdout.write(JSON.stringify(ctx.window.AOLA_SPECIES_DATA_BY_DEX||{}));
'''
    proc = subprocess.run([str(node), '-e', script, str(path)], capture_output=True, text=True, encoding='utf-8', errors='replace', check=True)
    return json.loads(proc.stdout)


def save_species(path: Path, data):
    text = '(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n})();\n'
    path.write_text(text, encoding='utf-8')


if not XLSX.exists():
    raise FileNotFoundError(XLSX)

name_by_dex = load_name_by_dex(NAME_JSON)
species = load_species(SPECIES_JS)

s_skill = pd.read_excel(XLSX, sheet_name=1)
s_race = pd.read_excel(XLSX, sheet_name=2)

skills_by_dex = defaultdict(list)
for _, r in s_skill.iterrows():
    dexes = parse_ids(r.get('dexId'))
    if not dexes:
        continue
    name = norm(r.get('技能名称'))
    if is_noise(name):
        continue
    attr = norm(r.get('技能属性'))
    atk = norm(r.get('技能类型'))
    rec = {
        'name': name,
        'level': max(0, to_int(r.get('获取等级'), 0)),
        'power': to_int(r.get('威力'), 0),
        'pp': max(0, to_int(r.get('PP值'), 0)),
        'accuracy': max(0, to_int(r.get('命中率'), 100)),
        'type': (attr + '/' + atk).strip('/'),
        'desc': norm(r.get('技能描述')),
    }
    for d in dexes:
        skills_by_dex[d].append(rec)

for d, arr in list(skills_by_dex.items()):
    seen = set(); out = []
    for s in arr:
        k = (s['name'], s['level'], s['power'], s['pp'], s['accuracy'], s['type'], s['desc'])
        if k in seen:
            continue
        seen.add(k)
        out.append(s)
    out.sort(key=lambda x: (x['level'], x['name']))
    skills_by_dex[d] = out

races_by_dex = {}
for _, r in s_race.iterrows():
    dexes = parse_ids(r.get('dexId'))
    if not dexes:
        continue
    race = {
        'id': '',
        'name': '',
        'hp': max(0, to_int(r.get('体力'), 0)),
        'atk': max(0, to_int(r.get('攻击'), 0)),
        'def': max(0, to_int(r.get('防御'), 0)),
        'spAtk': max(0, to_int(r.get('特攻'), 0)),
        'spDef': max(0, to_int(r.get('特防'), 0)),
        'speed': max(0, to_int(r.get('速度'), 0)),
    }
    race['total'] = race['hp'] + race['atk'] + race['def'] + race['spAtk'] + race['spDef'] + race['speed']
    for d in dexes:
        races_by_dex[d] = race

# Ensure entry exists for every dex that appears in strict workbook
needed_dex = sorted(set(skills_by_dex.keys()) | set(races_by_dex.keys()))
added = []
for d in needed_dex:
    k = str(d)
    if k in species:
        continue
    nm = name_by_dex.get(d, f'亚比{d}')
    # infer element from first skill
    first_skill = (skills_by_dex.get(d) or [{}])[0]
    tp = norm(first_skill.get('type'))
    elem = tp.split('/', 1)[0] if '/' in tp else (tp or '普通系')
    species[k] = {
        'dexId': d,
        'name': nm,
        'element': elem,
        'sourceUrl': '',
        'forms': [{'name': nm, 'img': ''}],
        'skills': [],
        'raceStats': {
            'id': k,
            'name': nm,
            'hp': 0,
            'atk': 0,
            'def': 0,
            'spAtk': 0,
            'spDef': 0,
            'speed': 0,
            'total': 0,
        },
    }
    added.append(d)

# Overwrite skills/raceStats by dexId
updated_skills = []
updated_races = []
for d, arr in skills_by_dex.items():
    k = str(d)
    if k not in species:
        continue
    species[k]['skills'] = arr
    updated_skills.append(d)

for d, rr in races_by_dex.items():
    k = str(d)
    if k not in species:
        continue
    x = dict(rr)
    x['id'] = k
    x['name'] = norm(species[k].get('name'))
    species[k]['raceStats'] = x
    updated_races.append(d)

save_species(SPECIES_JS, species)

rep = {
    'mode': 'extend_species_then_overwrite_by_dex',
    'source_xlsx': XLSX.name,
    'skills_dex_keys': len(skills_by_dex),
    'race_dex_keys': len(races_by_dex),
    'added_new_dex': len(added),
    'added_sample': added[:40],
    'updated_skills': len(set(updated_skills)),
    'updated_races': len(set(updated_races)),
}
REPORT.write_text(json.dumps(rep, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(rep, ensure_ascii=False))
