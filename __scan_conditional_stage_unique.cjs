const fs=require('fs');
const vm=require('vm');
const code=fs.readFileSync('aola-skill-data.js','utf8');
const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(code,sandbox,{timeout:20000});
const byId=sandbox.window.AOLA_SKILL_DATA_BY_ID||{};
const list=Object.values(byId);
const condRe=/(受到攻击|受到伤害|受击|被攻击|命中后|命中时|若命中|回合后|当回合|本回合)/;
const stageRe=/(提升|提高|上升|增加|增强|降低|下降|削弱|减少).{0,40}(等级|全属性|全能力|双攻|双防|攻防|攻击|防御|特攻|特防|速度|命中|闪避|回避|暴击|普攻|物攻|魔攻)/;
const rows=[];
for(const sk of list){
 const name=String(sk.name||'').trim();
 const desc=String(sk.desc||'').trim();
 if(!name||!desc) continue;
 if(condRe.test(desc)&&stageRe.test(desc)) rows.push({skillId:sk.skillId,skillKey:sk.skillKey,name,desc});
}
const seen=new Set();
const out=[];
for(const r of rows){const k=`${r.name}::${r.desc}`; if(seen.has(k)) continue; seen.add(k); out.push(r);}
out.sort((a,b)=>String(a.name).localeCompare(String(b.name),'zh-CN'));
fs.writeFileSync('__conditional_stage_scan_unique.json',JSON.stringify({count:out.length,items:out},null,2),'utf8');
console.log('count='+out.length);
console.log(out.map((x,i)=>`${i+1}. ${x.name} | ${x.desc}`).join('\n'));
