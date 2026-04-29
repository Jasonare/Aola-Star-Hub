const fs=require('fs');
const vm=require('vm');
const code=fs.readFileSync('aola-skill-data.js','utf8');
const sandbox={window:{}}; vm.createContext(sandbox); vm.runInContext(code,sandbox,{timeout:20000});
const list=Object.values(sandbox.window.AOLA_SKILL_DATA_BY_ID||{});
const re=/(全场|回合内|持续\d+回合).{0,30}(威力).{0,30}(增加|提升|提高|上升|增强|降低|下降|减少|削弱|减小)/;
const items=[]; const seen=new Set();
for(const s of list){ const name=String(s.name||'').trim(); const desc=String(s.desc||'').trim(); if(!name||!desc) continue; if(!re.test(desc)) continue; const k=`${name}::${desc}`; if(seen.has(k)) continue; seen.add(k); items.push({name,desc,skillKey:s.skillKey||''}); }
items.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
fs.writeFileSync('element_power_buff_scan.txt', ['总计: '+items.length, ...items.map((x,i)=>`[${i+1}] ${x.name} | ${x.desc}`)].join('\n'),'utf8');
console.log('count='+items.length); console.log(items.map((x,i)=>`[${i+1}] ${x.name} | ${x.desc}`).join('\n'));
