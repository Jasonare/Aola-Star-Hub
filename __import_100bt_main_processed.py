import json, re, subprocess
from pathlib import Path
from collections import defaultdict
import pandas as pd

ROOT=Path('.')
xlsx=ROOT/'yabi_info_regenerated_from_100bt_processed.xlsx'
species_js=ROOT/'aola-species-data.js'
report=ROOT/'__import_100bt_main_processed_report.json'


def norm(v):
    if v is None:
        return ''
    return str(v).replace('\ufeff','').replace('\xa0',' ').strip()


def to_int(v, d=0):
    m=re.search(r'-?\d+', norm(v))
    return int(m.group(0)) if m else d


def parse_ids(v):
    return [int(x) for x in re.findall(r'\d+', norm(v))]


def is_noise(name):
    s=re.sub(r'\s+|[：:·\-—_\|丨/\\]+','', norm(name))
    if not s:
        return True
    return any(k in s for k in ['推荐','学习力','性格','获取方式','配招','练级'])


def load_species(path: Path):
    node=Path.home()/'.cache'/'codex-runtimes'/'codex-primary-runtime'/'dependencies'/'node'/'bin'/'node.exe'
    if not node.exists():
        node=Path(r'C:\Program Files\nodejs\node.exe')
    script=r'''
const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(process.argv[1],'utf8');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(code,ctx);
process.stdout.write(JSON.stringify(ctx.window.AOLA_SPECIES_DATA_BY_DEX||{}));
'''
    proc=subprocess.run([str(node),'-e',script,str(path)],capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
    return json.loads(proc.stdout)


def save_species(path: Path, data):
    text='(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n})();\n'
    path.write_text(text,encoding='utf-8')


if not xlsx.exists():
    raise FileNotFoundError(xlsx)
if not species_js.exists():
    raise FileNotFoundError(species_js)

s_skill=pd.read_excel(xlsx,sheet_name=1)
s_race=pd.read_excel(xlsx,sheet_name=2)

# resolve columns robustly
def pick(cols, key, fallback_idx):
    for c in cols:
        if key in str(c):
            return c
    return cols[fallback_idx]

sk_cols=list(s_skill.columns)
rc_cols=list(s_race.columns)

c_dex=pick(sk_cols,'dexId',1)
c_name=pick(sk_cols,'技能名称',2)
c_lv=pick(sk_cols,'获取等级',3)
c_pow=pick(sk_cols,'威力',4)
c_pp=pick(sk_cols,'PP',5)
c_acc=pick(sk_cols,'命中',6)
c_attr=pick(sk_cols,'技能属性',7)
c_type=pick(sk_cols,'技能类型',8)
c_desc=pick(sk_cols,'技能描述',9)

r_dex=pick(rc_cols,'dexId',1)
r_hp=pick(rc_cols,'体力',2)
r_atk=pick(rc_cols,'攻击',3)
r_def=pick(rc_cols,'防御',4)
r_spa=pick(rc_cols,'特攻',5)
r_spd=pick(rc_cols,'特防',6)
r_spe=pick(rc_cols,'速度',7)

skills_by_dex=defaultdict(list)
for _,r in s_skill.iterrows():
    dexes=parse_ids(r.get(c_dex))
    if not dexes:
        continue
    name=norm(r.get(c_name))
    if is_noise(name):
        continue
    rec={
        'name': name,
        'level': max(0,to_int(r.get(c_lv),0)),
        'power': to_int(r.get(c_pow),0),
        'pp': max(0,to_int(r.get(c_pp),0)),
        'accuracy': max(0,to_int(r.get(c_acc),100)),
        'type': (norm(r.get(c_attr))+'/'+norm(r.get(c_type))).strip('/'),
        'desc': norm(r.get(c_desc)),
    }
    for d in dexes:
        skills_by_dex[d].append(rec)

for d,arr in list(skills_by_dex.items()):
    seen=set(); out=[]
    for s in arr:
        key=(s['name'],s['level'],s['power'],s['pp'],s['accuracy'],s['type'],s['desc'])
        if key in seen:
            continue
        seen.add(key)
        out.append(s)
    out.sort(key=lambda x:(x['level'],x['name']))
    skills_by_dex[d]=out

races_by_dex={}
for _,r in s_race.iterrows():
    dexes=parse_ids(r.get(r_dex))
    if not dexes:
        continue
    rr={
        'id':'',
        'name':'',
        'hp':max(0,to_int(r.get(r_hp),0)),
        'atk':max(0,to_int(r.get(r_atk),0)),
        'def':max(0,to_int(r.get(r_def),0)),
        'spAtk':max(0,to_int(r.get(r_spa),0)),
        'spDef':max(0,to_int(r.get(r_spd),0)),
        'speed':max(0,to_int(r.get(r_spe),0)),
    }
    rr['total']=rr['hp']+rr['atk']+rr['def']+rr['spAtk']+rr['spDef']+rr['speed']
    for d in dexes:
        races_by_dex[d]=rr

species=load_species(species_js)
updated_sk=[]; updated_r=[]; missing_sk=[]; missing_r=[]
for d,arr in skills_by_dex.items():
    k=str(d)
    if k not in species:
        missing_sk.append(d)
        continue
    species[k]['skills']=arr
    updated_sk.append(d)
for d,rr in races_by_dex.items():
    k=str(d)
    if k not in species:
        missing_r.append(d)
        continue
    x=dict(rr)
    x['id']=k
    x['name']=norm(species[k].get('name'))
    species[k]['raceStats']=x
    updated_r.append(d)

save_species(species_js, species)

rep={
    'mode':'overwrite_skills_and_race_by_dex',
    'source_xlsx':xlsx.name,
    'skills_dex_keys':len(skills_by_dex),
    'race_dex_keys':len(races_by_dex),
    'updated_skills':len(set(updated_sk)),
    'updated_races':len(set(updated_r)),
    'missing_skills':sorted(set(missing_sk))[:120],
    'missing_races':sorted(set(missing_r))[:120],
}
report.write_text(json.dumps(rep,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(rep,ensure_ascii=False))

