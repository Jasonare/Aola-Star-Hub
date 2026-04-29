import json, re, subprocess
from pathlib import Path
from collections import defaultdict
import pandas as pd

ROOT=Path('.')
xlsx=ROOT/'yabi_info_regenerated_from_100bt_10_processed_ref10.xlsx'
species_js=ROOT/'aola-species-data.js'
name_json=ROOT/'亚比大全.json'
report=ROOT/'__import_100bt10_ref10_extend_report.json'


def norm(v):
    if v is None: return ''
    return str(v).replace('\ufeff','').replace('\xa0',' ').strip()

def to_int(v,d=0):
    m=re.search(r'-?\d+', norm(v)); return int(m.group(0)) if m else d

def ids(v):
    return [int(x) for x in re.findall(r'\d+', norm(v))]

def is_noise(name):
    s=re.sub(r'\s+|[：:·\-—_\|丨/\\]+','', norm(name))
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
    p=subprocess.run([str(node),'-e',script,str(path)],capture_output=True,text=True,encoding='utf-8',errors='replace',check=True)
    return json.loads(p.stdout)


def save_species(path,data):
    txt='(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n})();\n'
    path.write_text(txt,encoding='utf-8')


def load_name_map(path):
    raw=path.read_bytes(); obj=None
    for enc in ('utf-8','utf-8-sig','gb18030','gbk'):
        try:
            obj=json.loads(raw.decode(enc)); break
        except Exception:
            pass
    out={}
    def add(name,dex):
        n=norm(name); d=to_int(dex,-1)
        if n and d>0: out[d]=n
    if isinstance(obj,list):
        for it in obj:
            if isinstance(it,dict):
                add(it.get('name') or it.get('名称') or it.get('亚比名') or it.get('title'), it.get('id') or it.get('ID') or it.get('petId') or it.get('pet_id') or it.get('编号'))
    elif isinstance(obj,dict):
        for k,v in obj.items():
            if isinstance(v,(str,int,float)): add(k,v)
        for key in ('data','list','items','亚比列表'):
            arr=obj.get(key)
            if isinstance(arr,list):
                for it in arr:
                    if isinstance(it,dict):
                        add(it.get('name') or it.get('名称') or it.get('亚比名') or it.get('title'), it.get('id') or it.get('ID') or it.get('petId') or it.get('pet_id') or it.get('编号'))
    return out

s_skill=pd.read_excel(xlsx,sheet_name=1)
s_race=pd.read_excel(xlsx,sheet_name=2)

# robust col pick
sk_cols=list(s_skill.columns); rc_cols=list(s_race.columns)

def pick(cols,key,fallback_idx):
    for c in cols:
        if key in str(c): return c
    return cols[fallback_idx]

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
    ds=ids(r.get(c_dex));
    if not ds: continue
    nm=norm(r.get(c_name))
    if is_noise(nm): continue
    rec={'name':nm,'level':max(0,to_int(r.get(c_lv),0)),'power':to_int(r.get(c_pow),0),'pp':max(0,to_int(r.get(c_pp),0)),'accuracy':max(0,to_int(r.get(c_acc),100)),'type':(norm(r.get(c_attr))+'/'+norm(r.get(c_type))).strip('/'),'desc':norm(r.get(c_desc))}
    for d in ds: skills_by_dex[d].append(rec)
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
    ds=ids(r.get(r_dex));
    if not ds: continue
    rr={'id':'','name':'','hp':max(0,to_int(r.get(r_hp),0)),'atk':max(0,to_int(r.get(r_atk),0)),'def':max(0,to_int(r.get(r_def),0)),'spAtk':max(0,to_int(r.get(r_spa),0)),'spDef':max(0,to_int(r.get(r_spd),0)),'speed':max(0,to_int(r.get(r_spe),0))}
    rr['total']=rr['hp']+rr['atk']+rr['def']+rr['spAtk']+rr['spDef']+rr['speed']
    for d in ds: races_by_dex[d]=rr

species=load_species(species_js)
name_map=load_name_map(name_json)
needed=sorted(set(skills_by_dex.keys())|set(races_by_dex.keys()))
added=[]
for d in needed:
    k=str(d)
    if k in species: continue
    nm=name_map.get(d,f'亚比{d}')
    first=(skills_by_dex.get(d) or [{}])[0]
    tp=norm(first.get('type'))
    elem=tp.split('/',1)[0] if '/' in tp else (tp or '普通系')
    species[k]={'dexId':d,'name':nm,'element':elem,'sourceUrl':'','forms':[{'name':nm,'img':''}],'skills':[],'raceStats':{'id':k,'name':nm,'hp':0,'atk':0,'def':0,'spAtk':0,'spDef':0,'speed':0,'total':0}}
    added.append(d)

upd_sk=[]; upd_r=[]
for d,arr in skills_by_dex.items():
    k=str(d)
    if k in species:
        species[k]['skills']=arr; upd_sk.append(d)
for d,rr in races_by_dex.items():
    k=str(d)
    if k in species:
        x=dict(rr); x['id']=k; x['name']=norm(species[k].get('name'))
        species[k]['raceStats']=x; upd_r.append(d)

save_species(species_js,species)

rep={'mode':'extend_and_overwrite_100bt10_ref10','source_xlsx':xlsx.name,'skills_dex_keys':len(skills_by_dex),'race_dex_keys':len(races_by_dex),'added_new_dex':len(added),'added_sample':added[:80],'updated_skills':len(set(upd_sk)),'updated_races':len(set(upd_r))}
report.write_text(json.dumps(rep,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(rep,ensure_ascii=False))


