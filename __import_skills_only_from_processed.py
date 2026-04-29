import json, re, subprocess
from pathlib import Path
from collections import defaultdict
import pandas as pd

ROOT=Path('.')
xlsx=ROOT/'yabi_info_regenerated_from_100bt_4_processed.xlsx'
species_js=ROOT/'aola-species-data.js'
report=ROOT/'__import_skills_only_from_processed_report.json'


def norm(v):
    return '' if v is None else str(v).replace('\ufeff','').strip()

def to_int(v,d=0):
    m=re.search(r'-?\d+', norm(v))
    return int(m.group(0)) if m else d

def parse_ids(v):
    return [int(x) for x in re.findall(r'\d+', norm(v))]

def is_noise(name):
    s=re.sub(r'\s+|[：:·\-—_\|丨/\\]+','', norm(name))
    if not s: return True
    return any(k in s for k in ['推荐','学习力','性格','获取方式','配招','练级'])

# load processed skill sheet
s=pd.read_excel(xlsx,sheet_name=1)

skills_by_dex=defaultdict(list)
for _,r in s.iterrows():
    dexes=parse_ids(r.get('dexId'))
    if not dexes: continue
    name=norm(r.get('技能名称'))
    if is_noise(name):
        continue
    rec={
        'name': name,
        'level': max(0,to_int(r.get('获取等级'),0)),
        'power': to_int(r.get('威力'),0),
        'pp': max(0,to_int(r.get('PP值'),0)),
        'accuracy': max(0,to_int(r.get('命中率'),100)),
        'type': (norm(r.get('技能属性'))+'/'+norm(r.get('技能类型'))).strip('/'),
        'desc': norm(r.get('技能描述')),
    }
    for d in dexes:
        skills_by_dex[d].append(rec)

# dedup + sort
for d,arr in list(skills_by_dex.items()):
    seen=set(); out=[]
    for sk in arr:
        k=(sk['name'],sk['level'],sk['power'],sk['pp'],sk['accuracy'],sk['type'],sk['desc'])
        if k in seen: continue
        seen.add(k); out.append(sk)
    out.sort(key=lambda x:(x['level'],x['name']))
    skills_by_dex[d]=out

# load species by node
node=Path.home()/'.cache'/'codex-runtimes'/'codex-primary-runtime'/'dependencies'/'node'/'bin'/'node.exe'
if not node.exists(): node=Path(r'C:\Program Files\nodejs\node.exe')
script=r'''
const fs=require('fs'); const vm=require('vm');
const code=fs.readFileSync(process.argv[1],'utf8');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(code,ctx);
process.stdout.write(JSON.stringify(ctx.window.AOLA_SPECIES_DATA_BY_DEX||{}));
'''
proc=subprocess.run([str(node),'-e',script,str(species_js)],capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
species=json.loads(proc.stdout)

updated=[]; missing=[]
for d,arr in skills_by_dex.items():
    k=str(d)
    if k not in species:
        missing.append(d)
        continue
    # overwrite old skills (not merge)
    species[k]['skills']=arr
    updated.append(d)

# write back
text='(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = '+json.dumps(species,ensure_ascii=False,indent=2)+';\n})();\n'
species_js.write_text(text,encoding='utf-8')

rep={
    'mode':'skills_only_overwrite',
    'source_xlsx':xlsx.name,
    'skills_dex_keys':len(skills_by_dex),
    'updated_skills':len(set(updated)),
    'missing_skills':sorted(set(missing))[:80],
}
report.write_text(json.dumps(rep,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(rep,ensure_ascii=False))
