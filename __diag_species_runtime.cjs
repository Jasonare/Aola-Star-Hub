const fs=require('fs');
const vm=require('vm');
const path=require('path');

const speciesPath=path.join(process.cwd(),'aola-species-data.js');
const appPath=path.join(process.cwd(),'aola-star-app.js');

const speciesCode=fs.readFileSync(speciesPath,'utf8');
const ctx={window:{}}; vm.createContext(ctx);
try{ vm.runInContext(speciesCode,ctx,{timeout:30000}); }catch(e){ console.log(JSON.stringify({stage:'load_species',error:e.message,stack:e.stack})); process.exit(0); }
const data=ctx.window.AOLA_SPECIES_DATA_BY_DEX||{};
const keys=Object.keys(data);

const bad=[];
for(const k of keys){
  const s=data[k]||{};
  if(!Array.isArray(s.forms)||s.forms.length===0) bad.push([k,'forms_empty']);
  else {
    for(const f of s.forms){ if(!f || typeof f.img!=='string'){ bad.push([k,'form_img_invalid']); break; } }
  }
  if(!Array.isArray(s.skills)) bad.push([k,'skills_not_array']);
  else {
    for(const sk of s.skills){
      if(!sk || typeof sk.name!=='string'){ bad.push([k,'skill_name_invalid']); break; }
      if(typeof sk.type!=='string'){ bad.push([k,'skill_type_invalid']); break; }
      if(typeof sk.pp!=='number' || Number.isNaN(sk.pp)){ bad.push([k,'skill_pp_invalid']); break; }
      if(typeof sk.level!=='number' || Number.isNaN(sk.level)){ bad.push([k,'skill_level_invalid']); break; }
    }
  }
  const r=s.raceStats;
  if(!r || typeof r!=='object') bad.push([k,'race_missing']);
  else {
    for(const f of ['hp','atk','def','spAtk','spDef','speed']){
      if(typeof r[f]!=='number' || Number.isNaN(r[f])){ bad.push([k,'race_'+f+'_invalid']); break; }
    }
  }
}

const appCode=fs.readFileSync(appPath,'utf8');
const hasSplitType=appCode.includes('split("/")');
const hasFormsIndex=appCode.includes('forms[2]');
const hasSkillTypeUse=appCode.includes('skill.type');

console.log(JSON.stringify({
  speciesCount: keys.length,
  badCount: bad.length,
  badSample: bad.slice(0,80),
  hasSplitType,
  hasFormsIndex,
  hasSkillTypeUse,
},null,2));