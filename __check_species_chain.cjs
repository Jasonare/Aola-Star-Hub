const fs=require('fs');const vm=require('vm');
const speciesCode=fs.readFileSync('aola-species-data.js','utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(speciesCode,sandbox,{timeout:25000});
const dex=sandbox.window.AOLA_SPECIES_DATA||[];
function find(n){return dex.find(x=>String(x.name||'').includes(n));}
for(const n of ['战无炎','战无炎小时','铠甲独角兽','鬼脸怪']){
 const d=find(n); if(!d){ console.log(n+':not found'); continue;}
 console.log(n+': dexId='+d.dexId+', name='+d.name+', evoChain='+(d.evolutionChain||[]).join(','));
}
