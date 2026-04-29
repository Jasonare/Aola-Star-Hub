import json, re, subprocess
from pathlib import Path
from collections import defaultdict
import pandas as pd

ROOT=Path('.')
xlsx=ROOT/'yabi_info_regenerated_from_100bt_4_processed.xlsx'
species_js=ROOT/'aola-species-data.js'
report=ROOT/'__import_from_processed_report.json'

def norm(v):
    return '' if v is None else str(v).replace('\ufeff','').strip()

def to_int(v,d=0):
    m=re.search(r'-?\d+',norm(v)); return int(m.group(0)) if m else d

def parse_ids(v):
    return [int(x) for x in re.findall(r'\d+', norm(v))]

def is_noise(name):
    s=re.sub(r'\s+|[：:·\-—_\|丨/\\]+','',norm(name))
    if not s: return True
    return any(k in s for k in ['推荐','学习力','性格','获取方式','配招','练级'])

def load_species(path):
    node=Path.home()/'.cache'/'codex-runtimes'/'codex-primary-runtime'/'dependencies'/'node'/'bin'/'node.exe'
    if not node.exists(): node=Path(r'C:\Program Files\nodejs\node.exe')
    script=r'''
const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(process.argv[1],'utf8');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(code,ctx);
process.stdout.write(JSON.stringify(ctx.window.AOLA_SPECIES_DATA_BY_DEX||{}));
'''
    proc=subprocess.run([str(node),'-e',script,str(path)],capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
    return json.loads(proc.stdout)

s_skill=pd.read_excel(xlsx,sheet_name=1)
s_race=pd.read_excel(xlsx,sheet_name=2)

# map columns by exact names
cs={c:str(c) for c in s_skill.columns}
cr={c:str(c) for c in s_race.columns}

c_dex='dexId'
c_name='技能名称'; c_lv='获取等级'; c_pow='威力'; c_pp='PP值'; c_acc='命中率'; c_attr='技能属性'; c_type='技能类型'; c_desc='技能描述'

skills_by_dex=defaultdict(list)
for _,r in s_skill.iterrows():
    dexes=parse_ids(r.get(c_dex))
    if not dexes: continue
    name=norm(r.get(c_name))
    if is_noise(name):
        continue
    rec={
        'name':name,
        'level':max(0,to_int(r.get(c_lv),0)),
        'power':to_int(r.get(c_pow),0),
        'pp':max(0,to_int(r.get(c_pp),0)),
        'accuracy':max(0,to_int(r.get(c_acc),100)),
        'type': (norm(r.get(c_attr))+'/'+norm(r.get(c_type))).strip('/'),
        'desc': norm(r.get(c_desc)),
    }
    for d in dexes:
        skills_by_dex[d].append(rec)

for d,arr in list(skills_by_dex.items()):
    seen=set(); out=[]
    for s in arr:
        k=(s['name'],s['level'],s['power'],s['pp'],s['accuracy'],s['type'],s['desc'])
        if k in seen: continue
        seen.add(k); out.append(s)
    out.sort(key=lambda x:(x['level'],x['name']))
    skills_by_dex[d]=out

races_by_dex={}
for _,r in s_race.iterrows():
    dexes=parse_ids(r.get('dexId'))
    if not dexes: continue
    rr={
        'id':'', 'name':'',
        'hp':max(0,to_int(r.get('体力'),0)),
        'atk':max(0,to_int(r.get('攻击'),0)),
        'def':max(0,to_int(r.get('防御'),0)),
        'spAtk':max(0,to_int(r.get('特攻'),0)),
        'spDef':max(0,to_int(r.get('特防'),0)),
        'speed':max(0,to_int(r.get('速度'),0)),
    }
    rr['total']=rr['hp']+rr['atk']+rr['def']+rr['spAtk']+rr['spDef']+rr['speed']
    for d in dexes:
        races_by_dex[d]=rr

species=load_species(species_js)
upd_sk=[]; upd_r=[]; miss_sk=[]; miss_r=[]
for d,arr in skills_by_dex.items():
    k=str(d)
    if k not in species: miss_sk.append(d); continue
    species[k]['skills']=arr; upd_sk.append(d)
for d,rr in races_by_dex.items():
    k=str(d)
    if k not in species: miss_r.append(d); continue
    x=dict(rr); x['id']=str(d); x['name']=norm(species[k].get('name'))
    species[k]['raceStats']=x; upd_r.append(d)

text='(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = '+json.dumps(species,ensure_ascii=False,indent=2)+';\n})();\n'
species_js.write_text(text,encoding='utf-8')

rep={
    'mode':'header-mapped-import',
    'skills_dex_keys':len(skills_by_dex),
    'race_dex_keys':len(races_by_dex),
    'updated_skills':len(set(upd_sk)),
    'updated_races':len(set(upd_r)),
    'missing_skills':sorted(set(miss_sk))[:50],
    'missing_races':sorted(set(miss_r))[:50],
}
report.write_text(json.dumps(rep,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(rep,ensure_ascii=False))
