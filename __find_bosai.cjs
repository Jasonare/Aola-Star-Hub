const fs=require('fs');
const vm=require('vm');
const code=fs.readFileSync('aola-species-data.js','utf8');
const ctx={window:{}};
vm.createContext(ctx); vm.runInContext(code,ctx);
const d=ctx.window.AOLA_SPECIES_DATA_BY_DEX||{};
for(const [k,v] of Object.entries(d)){
  if(String(v.name||'').includes('波塞亚斯') || String(v.name||'').includes('塞亚斯')){
    console.log('dex',k,'name',v.name,'skills',Array.isArray(v.skills)?v.skills.length:0);
    if(Array.isArray(v.skills)){
      console.log(v.skills.slice(0,10).map(s=>`${s.name}:${s.level}`).join(' | '));
    }
  }
}
