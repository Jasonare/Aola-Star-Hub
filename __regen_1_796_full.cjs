const fs = require('fs');
const vm = require('vm');

const DEX_FILE = 'aola-dex-1-100.js';
const SPECIES_FILE = 'aola-species-data.js';
const REPORT_FILE = '__regen_1_796_full_report.json';

const normalize = (s) => String(s || '').replace(/[\u200b\u00a0]/g, ' ').replace(/\s+/g, ' ').trim();
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const safeInt = (v, fallback = 0) => {
  const n = Number(String(v || '').replace(/[^\d-]/g, ''));
  return Number.isFinite(n) ? Math.floor(n) : fallback;
};
const ensureHttps = (url) => {
  const s = String(url || '').trim();
  if (!s) return '';
  if (s.startsWith('//')) return `https:${s}`;
  return s.replace(/^http:\/\//i, 'https://');
};

const ELEMENT_SHORT_MAP = {
  '普通': '普通系','木': '木系','水': '水系','火': '火系','土': '土系','冰': '冰系','电': '电系','飞行': '飞行系','机械': '机械系','数码': '数码系','上古': '上古系','神秘': '神秘系','格斗': '格斗系','暗黑': '暗黑系','光明': '光明系','爬行': '爬行系','龙': '龙系','圣灵': '圣灵系','神兵': '神兵系','王': '王系','毒': '毒系'
};

function stripTags(html) {
  return normalize(String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      const v = Number(n);
      return Number.isFinite(v) ? String.fromCharCode(v) : ' ';
    })
  );
}

function decodeBest(bytes) {
  const utf8 = new TextDecoder('utf-8').decode(bytes);
  const gbk = new TextDecoder('gbk').decode(bytes);
  const score = (txt) => {
    let s = 0;
    for (const k of ['技能', '种族值', '体力', '攻击', '特攻', '特防', '速度', 'PP', '威力', '亚比', '奥拉星']) {
      if (txt.includes(k)) s += 2;
    }
    if (txt.includes('鍏') || txt.includes('鐏') || txt.includes('濂')) s -= 2;
    return s;
  };
  return score(gbk) >= score(utf8) ? gbk : utf8;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const ab = await res.arrayBuffer();
    return decodeBest(new Uint8Array(ab));
  } finally {
    clearTimeout(timer);
  }
}

function normalizeElementToken(token) {
  const t = normalize(token).replace(/系$/,'');
  if (!t) return '未知系';
  if (ELEMENT_SHORT_MAP[t]) return ELEMENT_SHORT_MAP[t];
  if (t.endsWith('系')) return t;
  return `${t}系`;
}

function parseSkillType(raw) {
  const txt = normalize(raw);
  if (!txt) return '普通系/普通攻击';

  if (txt.includes('/')) {
    const [a, b] = txt.split('/').map((x) => normalize(x));
    let left = a;
    let right = b;
    if (left.includes('攻击') && !right.includes('攻击')) {
      const ele = normalizeElementToken(right);
      const atk = left || '普通攻击';
      return `${ele}/${atk}`;
    }
    const ele = normalizeElementToken(left);
    const atk = right || '普通攻击';
    return `${ele}/${atk}`;
  }

  const parts = txt.split(/\s+/).filter(Boolean);
  const attack = parts.find((p) => p.includes('攻击')) || '普通攻击';
  let element = parts.find((p) => !p.includes('攻击')) || '普通';
  element = normalizeElementToken(element);
  return `${element}/${attack}`;
}

function parse100bt(html, dexId, name) {
  const out = { skills: [], raceStats: null };

  const mSkillTable = html.match(/<table[^>]*id="yabi_table_propTable"[\s\S]*?<\/table>/i);
  if (mSkillTable) {
    const rows = [...mSkillTable[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
    const skills = [];
    for (const row of rows) {
      const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => stripTags(m[1]));
      if (tds.length !== 6) continue;
      if (tds[0].includes('技能名称')) continue;
      const sName = normalize(tds[0]);
      if (!sName || sName.length > 40) continue;
      const level = Math.max(0, safeInt(tds[1], 0));
      const powerRaw = normalize(tds[2]);
      const ppRaw = normalize(tds[3]);
      const typeRaw = normalize(tds[4]);
      const desc = normalize(tds[5]) || '暂无描述';
      const power = /^[-—－]+$/.test(powerRaw) ? -1 : Math.max(-1, safeInt(powerRaw, -1));
      const pp = /^[-—－]+$/.test(ppRaw) ? 0 : Math.max(0, safeInt(ppRaw, 0));
      skills.push({ name: sName, level, power, pp, type: parseSkillType(typeRaw), desc });
    }
    const seen = new Set();
    out.skills = skills.filter((s) => {
      const key = `${s.name}__${s.level}__${s.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => a.level - b.level);
  }

  const innerTables = [...html.matchAll(/<table class="innertable1"[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  const raceList = [];
  for (const tb of innerTables) {
    const nm = stripTags((tb.match(/<td class="yabitablestyle2">([\s\S]*?)<\/td>/i) || [])[1]);
    if (!nm) continue;
    const nums = tb.match(/<tr><td>(\d+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td><\/tr>/i);
    if (!nums) continue;
    raceList.push({
      name: nm,
      hp: clamp(Number(nums[1]) || 1, 1, 255),
      atk: clamp(Number(nums[2]) || 1, 1, 255),
      def: clamp(Number(nums[3]) || 1, 1, 255),
      spAtk: clamp(Number(nums[4]) || 1, 1, 255),
      spDef: clamp(Number(nums[5]) || 1, 1, 255),
      speed: clamp(Number(nums[6]) || 1, 1, 255)
    });
  }
  if (raceList.length > 0) {
    let hit = raceList.find((r) => normalize(r.name) === normalize(name));
    if (!hit) hit = raceList[raceList.length - 1];
    out.raceStats = {
      id: String(dexId),
      name,
      hp: hit.hp,
      atk: hit.atk,
      def: hit.def,
      spAtk: hit.spAtk,
      spDef: hit.spDef,
      speed: hit.speed,
      total: hit.hp + hit.atk + hit.def + hit.spAtk + hit.spDef + hit.speed
    };
  }

  return out;
}

function parse4399(html, dexId, name) {
  const out = { skills: [], raceStats: null };

  const tables = [...String(html).matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  let target = '';
  for (const t of tables) {
    if (t.includes('技能名称') && t.includes('PP') && (t.includes('技能描述') || t.includes('技能属性'))) {
      target = t;
      break;
    }
  }
  if (target) {
    const rows = [...target.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
    const skills = [];
    for (const row of rows) {
      const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => stripTags(m[1])).filter(Boolean);
      if (tds.length < 6) continue;
      const line = tds.join('|');
      if (line.includes('技能名称') || line.includes('等级') || line.includes('命中率')) continue;
      const sName = normalize(tds[0]);
      if (!sName || sName.length > 40) continue;
      const level = Math.max(0, safeInt(tds[1], 0));
      const powerRaw = normalize(tds[2]);
      const ppRaw = normalize(tds[3]);
      const typeRaw = normalize(tds[4]);
      const desc = normalize(tds[tds.length - 1]) || '暂无描述';
      const power = /^[-—－]+$/.test(powerRaw) ? -1 : Math.max(-1, safeInt(powerRaw, -1));
      const pp = /^[-—－]+$/.test(ppRaw) ? 0 : Math.max(0, safeInt(ppRaw, 0));
      skills.push({ name: sName, level, power, pp, type: parseSkillType(typeRaw), desc });
    }
    const seen = new Set();
    out.skills = skills.filter((s) => {
      const k = `${s.name}__${s.level}__${s.type}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).sort((a, b) => a.level - b.level);
  }

  for (const t of tables) {
    if (!t.includes('种族值')) continue;
    const rows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
    const parsed = rows.map((r) => [...r.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((m) => stripTags(m[1])).filter(Boolean));
    const keys = ['体力', '攻击', '防御', '特攻', '特防', '速度'];
    for (let i = 0; i < parsed.length - 1; i++) {
      const header = parsed[i];
      const hitCount = keys.filter((k) => header.some((h) => h.includes(k))).length;
      if (hitCount < 4) continue;
      const vals = parsed[i + 1].map((x) => safeInt(x, NaN)).filter((n) => Number.isFinite(n));
      if (vals.length < 6) continue;
      const map = {};
      let vi = 0;
      for (const h of header) {
        const k = keys.find((kk) => h.includes(kk));
        if (!k) continue;
        if (vi >= vals.length) break;
        map[k] = vals[vi++];
      }
      if (!keys.every((k) => Number.isFinite(map[k]))) continue;
      const hp = clamp(map['体力'], 1, 255);
      const atk = clamp(map['攻击'], 1, 255);
      const def = clamp(map['防御'], 1, 255);
      const spAtk = clamp(map['特攻'], 1, 255);
      const spDef = clamp(map['特防'], 1, 255);
      const speed = clamp(map['速度'], 1, 255);
      out.raceStats = { id: String(dexId), name, hp, atk, def, spAtk, spDef, speed, total: hp + atk + def + spAtk + spDef + speed };
      break;
    }
    if (out.raceStats) break;
  }

  return out;
}

function loadDex() {
  const t = fs.readFileSync(DEX_FILE, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(t, ctx);
  const arr = Array.isArray(ctx.window.AOLA_DEX_1_100) ? ctx.window.AOLA_DEX_1_100 : [];
  return arr
    .filter((x) => Number(x.dexId) >= 1 && Number(x.dexId) <= 796)
    .map((x) => ({ dexId: Number(x.dexId), name: normalize(x.name), element: normalize(x.element) || '未知系', sourceUrl: ensureHttps(x.sourceUrl) }));
}

function loadSpecies() {
  const t = fs.readFileSync(SPECIES_FILE, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(t, ctx);
  const byDex = (ctx.window.AOLA_SPECIES_DATA_BY_DEX && typeof ctx.window.AOLA_SPECIES_DATA_BY_DEX === 'object') ? ctx.window.AOLA_SPECIES_DATA_BY_DEX : {};
  const byName = (ctx.window.AOLA_SPECIES_DATA && typeof ctx.window.AOLA_SPECIES_DATA === 'object') ? ctx.window.AOLA_SPECIES_DATA : {};
  return { byDex, byName };
}

function writeSpecies(byDex, byName) {
  const out = [
    '(function(){',
    '  window.AOLA_SPECIES_DATA_BY_DEX = ' + JSON.stringify(byDex, null, 2) + ';',
    '  window.AOLA_SPECIES_DATA = ' + JSON.stringify(byName, null, 2) + ';',
    '})();',
    ''
  ].join('\n');
  fs.writeFileSync(SPECIES_FILE, out, 'utf8');
}

(async () => {
  const dex = loadDex();
  const { byDex, byName } = loadSpecies();

  const fetchTasks = new Map();
  for (const d of dex) {
    if (d.sourceUrl) fetchTasks.set(d.sourceUrl, null);
  }

  const urls = Array.from(fetchTasks.keys());
  const parsedByUrl = new Map();
  const errors = [];

  let ptr = 0;
  const workers = 10;
  async function worker() {
    while (ptr < urls.length) {
      const i = ptr++;
      const url = urls[i];
      try {
        const html = await fetchText(url);
        const firstDex = dex.find((x) => x.sourceUrl === url) || { dexId: 0, name: '' };
        let parsed;
        if (/aola\.100bt\.com\/tujian\//i.test(url)) parsed = parse100bt(html, firstDex.dexId, firstDex.name);
        else parsed = parse4399(html, firstDex.dexId, firstDex.name);
        parsedByUrl.set(url, parsed);
      } catch (e) {
        errors.push({ url, err: String(e && e.message || e) });
      }
    }
  }

  await Promise.all(Array.from({ length: workers }, () => worker()));

  let updated = 0;
  let skillsHit = 0;
  let raceHit = 0;
  let from100bt = 0;
  let from4399 = 0;

  for (const d of dex) {
    const keyDex = String(d.dexId);
    const old = byDex[keyDex] || byDex[d.dexId] || byName[d.name] || {};
    const parsed = parsedByUrl.get(d.sourceUrl) || { skills: [], raceStats: null };

    const skills = (parsed.skills && parsed.skills.length > 0) ? parsed.skills : (Array.isArray(old.skills) ? old.skills : []);
    const raceStats = parsed.raceStats || old.raceStats || null;

    if (parsed.skills && parsed.skills.length > 0) skillsHit += 1;
    if (parsed.raceStats) raceHit += 1;
    if (/aola\.100bt\.com\/tujian\//i.test(d.sourceUrl)) from100bt += 1;
    else if (/news\.4399\.com\/aolaxing\/yabi\//i.test(d.sourceUrl)) from4399 += 1;

    const next = {
      dexId: d.dexId,
      name: d.name,
      element: d.element,
      sourceUrl: d.sourceUrl || old.sourceUrl || '',
      forms: Array.isArray(old.forms) && old.forms.length ? old.forms : [{ name: d.name, img: '' }, { name: d.name, img: '' }, { name: d.name, img: '' }],
      skills,
      raceStats
    };

    byDex[keyDex] = next;
    byName[d.name] = next;
    updated += 1;
  }

  writeSpecies(byDex, byName);

  const report = {
    ts: new Date().toISOString(),
    range: [1, 796],
    dexTotal: dex.length,
    uniqueSourceUrls: urls.length,
    parsedSourceUrls: parsedByUrl.size,
    sourceType: { from100bt, from4399, other: dex.length - from100bt - from4399 },
    updated,
    skillsHit,
    raceHit,
    errorCount: errors.length,
    errors: errors.slice(0, 120)
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
})();
