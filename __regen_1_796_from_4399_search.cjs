const fs = require('fs');
const vm = require('vm');

const DEX_FILE = 'aola-dex-1-100.js';
const SPECIES_FILE = 'aola-species-data.js';
const REPORT_FILE = '__regen_1_796_from_4399_search_report.json';
const INDEX_URL = 'https://news.4399.com/aolaxing/yabi/';

const ELEMENT_SHORT_MAP = {
  '普通': '普通系','木': '木系','水': '水系','火': '火系','土': '土系','冰': '冰系','电': '电系','飞行': '飞行系','机械': '机械系','数码': '数码系','上古': '上古系','神秘': '神秘系','格斗': '格斗系','暗黑': '暗黑系','光明': '光明系','爬行': '爬行系','龙': '龙系','圣灵': '圣灵系','神兵': '神兵系','王': '王系','毒': '毒系'
};

const normalize = (s) => String(s || '').replace(/[\u200b\u00a0]/g, ' ').replace(/\s+/g, ' ').trim();
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const safeInt = (v, fallback = 0) => {
  const n = Number(String(v || '').replace(/[^\d-]/g, ''));
  return Number.isFinite(n) ? Math.floor(n) : fallback;
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
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n) || 32))
  );
}

function ensureHttps(url) {
  const s = String(url || '').trim();
  if (!s) return '';
  if (s.startsWith('//')) return `https:${s}`;
  return s.replace(/^http:\/\//i, 'https://');
}

function decodeBest(bytes) {
  const utf8 = new TextDecoder('utf-8').decode(bytes);
  const gbk = new TextDecoder('gbk').decode(bytes);
  const score = (txt) => {
    let s = 0;
    for (const k of ['技能', '种族值', '体力', '攻击', '特攻', '特防', '速度', 'PP', '亚比', '奥拉星']) {
      if (txt.includes(k)) s += 2;
    }
    if (txt.includes('鍏') || txt.includes('鐏')) s -= 2;
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
  const t = normalize(token).replace(/系$/,'' );
  if (!t) return '未知系';
  if (ELEMENT_SHORT_MAP[t]) return ELEMENT_SHORT_MAP[t];
  return t.endsWith('系') ? t : `${t}系`;
}

function parseSkillType(raw) {
  const txt = normalize(raw);
  const parts = txt.split(/\s+/).filter(Boolean);
  const attack = parts.find((p) => p.includes('攻击')) || '普通攻击';
  let ele = parts[parts.length - 1] || '普通';
  if (ele.includes('攻击')) ele = '普通';
  return `${normalizeElementToken(ele)}/${attack}`;
}

function parseSkills(html) {
  const tables = [...String(html).matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  let target = '';
  for (const t of tables) {
    if (t.includes('技能名称') && t.includes('PP') && (t.includes('技能描述') || t.includes('技能属性'))) { target = t; break; }
  }
  if (!target) return [];
  const rows = [...target.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  const out = [];
  for (const r of rows) {
    const cells = [...r.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => stripTags(m[1])).filter(Boolean);
    if (cells.length < 6) continue;
    const line = cells.join('|');
    if (line.includes('技能名称') || line.includes('等级') || line.includes('命中率')) continue;
    const name = normalize(cells[0]);
    if (!name || name.length > 30) continue;
    const level = Math.max(0, safeInt(cells[1], 0));
    const powerRaw = normalize(cells[2]);
    const ppRaw = normalize(cells[3]);
    const typeRaw = normalize(cells[4]);
    const desc = normalize(cells[cells.length - 1]) || '暂无描述';
    const power = /^[-—－]+$/.test(powerRaw) ? -1 : Math.max(-1, safeInt(powerRaw, -1));
    const pp = /^[-—－]+$/.test(ppRaw) ? 0 : Math.max(0, safeInt(ppRaw, 0));
    out.push({ name, level, power, pp, type: parseSkillType(typeRaw), desc });
  }
  const seen = new Set();
  return out.filter((s) => {
    const k = `${s.name}__${s.level}__${s.type}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).sort((a, b) => a.level - b.level);
}

function parseRace(html, dexId, name) {
  const tables = [...String(html).matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  const keys = ['体力','攻击','防御','特攻','特防','速度'];
  for (const t of tables) {
    if (!t.includes('种族值')) continue;
    const rows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
    const parsed = rows.map((r) => [...r.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((m) => stripTags(m[1])).filter(Boolean));
    for (let i = 0; i < parsed.length - 1; i++) {
      const header = parsed[i].map(normalize);
      const hit = keys.filter((k) => header.some((h) => h.includes(k)));
      if (hit.length < 4) continue;
      const vals = parsed[i + 1].map((x) => safeInt(x, NaN)).filter((n) => Number.isFinite(n));
      if (vals.length < 6) continue;
      const out = {};
      let vi = 0;
      for (const h of header) {
        const k = keys.find((kk) => h.includes(kk));
        if (!k) continue;
        if (vi >= vals.length) break;
        out[k] = vals[vi++];
      }
      if (!keys.every((k) => Number.isFinite(out[k]))) continue;
      const hp = clamp(out['体力'], 1, 255);
      const atk = clamp(out['攻击'], 1, 255);
      const def = clamp(out['防御'], 1, 255);
      const spAtk = clamp(out['特攻'], 1, 255);
      const spDef = clamp(out['特防'], 1, 255);
      const speed = clamp(out['速度'], 1, 255);
      return { id: String(dexId), name, hp, atk, def, spAtk, spDef, speed, total: hp + atk + def + spAtk + spDef + speed };
    }
  }
  return null;
}

function loadDex() {
  const t = fs.readFileSync(DEX_FILE, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(t, ctx);
  return (ctx.window.AOLA_DEX_1_100 || []).filter((x) => Number(x.dexId) >= 1 && Number(x.dexId) <= 796).map((x) => ({ dexId: Number(x.dexId), name: normalize(x.name), element: normalize(x.element)||'未知系' }));
}

function loadSpecies() {
  const t = fs.readFileSync(SPECIES_FILE, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(t, ctx);
  return {
    byDex: (ctx.window.AOLA_SPECIES_DATA_BY_DEX && typeof ctx.window.AOLA_SPECIES_DATA_BY_DEX === 'object') ? ctx.window.AOLA_SPECIES_DATA_BY_DEX : {},
    byName: (ctx.window.AOLA_SPECIES_DATA && typeof ctx.window.AOLA_SPECIES_DATA === 'object') ? ctx.window.AOLA_SPECIES_DATA : {}
  };
}

function writeSpecies(byDex, byName) {
  const out = '(function(){\n  window.AOLA_SPECIES_DATA_BY_DEX = ' + JSON.stringify(byDex, null, 2) + ';\n  window.AOLA_SPECIES_DATA = ' + JSON.stringify(byName, null, 2) + ';\n})();\n';
  fs.writeFileSync(SPECIES_FILE, out, 'utf8');
}

function parseIndex(html) {
  const out = [];
  const re = /<a\s+class="m-pic"\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = ensureHttps(m[1]);
    const inner = m[2];
    const text = stripTags(inner).replace(/^奥拉星/, '').trim();
    const altm = inner.match(/alt="([^"]+)"/i);
    const alt = altm ? normalize(altm[1]).replace(/^奥拉星/, '') : '';
    const name = normalize(text || alt);
    if (!name) continue;
    out.push({ name, href });
  }
  return out;
}

function pickLastMatch(name, list) {
  const n = normalize(name);
  let hit = null;
  for (const x of list) {
    if (x.name === n) hit = x;
  }
  if (hit) return hit;
  for (const x of list) {
    if (x.name.includes(n) || n.includes(x.name)) hit = x;
  }
  return hit;
}

(async () => {
  const dex = loadDex();
  const { byDex, byName } = loadSpecies();
  const indexHtml = await fetchText(INDEX_URL);
  const indexList = parseIndex(indexHtml);

  const dexToUrl = new Map();
  const noMatch = [];
  for (const d of dex) {
    const hit = pickLastMatch(d.name, indexList);
    if (hit && hit.href) dexToUrl.set(d.dexId, hit.href);
    else noMatch.push({ dexId: d.dexId, name: d.name });
  }

  const urlToDex = new Map();
  for (const d of dex) {
    const u = dexToUrl.get(d.dexId);
    if (!u) continue;
    const arr = urlToDex.get(u) || [];
    arr.push(d);
    urlToDex.set(u, arr);
  }

  const urls = Array.from(urlToDex.keys());
  const parsedByUrl = new Map();
  const fetchErrors = [];
  let cursor = 0;
  const workers = 8;

  async function worker() {
    while (cursor < urls.length) {
      const i = cursor++;
      const url = urls[i];
      try {
        const html = await fetchText(url);
        const sample = urlToDex.get(url)[0];
        const skills = parseSkills(html);
        const race = parseRace(html, sample.dexId, sample.name);
        parsedByUrl.set(url, { skills, race });
      } catch (e) {
        fetchErrors.push({ url, err: String(e && e.message || e) });
      }
    }
  }

  await Promise.all(Array.from({ length: workers }, () => worker()));

  let skillsHit = 0;
  let raceHit = 0;
  let updated = 0;
  for (const d of dex) {
    const url = dexToUrl.get(d.dexId) || '';
    const parsed = parsedByUrl.get(url) || { skills: [], race: null };
    const keyDex = String(d.dexId);
    const old = byDex[keyDex] || byName[d.name] || {};

    const forms = Array.isArray(old.forms) && old.forms.length ? old.forms : [{ name: d.name, img: '' }, { name: d.name, img: '' }, { name: d.name, img: '' }];
    const skills = parsed.skills.length ? parsed.skills : (Array.isArray(old.skills) ? old.skills : []);
    const raceStats = parsed.race || old.raceStats || null;

    if (parsed.skills.length) skillsHit += 1;
    if (parsed.race) raceHit += 1;

    const next = {
      dexId: d.dexId,
      name: d.name,
      element: d.element,
      sourceUrl: url || old.sourceUrl || '',
      forms,
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
    indexCount: indexList.length,
    matched: dexToUrl.size,
    noMatchCount: noMatch.length,
    uniqueUrlCount: urls.length,
    parsedUrlCount: parsedByUrl.size,
    fetchErrorCount: fetchErrors.length,
    updated,
    skillsHit,
    raceHit,
    noMatch: noMatch.slice(0, 100),
    fetchErrors: fetchErrors.slice(0, 100)
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
})();
