import json, subprocess, re
from pathlib import Path
from collections import defaultdict

ROOT=Path('.')
species_js=ROOT/'aola-species-data.js'
report=ROOT/'__skills_chain_unify_cap18_report.json'

# load species js
node=Path.home()/'.cache'/'codex-runtimes'/'codex-primary-runtime'/'dependencies'/'node'/'bin'/'node.exe'
if not node.exists(): node=Path(r'C:\Program Files\nodejs\node.exe')
script=r'''
const fs=require('fs');const vm=require('vm');
const code=fs.readFileSync(process.argv[1],'utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(code,ctx);
process.stdout.write(JSON.stringify(ctx.window.AOLA_SPECIES_DATA_BY_DEX||{}));
'''
proc=subprocess.run([str(node),'-e',script,str(species_js)],capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
species=json.loads(proc.stdout)


def norm(v):
    return '' if v is None else str(v).strip()

# build chains by forms signature
chains=defaultdict(list)
for k,v in species.items():
    forms=v.get('forms') if isinstance(v,dict) else None
    if isinstance(forms,list) and forms:
        names=[norm(f.get('name')) for f in forms if isinstance(f,dict)]
        sig='|'.join(names) if names else f'__single__{k}'
    else:
        sig=f'__single__{k}'
    chains[sig].append(k)


def dedup_sort(skills):
    out=[]; seen=set()
    for s in (skills or []):
        if not isinstance(s,dict):
            continue
        name=norm(s.get('name'))
        if not name:
            continue
        lv=int(re.search(r'-?\d+', str(s.get('level',0))).group(0)) if re.search(r'-?\d+', str(s.get('level',0))) else 0
        pw=int(re.search(r'-?\d+', str(s.get('power',0))).group(0)) if re.search(r'-?\d+', str(s.get('power',0))) else 0
        pp=int(re.search(r'-?\d+', str(s.get('pp',0))).group(0)) if re.search(r'-?\d+', str(s.get('pp',0))) else 0
        ac=int(re.search(r'-?\d+', str(s.get('accuracy',100))).group(0)) if re.search(r'-?\d+', str(s.get('accuracy',100))) else 100
        tp=norm(s.get('type'))
        ds=norm(s.get('desc'))
        rec={'name':name,'level':max(0,lv),'power':pw,'pp':max(0,pp),'accuracy':max(0,ac),'type':tp,'desc':ds}
        key=(rec['name'],rec['level'],rec['power'],rec['pp'],rec['accuracy'],rec['type'],rec['desc'])
        if key in seen: continue
        seen.add(key); out.append(rec)
    out.sort(key=lambda x:(x['level'],x['name']))
    return out

changed_dex=[]
chain_changed=0
capped_dex=[]

for sig,ids in chains.items():
    # collect candidate lists
    candidates=[]
    for i in ids:
        sk=dedup_sort(species[i].get('skills') if isinstance(species[i],dict) else [])
        candidates.append((i,sk))

    # choose canonical: prefer max count <=18; else max count and then cap
    under=[(i,sk) for i,sk in candidates if 0 < len(sk) <= 18]
    if under:
        canon=max(under,key=lambda t: (len(t[1]), -int(t[0])))[1]
    else:
        non_empty=[(i,sk) for i,sk in candidates if len(sk)>0]
        canon=max(non_empty,key=lambda t: (len(t[1]), -int(t[0])))[1] if non_empty else []

    if len(canon)>18:
        canon=canon[:18]

    # apply to all ids in chain
    for i in ids:
        old=dedup_sort(species[i].get('skills') if isinstance(species[i],dict) else [])
        new=canon
        if old!=new:
            species[i]['skills']=new
            changed_dex.append(int(i))
            if len(old)>18 and len(new)<=18:
                capped_dex.append(int(i))

    if len(ids)>1:
        # detect if chain had differing lists before
        old_sets={tuple((x['name'],x['level'],x['power'],x['pp'],x['accuracy'],x['type'],x['desc']) for x in dedup_sort(species[i].get('skills',[]))) for i in ids}
        # after assign they are equal; if originally maybe changed_dex indicates
        if any(int(i) in changed_dex for i in ids):
            chain_changed+=1

# global sanity: ensure no dex >18
over_after=[]
for k,v in species.items():
    sk=dedup_sort(v.get('skills') if isinstance(v,dict) else [])
    if len(sk)>18:
        species[k]['skills']=sk[:18]
        over_after.append(int(k))

# save
text='(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = '+json.dumps(species,ensure_ascii=False,indent=2)+';\n})();\n'
species_js.write_text(text,encoding='utf-8')

# final stats
count_over=0
for k,v in species.items():
    s=v.get('skills') if isinstance(v,dict) else None
    if isinstance(s,list) and len(s)>18:
        count_over+=1

rep={
  'mode':'chain_unify_cap18',
  'changed_dex_count':len(set(changed_dex)),
  'changed_chain_count':chain_changed,
  'capped_dex_count':len(set(capped_dex)),
  'force_capped_after_pass':len(set(over_after)),
  'over18_after':count_over,
  'sample_changed_dex':sorted(set(changed_dex))[:30]
}
report.write_text(json.dumps(rep,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(rep,ensure_ascii=False))
