const fs = require('fs');
const vm = require('vm');

const file = 'aola-species-data.js';
const code = fs.readFileSync(file, 'utf8');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const data = ctx.window.AOLA_SPECIES_DATA_BY_DEX || {};

const elements = new Set(['普通','木','火','水','冰','土','电','光明','暗黑','神秘','机械','飞行','龙','上古','数码','格斗','王','神兵','圣灵','爬行','毒']);
const atkTypes = new Set(['普通攻击','特殊攻击','属性攻击']);

let swapped = 0;
let touchedDex = new Set();
for (const [dex, sp] of Object.entries(data)) {
  const skills = Array.isArray(sp.skills) ? sp.skills : [];
  for (const sk of skills) {
    const t = String(sk.type || '');
    if (!t.includes('/')) continue;
    const [a,b] = t.split('/',2).map(x=>String(x||'').trim());
    if (atkTypes.has(a) && elements.has(b)) {
      sk.type = `${b}/${a}`;
      swapped++;
      touchedDex.add(dex);
    }
  }
}

const out = '(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = ' + JSON.stringify(data, null, 2) + ';\n})();\n';
fs.writeFileSync(file, out, 'utf8');

// check 战无炎
const z = [];
for (const [dex, sp] of Object.entries(data)) {
  if ((sp.name || '').includes('战无炎')) {
    const skills = Array.isArray(sp.skills) ? sp.skills : [];
    for (let i=0;i<skills.length;i++) {
      z.push({dex, idx:i, skill:skills[i].name, type:skills[i].type});
    }
  }
}

const rep = {
  swapped,
  touchedDex: touchedDex.size,
  zhanwuyan: z.slice(0, 30)
};
fs.writeFileSync('__fix_skill_type_swap_report.json', JSON.stringify(rep, null, 2), 'utf8');
console.log(JSON.stringify(rep));
