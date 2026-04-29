const fs = require('fs');
const vm = require('vm');

const DEX_FILE = 'aola-dex-1-100.js';
const SPECIES_FILE = 'aola-species-data.js';
const OUT_REPORT = '__regen_1_796_from_4399_report.json';

const ELEMENT_SHORT_MAP = {
  '普通': '普通系',
  '木': '木系',
  '水': '水系',
  '火': '火系',
  '土': '土系',
  '冰': '冰系',
  '电': '电系',
  '飞行': '飞行系',
  '机械': '机械系',
  '数码': '数码系',
  '上古': '上古系',
  '神秘': '神秘系',
  '格斗': '格斗系',
  '暗黑': '暗黑系',
  '光明': '光明系',
  '爬行': '爬行系',
  '龙': '龙系',
  '圣灵': '圣灵系',
  '神兵': '神兵系',
  '王': '王系',
  '毒': '毒系'
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const normalize = (s) => String(s || '').replace(/[\u200b\u00a0]/g, ' ').replace(/\s+/g, ' ').trim();

function stripTags(html) {
  return normalize(
    String(html || '')
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

function safeInt(v, fallback = 0) {
  const n = Number(String(v || '').replace(/[^\d-]/g, ''));
  if (!Number.isFinite(n)) return fallback;
  return Math.floor(n);
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
  const parts = txt.split(/\s+/).filter(Boolean);
  let attackType = parts.find((p) => p.includes('攻击')) || '普通攻击';
  let elementToken = parts[parts.length - 1] || '普通';
  if (elementToken.includes('攻击')) elementToken = '普通';
  const element = normalizeElementToken(elementToken);
  return `${element}/${attackType}`;
}

function parseSkillsFromHtml(html) {
  const tables = [...String(html).matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  let target = '';
  for (const t of tables) {
    if (t.includes('技能名称') && t.includes('PP') && (t.includes('技能描述') || t.includes('技能属性'))) {
      target = t;
      break;
    }
  }
  if (!target) return [];

  const rows = [...target.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
  const out = [];
  for (const row of rows) {
    const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => stripTags(m[1]));
    const cells = tds.filter((x) => normalize(x) !== '');
    if (cells.length < 6) continue;
    const joined = cells.join('|');
    if (joined.includes('技能名称') || joined.includes('等级') || joined.includes('命中率') || joined.includes('技能表')) continue;

    const name = normalize(cells[0]);
    if (!name || name.length > 24) continue;
    const level = safeInt(cells[1], 0);
    const powerCell = normalize(cells[2]);
    const ppCell = normalize(cells[3]);
    const typeCell = normalize(cells[4]);
    const desc = normalize(cells[cells.length - 1]);

    let power = -1;
    if (/^[-—－]+$/.test(powerCell)) power = -1;
    else {
      const n = safeInt(powerCell, -1);
      power = n < 0 ? -1 : n;
    }

    const pp = /^[-—－]+$/.test(ppCell) ? 0 : Math.max(0, safeInt(ppCell, 0));
    const type = parseSkillType(typeCell);

    out.push({ name, level: Math.max(0, level), power, pp, type, desc: desc || '暂无描述' });
  }

  const uniq = [];
  const seen = new Set();
  for (const s of out) {
    const key = `${s.name}__${s.level}__${s.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(s);
  }
  return uniq.sort((a, b) => a.level - b.level);
}

function parseRaceFromHtml(html, dexId, name) {
  const tables = [...String(html).matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  const keys = ['体力', '攻击', '防御', '特攻', '特防', '速度'];

  for (const t of tables) {
    if (!t.includes('种族值')) continue;
    const rows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) => m[1]);
    const parsedRows = rows.map((r) => [...r.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((m) => stripTags(m[1])).filter(Boolean));

    for (let i = 0; i < parsedRows.length - 1; i++) {
      const header = parsedRows[i].map((x) => normalize(x));
      const hit = keys.filter((k) => header.some((h) => h.includes(k)));
      if (hit.length < 4) continue;

      const next = parsedRows[i + 1].map((x) => normalize(x));
      const nums = next.map((x) => safeInt(x, NaN)).filter((n) => Number.isFinite(n));
      if (nums.length < 6) continue;

      const map = {};
      let ni = 0;
      for (const h of header) {
        const k = keys.find((kk) => h.includes(kk));
        if (!k) continue;
        if (ni >= nums.length) break;
        map[k] = nums[ni++];
      }
      if (!Number.isFinite(map['体力']) || !Number.isFinite(map['攻击']) || !Number.isFinite(map['防御']) || !Number.isFinite(map['特攻']) || !Number.isFinite(map['特防']) || !Number.isFinite(map['速度'])) continue;

      const hp = clamp(map['体力'], 1, 255);
      const atk = clamp(map['攻击'], 1, 255);
      const def = clamp(map['防御'], 1, 255);
      const spAtk = clamp(map['特攻'], 1, 255);
      const spDef = clamp(map['特防'], 1, 255);
      const speed = clamp(map['速度'], 1, 255);
      return { id: String(dexId), name, hp, atk, def, spAtk, spDef, speed, total: hp + atk + def + spAtk + spDef + speed };
    }
  }

  return null;
}

function ensureHttps(url) {
  const s = String(url || '').trim();
  if (!s) return '';
  if (s.startsWith('//')) return `https:${s}`;
  return s.replace(/^http:\/\//i, 'https://');
}

async function fetchGbk(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const ab = await res.arrayBuffer();
    return new TextDecoder('gbk').decode(ab);
  } finally {
    clearTimeout(timer);
  }
}

function loadDexEntries() {
  const t = fs.readFileSync(DEX_FILE, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(t, ctx);
  const arr = Array.isArray(ctx.window.AOLA_DEX_1_100) ? ctx.window.AOLA_DEX_1_100 : [];
  return arr.filter((x) => Number(x.dexId) >= 1 && Number(x.dexId) <= 796).map((x) => ({
    dexId: Number(x.dexId),
    name: normalize(x.name),
    element: normalize(x.element) || '未知系',
    sourceUrl: ensureHttps(x.sourceUrl)
  }));
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

async function main() {
  const dex = loadDexEntries();
  const { byDex, byName } = loadSpecies();

  const urlMap = new Map();
  for (const d of dex) {
    if (!d.sourceUrl) continue;
    const list = urlMap.get(d.sourceUrl) || [];
    list.push(d);
    urlMap.set(d.sourceUrl, list);
  }

  const urls = Array.from(urlMap.keys());
  const parsedByUrl = new Map();
  const errors = [];

  const workers = 6;
  let idx = 0;
  async function worker() {
    while (idx < urls.length) {
      const i = idx++;
      const url = urls[i];
      try {
        const html = await fetchGbk(url);
        const skills = parseSkillsFromHtml(html);
        const sample = urlMap.get(url)[0];
        const race = parseRaceFromHtml(html, sample.dexId, sample.name);
        parsedByUrl.set(url, { skills, race });
      } catch (e) {
        errors.push({ url, err: String(e && e.message || e) });
      }
    }
  }

  await Promise.all(Array.from({ length: workers }, () => worker()));

  let updated = 0;
  let skillsHit = 0;
  let raceHit = 0;

  for (const d of dex) {
    const keyDex = String(d.dexId);
    const old = byDex[keyDex] || byDex[d.dexId] || byName[d.name] || {};
    const forms = Array.isArray(old.forms) && old.forms.length ? old.forms : [{ name: d.name, img: '' }, { name: d.name, img: '' }, { name: d.name, img: '' }];
    const sourceUrl = d.sourceUrl || old.sourceUrl || '';
    const parsed = parsedByUrl.get(sourceUrl) || { skills: [], race: null };

    const skills = Array.isArray(parsed.skills) && parsed.skills.length ? parsed.skills : (Array.isArray(old.skills) ? old.skills : []);
    const raceStats = parsed.race || old.raceStats || null;

    if (parsed.skills && parsed.skills.length) skillsHit += 1;
    if (parsed.race) raceHit += 1;

    const next = {
      dexId: d.dexId,
      name: d.name,
      element: d.element,
      sourceUrl,
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
    sourceUrlTotal: urls.length,
    updated,
    skillsHit,
    raceHit,
    errorCount: errors.length,
    errors: errors.slice(0, 120)
  };
  fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2), 'utf8');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
