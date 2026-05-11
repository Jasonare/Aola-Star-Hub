
if (!window.Vue) {
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = "<div style='padding:24px;font-weight:700;color:#dc2626'>Vue 加载失败，请检查 ./vendor/vue.global.prod.js 是否存在。</div>";
  }
  throw new Error("Vue failed to load from local vendor file");
}
const { createApp, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } = window.Vue;

const cleanupOrphanTemplateOverlays = () => {
  if (!document || !document.body) return;
  const app = document.getElementById("app");
  if (!app) return;
  const children = Array.prototype.slice.call(document.body.children || []);
  children.forEach((el) => {
    if (!el || el === app || el.tagName === "SCRIPT") return;
    const txt = String(el.textContent || "");
    const attrs = el.getAttributeNames ? el.getAttributeNames() : [];
    const hasVueAttr = attrs.some((a) => a.startsWith("v-") || a.startsWith(":") || a.startsWith("@"));
    const hasMustache = txt.includes("{{") || txt.includes("}}");
    const hit = hasVueAttr || hasMustache;
    if (hit && el.parentNode === document.body) {
      app.appendChild(el);
    }
  });
};

cleanupOrphanTemplateOverlays();

const STORAGE_KEY = "aola_battle_platform_v2_ascii";
const SAVE_FILE_PREFIX = "aola_battle_save_";
const STARTER_DEX_IDS = [1, 4, 7];
const BASE_GUARDIAN_NAMES = ["冰拳艾司", "沙麒麟", "金刚库巴", "木面侠", "火花龙"];
const EXTRA_GUARDIAN_NAMES = [
  "烈焰鸟", "合金猛将", "利刺大黄蜂", "雷纳瑞", "魂斗鱼", "浮云尊者", "神武月", "影刃", "年兽", "麦斗元帅",
  "山脉之魂", "星光角斗士", "时间之神", "天使莱特", "战无炎", "极速威锋", "满月巨灵", "天之巨灵", "黑夜童心", "远古灵龟",
  "暴雪山神", "赤影飞狐", "赤魔导士", "天女若希", "神罗麦提", "超T兔", "猪猪超人", "翡冷翠", "魔灯鬼王", "岩波斗魂者",
  "友人契约书", "多古拉伯爵", "伊泽", "迦娜", "蓝羽灵者", "剑圣太白", "猎空", "奥弗", "赫提"
];
const EXTRA_GUARDIAN_ALIAS = {
  "浮云尊者兄弟": "浮云尊者",
  "终极麦斗猪": "麦斗元帅",
  "天使菜特": "天使莱特",
  "鬼王": "魔灯鬼王"
};
const GUARDIAN_NAMES = Array.from(new Set([...BASE_GUARDIAN_NAMES, ...EXTRA_GUARDIAN_NAMES]));
const GUARDIAN_LEVELS = [30, 40, 50, 60, 70, 80, 90, 100];
const EXTRA_GUARDIAN_LEVELS = [100];
const MAX_OPEN_CHALLENGE_DEX_ID = 796;
const BATTLE_BGM_SRC = "./BGM/小k橘子 - 战斗 (2015).ogg";
const HATCH_MS = 5 * 60 * 1000;
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='24' fill='%23f1f5f9'/%3E%3Ccircle cx='60' cy='48' r='22' fill='%2394a3b8' opacity='0.35'/%3E%3Crect x='24' y='78' width='72' height='14' rx='7' fill='%2394a3b8' opacity='0.35'/%3E%3C/svg%3E";
const ELEMENT_RELATION_IMAGE = "./属性克制.jpg";

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const normalize = (s) => String(s || "").replace(/[\u200b\u00a0]/g, "").trim();
const ensureHttps = (url) => String(url || "").replace(/^http:\/\//i, "https://");
const resolveGuardianName = (name) => EXTRA_GUARDIAN_ALIAS[normalize(name)] || normalize(name);
const isExtraGuardianName = (name) => EXTRA_GUARDIAN_NAMES.includes(resolveGuardianName(name));
const isGuardianName = (name) => GUARDIAN_NAMES.includes(resolveGuardianName(name));
const normalizeElementName = (element) => {
  let raw = normalize(element);
  if (raw) {
    raw = raw.replace(/\uFFFD/g, "系");
    raw = raw.replace(/\?/g, "系");
    raw = raw.replace(/(木|水|火|土|冰|电|机械|数码|神秘|飞行|爬行|上古|格斗|暗黑|光明|龙|圣灵|神兵|王|普通|毒)$/, "$1系");
    raw = raw.replace(/系系$/g, "系");
  }
  if (!raw) return "";
  if (PET_TYPE_ICON[raw]) return raw;
  const alias = {
    "木": "木系",
    "水": "水系",
    "火": "火系",
    "土": "土系",
    "冰": "冰系",
    "电": "电系",
    "神秘": "神秘系",
    "机械": "机械系",
    "飞行": "飞行系",
    "爬行": "爬行系",
    "上古": "上古系",
    "格斗": "格斗系",
    "暗黑": "暗黑系",
    "光明": "光明系",
    "龙": "龙系",
    "圣灵": "圣灵系",
    "神兵": "神兵系",
    "王": "王系",
    "普通": "普通系",
    "毒": "毒系",
    "超暗系": "暗黑系",
    "超木系": "木系",
    "超水系": "水系",
    "超火系": "火系",
    "超土系": "土系",
    "超电系": "电系"
  };
  if (alias[raw]) return alias[raw];
  if (!raw.endsWith("系")) {
    const withXi = `${raw}系`;
    if (PET_TYPE_ICON[withXi]) return withXi;
  }
  return raw;
};

const PET_TYPE_ICON = {
  "木系": "./type/木系.png",
  "水系": "./type/水系.png",
  "火系": "./type/火系.png",
  "土系": "./type/土系.png",
  "冰系": "./type/冰系.png",
  "电系": "./type/电系.png",
  "数码系": "./type/数码系.png",
  "机械系": "./type/机械系.png",
  "神秘系": "./type/神秘系.png",
  "飞行系": "./type/飞行系.png",
  "爬行系": "./type/爬行系.png",
  "上古系": "./type/上古系.png",
  "格斗系": "./type/格斗系.png",
  "暗黑系": "./type/暗黑系.png",
  "光明系": "./type/光明系.png",
  "龙系": "./type/龙系.png",
  "圣灵系": "./type/圣灵系.png",
  "神兵系": "./type/神兵系.png",
  "王系": "./type/王系.png",
  "普通系": "./type/普通系.png",
  "毒系": "./type/毒系.png",
  "未知系": ""
};

const ELEMENT_CHART = {
  "水系": { strong: ["火系", "土系", "爬行系"], weak: ["上古系", "木系"] },
  "火系": { strong: ["冰系", "机械系", "木系"], weak: ["水系", "上古系", "光明系"] },
  "木系": { strong: ["土系", "水系", "爬行系", "光明系"], weak: ["火系", "上古系", "飞行系", "机械系"] },
  "冰系": { strong: ["上古系", "飞行系", "木系"], weak: ["火系", "水系", "机械系"] },
  "土系": { strong: ["火系", "冰系", "飞行系"], weak: ["机械系", "爬行系", "格斗系"] },
  "电系": { strong: ["水系", "飞行系"], weak: ["木系", "上古系", "光明系"] },
  "爬行系": { strong: ["火系", "机械系", "土系", "电系"], weak: ["木系"] },
  "飞行系": { strong: ["木系", "格斗系"], weak: ["电系", "土系", "机械系"] },
  "机械系": { strong: ["冰系", "土系"], weak: ["水系", "火系"] },
  "数码系": { strong: ["神秘系"], weak: ["机械系", "暗黑系", "光明系"] },
  "上古系": { strong: ["上古系"], weak: ["机械系"] },
  "神秘系": { strong: ["格斗系"], weak: ["机械系", "神秘系"] },
  "格斗系": { strong: ["冰系", "土系", "机械系", "暗黑系"], weak: ["飞行系", "神秘系"] },
  "暗黑系": { strong: ["神秘系", "数码系"], weak: ["格斗系", "光明系"] },
  "光明系": { strong: ["神秘系", "数码系", "暗黑系"], weak: ["木系", "土系", "冰系", "机械系"] }
};

const expRequired = (level) => (level >= 100 ? Infinity : Math.floor(60 + level * 18 + Math.pow(level, 1.45) * 8));
const calcWinExp = (targetLevel) => {
  const lv = clamp(Number(targetLevel) || 1, 1, 100);
  return Math.floor(80 + lv * 28 + lv * lv * 1.9);
};
const calcLoseExp = () => 0;

const normalizeBagIds = (rawIds, activePets) => {
  const validIds = new Set(activePets.map((p) => p.id));
  const out = [];
  const seen = new Set();
  (Array.isArray(rawIds) ? rawIds : []).forEach((id) => {
    const sid = String(id || "");
    if (!sid || !validIds.has(sid) || seen.has(sid)) return;
    seen.add(sid);
    out.push(sid);
  });
  while (out.length < 6) out.push("");
  return out.slice(0, 6);
};

const sanitizeBattleLog = (rawList) => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map((row) => {
    const item = row && typeof row === "object" ? row : {};
    return {
      id: String(item.id || uid()),
      win: Boolean(item.win),
      attacker: normalize(item.attacker),
      attackerLevel: clamp(Number(item.attackerLevel) || 1, 1, 100),
      target: normalize(item.target),
      targetLevel: clamp(Number(item.targetLevel) || 1, 1, 100),
      expGain: Math.max(0, Number(item.expGain) || 0),
      time: normalize(item.time)
    };
  }).filter((row) => row.attacker || row.target).slice(0, 50);
};

const buildFallbackSpecies = (dexEntry) => {
  const name = dexEntry.name;
  const img = ensureHttps(dexEntry.image);
  return {
    forms: [
      { name: `${name}·初阶`, img },
      { name: `${name}·进阶`, img },
      { name, img }
    ],
    skills: [
      { name: `${name}冲击`, level: 1, power: 95, pp: 20, type: "普通系/普通攻击", desc: "基础伤害。" },
      { name: `${name}能量炮`, level: 8, power: 120, pp: 15, type: "神秘系/特殊攻击", desc: "攻击敌方单体。" },
      { name: `${name}守护`, level: 16, power: -1, pp: 10, type: "普通系/属性攻击", desc: "提升自身防御。" },
      { name: `${name}裂风斩`, level: 32, power: 180, pp: 8, type: "飞行系/普通攻击", desc: "中高威力输出。" },
      { name: `${name}终焰星陨`, level: 56, power: 300, pp: 4, type: "神秘系/特殊攻击", desc: "终结技能。" }
    ]
  };
};

const petId = (pet) => String((pet && pet.id) || "");
const eggId = (egg) => String((egg && egg.id) || "");
const rowId = (row) => String((row && row.id) || uid());
const safeSkillName = (skill) => String((skill && skill.name) || "");
const safeSkillType = (skill) => String((skill && skill.type) || "");
const safeSkillPower = (skill) => (skill && Number.isFinite(Number(skill.power)) ? Number(skill.power) : 0);
const safeSkillPP = (skill) => (skill && Number.isFinite(Number(skill.pp)) ? Number(skill.pp) : 0);
const safeSkillAccuracy = (skill) => {
  const n = skill && Number.isFinite(Number(skill.accuracy)) ? Number(skill.accuracy) : 100;
  return n < 0 ? 100 : n;
};
const skillAttackTypeLabel = (typeText) => {
  const t = String(typeText || "");
  if (t.includes("/")) return String(t.split("/")[1] || "").trim() || "普通攻击";
  return "普通攻击";
};
const normalizeSkillKey = (name) => normalize(name);
const safeNonNegInt = (v, fallback = 0) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
};
const STAT_KEYS = ["atk", "hp", "spAtk", "def", "spDef", "speed"];
const createZeroStats = () => ({ hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 });
const randInt = (min, max) => {
  const a = Math.floor(Number(min) || 0);
  const b = Math.floor(Number(max) || 0);
  if (b <= a) return a;
  return a + Math.floor(Math.random() * (b - a + 1));
};
const createRandomHatchTalent = () => ({
  hp: randInt(1, 52),
  atk: randInt(1, 52),
  def: randInt(1, 52),
  spAtk: randInt(1, 52),
  spDef: randInt(1, 52),
  speed: randInt(1, 52)
});
const talentGradeByTotal = (total) => {
  const t = Math.max(0, Number(total) || 0);
  if (t >= 372) return "唯我独尊";
  if (t >= 360) return "天下无双";
  if (t >= 300) return "王者无敌";
  if (t >= 240) return "万众瞩目";
  if (t >= 180) return "千载难逢";
  if (t >= 120) return "百里挑一";
  if (t >= 60) return "十分常见";
  return "一无是处";
};
const createUniformTalent30 = () => ({ hp: 30, atk: 30, def: 30, spAtk: 30, spDef: 30, speed: 30 });
const createUniformTalent50 = () => ({ hp: 50, atk: 50, def: 50, spAtk: 50, spDef: 50, speed: 50 });
const createGuardianStudy = () => ({ hp: 0, atk: 102, def: 102, spAtk: 102, spDef: 102, speed: 102 });
const normalizeTalent = (raw) => {
  const s = raw && typeof raw === "object" ? raw : {};
  return {
    hp: clamp(safeNonNegInt(s.hp), 0, 62),
    atk: clamp(safeNonNegInt(s.atk), 0, 62),
    def: clamp(safeNonNegInt(s.def), 0, 62),
    spAtk: clamp(safeNonNegInt(s.spAtk), 0, 62),
    spDef: clamp(safeNonNegInt(s.spDef), 0, 62),
    speed: clamp(safeNonNegInt(s.speed), 0, 62)
  };
};
const normalizeStudy = (raw) => {
  const s = raw && typeof raw === "object" ? raw : {};
  const out = {
    hp: clamp(safeNonNegInt(s.hp), 0, 255),
    atk: clamp(safeNonNegInt(s.atk), 0, 255),
    def: clamp(safeNonNegInt(s.def), 0, 255),
    spAtk: clamp(safeNonNegInt(s.spAtk), 0, 255),
    spDef: clamp(safeNonNegInt(s.spDef), 0, 255),
    speed: clamp(safeNonNegInt(s.speed), 0, 255)
  };
  let total = out.hp + out.atk + out.def + out.spAtk + out.spDef + out.speed;
  if (total <= 510) return out;
  // 官方学习力总和上限 510，优先回退最后编辑项之外的超额
  for (const k of ["speed", "spDef", "def", "spAtk", "atk", "hp"]) {
    if (total <= 510) break;
    const cut = Math.min(out[k], total - 510);
    out[k] -= cut;
    total -= cut;
  }
  return out;
};
const calcAbilityStat = (base, talent, study, level, nature = 1) => {
  const b = safeNonNegInt(base);
  const t = clamp(safeNonNegInt(talent), 0, 62);
  const ev = clamp(safeNonNegInt(study), 0, 255);
  const lv = clamp(safeNonNegInt(level, 1), 1, 100);
  const n = Number(nature);
  const natureVal = Number.isFinite(n) ? n : 1;
  // 对齐 4399 奥拉星计算器：floor( floor(core * 2) * nature )
  const core = ((b * 2 + t + Math.floor(ev / 4)) * lv) / 100 + 5;
  return Math.floor(Math.floor(core * 2) * natureVal);
};
const calcAbilityHp = (base, talent, study, level) => {
  const b = safeNonNegInt(base);
  const t = clamp(safeNonNegInt(talent), 0, 62);
  const ev = clamp(safeNonNegInt(study), 0, 255);
  const lv = clamp(safeNonNegInt(level, 1), 1, 100);
  // 对齐 4399 奥拉星计算器：floor((core + level + 10) * 2)
  const core = ((b * 2 + t + Math.floor(ev / 4)) * lv) / 100 + lv + 10;
  return Math.floor(core * 2);
};
const BATTLE_STAGE_KEYS = ["atk", "def", "spAtk", "spDef", "speed", "accuracy", "evasion"];
const BATTLE_BASE_STAGE_KEYS = ["atk", "def", "spAtk", "spDef", "speed"];
const ALL_ABILITY_STAGE_KEYS = ["atk", "def", "spAtk", "spDef", "speed", "accuracy", "evasion", "critStage"];
const ELEMENT_NAMES = Object.keys(PET_TYPE_ICON || {});
const STATUS_LABEL_MAP = { poison: "中毒", burn: "烧伤", sleep: "睡眠", paralyze: "麻痹", freeze: "冰冻", leech: "寄生" };
const SKILL_STATUS_HINT = ["属性攻击", "属性"];
const ATTACK_TYPE_HINT = ["普通攻击", "特殊攻击", "属性攻击"];
const cnNumToInt = (text, fallback = 1) => {
  const t = normalize(text);
  if (!t) return fallback;
  const n = Number(t);
  if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  const map = { "零": 0, "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6 };
  if (map[t] !== undefined) return map[t];
  return fallback;
};
const parseRatioFromText = (text, fallback = null) => {
  const t = normalize(text).replace(/％/g, "%");
  if (!t) return fallback;
  if (t.includes("一半")) return 0.5;
  if (t.includes("三分之一")) return 1 / 3;
  if (t.includes("四分之一")) return 1 / 4;
  if (t.includes("五分之一")) return 1 / 5;
  if (t.includes("六分之一")) return 1 / 6;
  if (t.includes("八分之一")) return 1 / 8;
  if (t.includes("十六分之一")) return 1 / 16;
  const frac = t.match(/(\d+)\s*\/\s*(\d+)/);
  if (frac) {
    const a = Number(frac[1]);
    const b = Number(frac[2]);
    if (a > 0 && b > 0) return a / b;
  }
  const pct = t.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pct) return Number(pct[1]) / 100;
  return fallback;
};
const createBattleState = () => ({
  stages: { atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0, accuracy: 0, evasion: 0 },
  critStage: 0,
  statuses: { poison: 0, burn: 0, sleep: 0, paralyze: 0, freeze: 0, leech: 0 },
  skipTurns: 0,
  timedEffects: [],
  onDamagedEffects: []
});
const normalizeBattleState = (state) => {
  const s = state && typeof state === "object" ? state : createBattleState();
  const out = createBattleState();
  BATTLE_STAGE_KEYS.forEach((k) => {
    out.stages[k] = clamp(Number(s.stages && s.stages[k]) || 0, -6, 6);
  });
  Object.keys(out.statuses).forEach((k) => {
    out.statuses[k] = Math.max(0, Math.floor(Number(s.statuses && s.statuses[k]) || 0));
  });
  out.critStage = clamp(Math.floor(Number(s.critStage) || 0), -6, 6);
  out.skipTurns = Math.max(0, Math.floor(Number(s.skipTurns) || 0));
  out.timedEffects = Array.isArray(s.timedEffects) ? s.timedEffects.map((e) => ({
    kind: normalize(e && e.kind),
    turns: Math.max(1, Math.floor(Number(e && e.turns) || 1)),
    data: e && typeof e.data === "object" ? { ...e.data } : {}
  })) : [];
  out.onDamagedEffects = Array.isArray(s.onDamagedEffects) ? s.onDamagedEffects.map((e) => ({
    turns: Math.max(1, Math.floor(Number(e && e.turns) || 1)),
    chance: clamp(Number(e && e.chance) || 0, 0, 1),
    allStatsDelta: clamp(Math.floor(Number(e && e.allStatsDelta) || 0), -6, 6),
    keys: Array.isArray(e && e.keys) ? e.keys.filter((k) => typeof k === "string") : [],
    delta: clamp(Math.floor(Number(e && e.delta) || 0), -6, 6),
    applyTo: normalize(e && e.applyTo) === "self" ? "self" : "attacker",
    trigger: normalize(e && e.trigger) === "attacked" ? "attacked" : "damaged"
  })) : [];
  return out;
};
const parseSkillTypeMeta = (typeText) => {
  const raw = normalize(typeText);
  const tokens = raw.split(/[\/｜|]/g).map((x) => normalize(x)).filter(Boolean);
  let element = "";
  let attackType = "";
  tokens.forEach((t) => {
    if (!attackType && ATTACK_TYPE_HINT.some((k) => t.includes(k))) attackType = ATTACK_TYPE_HINT.find((k) => t.includes(k)) || "";
    if (!element) {
      if (t.endsWith("系")) element = t;
      else if (ELEMENT_NAMES.includes(`${t}系`)) element = `${t}系`;
      else if (ELEMENT_NAMES.includes(t)) element = t;
    }
  });
  if (!attackType && SKILL_STATUS_HINT.some((k) => raw.includes(k))) attackType = "属性攻击";
  if (!attackType && raw.includes("特殊")) attackType = "特殊攻击";
  if (!attackType && raw.includes("普通")) attackType = "普通攻击";
  if (!element) {
    const hit = ELEMENT_NAMES.find((el) => normalize(el) && raw.includes(normalize(el)));
    if (hit) element = hit;
  }
  if (!element) element = "未知系";
  if (!attackType) attackType = "普通攻击";
  return { element, attackType };
};
const parseSkillAttackKind = (typeText) => {
  const meta = parseSkillTypeMeta(typeText);
  if (meta.attackType.includes("特殊攻击")) return "special";
  if (meta.attackType.includes("普通攻击")) return "physical";
  return "status";
};
const parseSkillElement = (typeText) => parseSkillTypeMeta(typeText).element || "未知系";
const critChanceByStage = (stage) => {
  const s = clamp(Math.floor(Number(stage) || 0), -6, 6);
  if (s <= 0) return 1 / 16;
  if (s === 1) return 1 / 8;
  if (s === 2) return 1 / 2;
  return 1;
};
const stageMultiplier = (stage) => {
  const s = clamp(Math.floor(Number(stage) || 0), -6, 6);
  return s >= 0 ? (2 + s) / 2 : 2 / (2 - s);
};
const getSideState = (scene, side) => {
  if (!scene) return createBattleState();
  if (side === "attacker") {
    if (!scene.attackerState || typeof scene.attackerState !== "object") scene.attackerState = createBattleState();
    return scene.attackerState;
  }
  if (!scene.targetState || typeof scene.targetState !== "object") scene.targetState = createBattleState();
  return scene.targetState;
};
const getBattleAbilityStat = (scene, side, key) => {
  const ability = side === "attacker" ? scene.attackerAbility : scene.targetAbility;
  const state = getSideState(scene, side);
  const base = Math.max(1, Number(ability && ability[key]) || 1);
  const m = stageMultiplier(state.stages[key] || 0);
  let val = Math.max(1, Math.floor(base * m));
  if (key === "def") {
    const hasDefenseHalve = (state.timedEffects || []).some((e) => normalize(e && e.kind) === "defenseHalve");
    if (hasDefenseHalve) val = Math.max(1, Math.floor(val * 0.5));
  }
  return val;
};
const applyStageDelta = (scene, side, keys, delta) => {
  const state = getSideState(scene, side);
  const n = clamp(Math.floor(Number(delta) || 0), -6, 6);
  const list = Array.isArray(keys) ? keys : [keys];
  const changed = [];
  list.forEach((k) => {
    if (k === "critStage") {
      const prevCrit = state.critStage || 0;
      state.critStage = clamp(prevCrit + n, -6, 6);
      if (state.critStage !== prevCrit) changed.push("critStage");
      return;
    }
    if (!BATTLE_STAGE_KEYS.includes(k)) return;
    const prev = state.stages[k];
    state.stages[k] = clamp(prev + n, -6, 6);
    if (state.stages[k] !== prev) changed.push(k);
  });
  return changed;
};
const battleStatLabel = (k) => (
  k === "atk" ? "攻击" :
  k === "def" ? "防御" :
  k === "spAtk" ? "特攻" :
  k === "spDef" ? "特防" :
  k === "speed" ? "速度" :
  k === "accuracy" ? "命中" :
  k === "evasion" ? "闪避" :
  k === "critStage" ? "暴击" : k
);
const healSideByRatio = (scene, side, ratio) => {
  const keyHp = side === "attacker" ? "attackerHp" : "targetHp";
  const keyMax = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const maxHp = Math.max(1, Number(scene[keyMax]) || 1);
  const hp = Math.max(0, Number(scene[keyHp]) || 0);
  const heal = Math.max(1, Math.floor(maxHp * clamp(Number(ratio) || 0, 0, 1)));
  const next = clamp(hp + heal, 0, maxHp);
  scene[keyHp] = next;
  return Math.max(0, next - hp);
};
const addTimedEffect = (scene, side, effect) => {
  const state = getSideState(scene, side);
  state.timedEffects.push({
    kind: normalize(effect && effect.kind),
    turns: Math.max(1, Math.floor(Number(effect && effect.turns) || 1)),
    data: effect && typeof effect.data === "object" ? { ...effect.data } : {}
  });
};
const addOnDamagedEffect = (scene, side, effect) => {
  const state = getSideState(scene, side);
  state.onDamagedEffects.push({
    turns: Math.max(1, Math.floor(Number(effect && effect.turns) || 1)),
    chance: clamp(Number(effect && effect.chance) || 0, 0, 1),
    allStatsDelta: clamp(Math.floor(Number(effect && effect.allStatsDelta) || 0), -6, 6),
    keys: Array.isArray(effect && effect.keys) ? effect.keys.filter((k) => typeof k === "string") : [],
    delta: clamp(Math.floor(Number(effect && effect.delta) || 0), -6, 6),
    applyTo: normalize(effect && effect.applyTo) === "self" ? "self" : "attacker",
    trigger: normalize(effect && effect.trigger) === "attacked" ? "attacked" : "damaged"
  });
};
const cleanupExpiredEffects = (state) => {
  if (!state) return;
  state.timedEffects = (state.timedEffects || []).filter((e) => Number(e.turns) > 0);
  state.onDamagedEffects = (state.onDamagedEffects || []).filter((e) => Number(e.turns) > 0);
};
const pushBattleLog = (scene, text) => {
  if (!scene || !text) return;
  if (!Array.isArray(scene.logs)) scene.logs = [];
  scene.logs.push(String(text));
};
const statusLabel = (k) => STATUS_LABEL_MAP[k] || k;
const buildStatusBadges = (state) => {
  const s = normalizeBattleState(state);
  const out = [];
  Object.keys(STATUS_LABEL_MAP).forEach((k) => {
    const turns = Math.max(0, Number(s.statuses[k]) || 0);
    if (turns > 0) out.push({ key: k, label: statusLabel(k), turns, desc: `${statusLabel(k)}，剩余${turns}回合` });
  });
  if (s.skipTurns > 0) out.push({ key: "skip", label: "停行动", turns: s.skipTurns, desc: `无法行动，剩余${s.skipTurns}回合` });
  return out;
};
const timedEffectBadgeMeta = (e) => {
  const kind = normalize(e && e.kind);
  const turns = Math.max(0, Number(e && e.turns) || 0);
  const d = e && e.data ? e.data : {};
  if (kind === "damageReduction") {
    const ratio = Math.round((Number(d.ratio) || 0) * 100);
    return { key: `dr_${ratio}`, label: `减伤${ratio}%`, turns, desc: `受到伤害降低${ratio}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "elementPowerBuff") {
    const factorRaw = Number(d.factor) || 1;
    const factor = Math.round(factorRaw * 100);
    const deltaPct = Math.round((factorRaw - 1) * 100);
    const sign = deltaPct >= 0 ? "+" : "";
    const element = normalize(d.element) || "未知系";
    const action = deltaPct >= 0 ? "提升" : "降低";
    return {
      key: `ep_${element}_${factor}`,
      label: `${element}威力${sign}${deltaPct}%`,
      turns,
      desc: `${element}技能威力${action}${Math.abs(deltaPct)}%（当前${factor}%），剩余${turns}回合`,
      tone: deltaPct >= 0 ? "buff" : "debuff"
    };
  }
  if (kind === "healOverTime") {
    const ratio = Number(d.ratio) || 0;
    const pct = Math.max(1, Math.round(ratio * 100));
    return { key: `hot_${pct}`, label: `回血${pct}%`, turns, desc: `每回合回复最大体力${pct}%，剩余${turns}回合`, tone: "buff" };
  }
  if (kind === "delayedStage") {
    const delta = Number(d.delta) || 0;
    const keys = Array.isArray(d.keys) ? d.keys : [];
    const action = delta >= 0 ? "提升" : "降低";
    return {
      key: `ds_${keys.join("_")}_${delta}`,
      label: `延时${action}`,
      turns,
      desc: `${turns}回合后${action}${Math.abs(delta)}级：${keys.map((k) => battleStatLabel(k)).join("、") || "能力等级"}`,
      tone: delta >= 0 ? "buff" : "debuff"
    };
  }
  if (kind === "defenseHalve") {
    return { key: "def_halve", label: "防御减半", turns, desc: "防御值减半（不可叠加）", tone: "debuff" };
  }
  return { key: kind || "effect", label: "持续效果", turns, desc: `持续效果剩余${turns}回合`, tone: "buff" };
};
const onDamagedBadgeMeta = (e) => {
  const turns = Math.max(0, Number(e && e.turns) || 0);
  if (turns <= 0) return null;
  const trigger = normalize(e && e.trigger) === "attacked" ? "受击后" : "受伤后";
  const applyTo = normalize(e && e.applyTo) === "self" ? "自身" : "攻击方";
  const delta = Number(e && e.delta) || Number(e && e.allStatsDelta) || 0;
  const keys = Array.isArray(e && e.keys) ? e.keys : [];
  const what = keys.length > 0 ? keys.map((k) => battleStatLabel(k)).join("、") : "全属性";
  const act = delta >= 0 ? "提升" : "降低";
  return {
    key: `od_${trigger}_${applyTo}_${what}_${delta}`,
    label: "受击反制",
    turns,
    desc: `${trigger}使${applyTo}${act}${Math.abs(delta)}级：${what}，剩余${turns}回合`,
    tone: delta >= 0 ? "buff" : "debuff"
  };
};
const buildTimedEffectBadges = (scene, side) => {
  const sideState = getSideState(scene, side);
  const own = sideState.timedEffects || [];
  const global = Array.isArray(scene && scene.globalTimedEffects) ? scene.globalTimedEffects : [];
  const fxBadges = own.concat(global).map((e) => timedEffectBadgeMeta(e)).filter((x) => x.turns > 0);
  const onDamagedBadges = (sideState.onDamagedEffects || []).map((e) => onDamagedBadgeMeta(e)).filter(Boolean);
  return fxBadges.concat(onDamagedBadges);
};
const statusChanceFromDesc = (desc, statusKeyword = "", fallback = 1) => {
  const t = normalize(desc);
  const norm = t.replace(/％/g, "%");
  if (statusKeyword) {
    const s = String(statusKeyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nearFront = norm.match(new RegExp(`((?:\\d+(?:\\.\\d+)?\\s*%)|(?:\\d+\\s*\\/\\s*\\d+)|(?:一半))[^。；，\\n]{0,18}${s}`));
    if (nearFront) {
      const ratio = parseRatioFromText(nearFront[1], null);
      if (Number.isFinite(ratio)) return clamp(Number(ratio), 0, 1);
    }
    const nearBack = norm.match(new RegExp(`${s}[^。；，\\n]{0,18}((?:\\d+(?:\\.\\d+)?\\s*%)|(?:\\d+\\s*\\/\\s*\\d+)|(?:一半))`));
    if (nearBack) {
      const ratio = parseRatioFromText(nearBack[1], null);
      if (Number.isFinite(ratio)) return clamp(Number(ratio), 0, 1);
    }
  }
  const ratio = parseRatioFromText(norm, null);
  if (!Number.isFinite(ratio)) return clamp(Number(fallback) || 1, 0, 1);
  return clamp(Number(ratio), 0, 1);
};
const tickSideEffects = (scene, side) => {
  const state = getSideState(scene, side);
  (state.timedEffects || []).forEach((e) => { e.turns = Math.max(0, Number(e.turns) - 1); });
  (state.onDamagedEffects || []).forEach((e) => { e.turns = Math.max(0, Number(e.turns) - 1); });
  cleanupExpiredEffects(state);
};
const getDamageReductionFactor = (scene, side) => {
  const state = getSideState(scene, side);
  let ratio = 0;
  (state.timedEffects || []).forEach((e) => {
    if (e.kind === "damageReduction") {
      ratio = Math.max(ratio, clamp(Number(e.data && e.data.ratio) || 0, 0, 0.95));
    }
  });
  return 1 - ratio;
};
const getElementPowerFactorFromState = (state, skillElement) => {
  let mul = 1;
  (state && Array.isArray(state.timedEffects) ? state.timedEffects : []).forEach((e) => {
    if (e.kind !== "elementPowerBuff") return;
    const em = normalize(e.data && e.data.element);
    const me = normalize(skillElement);
    if (!em || !me || em !== me) return;
    const factor = Number(e.data && e.data.factor);
    if (Number.isFinite(factor) && factor > 0) mul *= factor;
  });
  return mul;
};
const getElementPowerFactor = (scene, side, skillElement) => {
  const state = getSideState(scene, side);
  const own = getElementPowerFactorFromState(state, skillElement);
  const global = getElementPowerFactorFromState({ timedEffects: scene.globalTimedEffects || [] }, skillElement);
  return own * global;
};
const parseSkillEffects = (skill) => {
  const name = normalize(skill && skill.name);
  const desc = normalize(skill && skill.desc);
  const effects = [];
  const add = (x) => effects.push(x);
  const MANUAL_STAGE_SKILL_NAMES = new Set();
  const hasStatusApplyIntent = (fullDesc, keyword) => {
    const t = normalize(fullDesc).replace(/％/g, "%");
    if (!t || !keyword) return false;
    // 仅在“施加异常”语义下触发，避免“若目标睡眠时/对中毒目标…”误判
    // 条件语义（判定条件）优先排除，除非同句存在明确施加动作词。
    const applyVerb = "(?:令|使|附加|造成|进入|陷入|触发)";
    const hasDirectApply = new RegExp(`${applyVerb}[^。；，\\n]{0,16}${keyword}`).test(t);
    const conditionalOnly = [
      new RegExp(`(?:若|如果|当)[^。；，\\n]{0,16}${keyword}(?:时|则|的)`),
      new RegExp(`(?:对|针对)[^。；，\\n]{0,6}${keyword}(?:状态|目标)?`),
      new RegExp(`${keyword}(?:状态)?时`)
    ].some((r) => r.test(t));
    if (conditionalOnly && !hasDirectApply) return false;
    const rules = [
      new RegExp(`${applyVerb}[^。；，\\n]{0,16}${keyword}`),
      new RegExp(`(?:概率|几率|机率|\\d+%|必定)[^。；，\\n]{0,12}${applyVerb}?[^。；，\\n]{0,12}${keyword}`),
      new RegExp(`${keyword}[^。；，\\n]{0,8}(?:状态|效果)`)
    ];
    if (rules.some((r) => r.test(t))) return true;
    return false;
  };
  const parseStatusCureEffects = (fullDesc) => {
    const t = normalize(fullDesc).replace(/％/g, "%");
    if (!t) return;
    const map = [
      { key: "中毒", status: "poison" },
      { key: "烧伤", status: "burn" },
      { key: "睡眠", status: "sleep" },
      { key: "麻痹", status: "paralyze" },
      { key: "冰冻", status: "freeze" }
    ];
    map.forEach((x) => {
      // 仅处理“解除/清除/治愈 + 自身/我方 + 异常”语义，避免误判施加异常
      const re = new RegExp(`(?:解除|清除|治愈)[^。；，\\n]{0,8}(?:自身|自己|我方)?[^。；，\\n]{0,8}${x.key}`);
      if (!re.test(t)) return;
      const chance = statusChanceFromDesc(t, x.key, 1);
      add({ kind: "statusCure", target: "self", status: x.status, chance });
    });
  };
  const parseTurns = (fallback = 3) => {
    const m = desc.match(/持续\s*([0-9一二三四五六])\s*回合/);
    return m ? Math.max(1, cnNumToInt(m[1], fallback)) : fallback;
  };
  const stageKeywordsPattern = "全属性|全能力|双攻|双防|攻防|攻击和特攻|防御和特防|攻击和速度|攻速|命中和闪避|命中率和闪避率|普攻|物攻|魔攻|攻击|防御|特攻|特防|速度|命中率|命中|闪避率|闪避|回避率|回避|暴击等级|暴击率|会心一击率|会心|暴击";
  const parseChanceNear = (text, idx) => {
    const t = normalize(text).replace(/％/g, "%");
    const left = Math.max(0, idx - 24);
    const right = Math.min(t.length, idx + 24);
    const seg = t.slice(left, right);
    const m = seg.match(/(\d+(?:\.\d+)?)\s*%\s*(?:概率|几率|机率)?|(?:概率|几率|机率)\s*(\d+(?:\.\d+)?)\s*%/);
    if (!m) return 1;
    const n = Number(m[1] || m[2]);
    return Number.isFinite(n) ? clamp(n / 100, 0, 1) : 1;
  };
  const hasHitGateNear = (text, idx) => {
    const t = normalize(text);
    const left = Math.max(0, idx - 20);
    const seg = t.slice(left, idx + 6);
    return /(命中后|命中则|命中时|若命中|命中敌方|命中对方)/.test(seg);
  };
  const parseElementPowerEffects = (text) => {
    const t = normalize(text).replace(/％/g, "%").replace(/[“”"']/g, "");
    if (!t) return;
    const elementName = "(?:木系|火系|水系|冰系|土系|电系|光明系|暗黑系|神秘系|机械系|飞行系|龙系|上古系|数码系|格斗系|王系|神兵系|圣灵系|爬行系|普通系|毒系)";
    const opWord = "(增加|提升|提高|上升|增强|降低|下降|减少|削弱|减小)";
    const turnM = t.match(/(?:持续|回合内)\s*([0-9一二三四五六十百两]+)\s*回合|([0-9一二三四五六十百两]+)\s*回合内/);
    const turns = turnM ? Math.max(1, cnNumToInt(turnM[1] || turnM[2], 3)) : 3;
    const seen = new Set();
    // 句式1：火系技能威力增加50%
    const r1 = new RegExp(`(${elementName})\\s*技能\\s*威力\\s*${opWord}\\s*(\\d+(?:\\.\\d+)?)\\s*%`, "g");
    let m = null;
    while ((m = r1.exec(t))) {
      const el = normalizeElementName(m[1]);
      const op = m[2];
      const pct = Number(m[3]);
      if (!el || !Number.isFinite(pct)) continue;
      const factor = /增加|提升|提高|上升|增强/.test(op) ? (1 + pct / 100) : Math.max(0, 1 - pct / 100);
      const k = `${el}|${factor.toFixed(4)}|${turns}`;
      if (seen.has(k)) continue;
      seen.add(k);
      add({ kind: "globalElementPower", element: el, factor, turns });
    }
    // 句式2：增加50%火系技能威力 / 降低30%水系技能威力
    const r2 = new RegExp(`${opWord}\\s*(\\d+(?:\\.\\d+)?)\\s*%\\s*(${elementName})\\s*技能\\s*威力`, "g");
    let m2 = null;
    while ((m2 = r2.exec(t))) {
      const op = m2[1];
      const pct = Number(m2[2]);
      const el = normalizeElementName(m2[3]);
      if (!el || !Number.isFinite(pct)) continue;
      const factor = /增加|提升|提高|上升|增强/.test(op) ? (1 + pct / 100) : Math.max(0, 1 - pct / 100);
      const k = `${el}|${factor.toFixed(4)}|${turns}`;
      if (seen.has(k)) continue;
      seen.add(k);
      add({ kind: "globalElementPower", element: el, factor, turns });
    }
    // 句式3：全场火系威力增加50% / 冰系威力减小20%
    const r3 = new RegExp(`(${elementName})\\s*威力\\s*${opWord}\\s*(\\d+(?:\\.\\d+)?)\\s*(?:%|百分比)?`, "g");
    let m3 = null;
    while ((m3 = r3.exec(t))) {
      const el = normalizeElementName(m3[1]);
      const op = m3[2];
      const pct = Number(m3[3]);
      if (!el || !Number.isFinite(pct)) continue;
      const factor = /增加|提升|提高|上升|增强/.test(op) ? (1 + pct / 100) : Math.max(0, 1 - pct / 100);
      const k = `${el}|${factor.toFixed(4)}|${turns}`;
      if (seen.has(k)) continue;
      seen.add(k);
      add({ kind: "globalElementPower", element: el, factor, turns });
    }
    // 句式4：提升水系、火系技能威力30%
    const multiElement = `${elementName}(?:[、,，和与]\\s*${elementName})+`;
    const r4 = new RegExp(`(${opWord})\\s*(${multiElement})\\s*技能\\s*威力\\s*(\\d+(?:\\.\\d+)?)\\s*(?:%|百分比)?`, "g");
    let m4 = null;
    while ((m4 = r4.exec(t))) {
      const op = m4[1];
      const elsRaw = normalize(m4[2]);
      const pct = Number(m4[3]);
      if (!elsRaw || !Number.isFinite(pct)) continue;
      const factor = /增加|提升|提高|上升|增强/.test(op) ? (1 + pct / 100) : Math.max(0, 1 - pct / 100);
      const parts = elsRaw.split(/[、,，和与]/g).map((x) => normalizeElementName(x)).filter(Boolean);
      parts.forEach((el) => {
        const k = `${el}|${factor.toFixed(4)}|${turns}`;
        if (seen.has(k)) return;
        seen.add(k);
        add({ kind: "globalElementPower", element: el, factor, turns });
      });
    }
  };
  parseElementPowerEffects(desc);
  if (name === "欢乐之铃") {
    const turns = 5;
    const ratio = clamp(parseRatioFromText(desc, 0.1) || 0.1, 0.03, 1);
    add({ kind: "timedHeal", target: "self", turns, ratio });
  }
  let hasExplicitSelfSkip = false;
  if (name.includes("寄生种子") || desc.includes("寄生")) {
    const mTurns = desc.match(/([0-9一二三四五六])\s*回合/);
    const turns = mTurns ? cnNumToInt(mTurns[1], 5) : 5;
    add({ kind: "status", target: "opponent", status: "leech", turns, chance: 1 });
  }

  // 回血类技能文本解析：回复x点/一半/x%/最大生命值的x%
  if (name !== "欢乐之铃" && /(回复|恢复)/.test(desc) && /(体力|生命|HP|hp)/.test(desc)) {
    const teamFlat = desc.match(/(?:回复|恢复)[^。；，\n]{0,20}(?:我方全体|全体)[^。；，\n]{0,8}(\d+)\s*点(?:体力值?|生命值?|HP|hp)?/);
    if (teamFlat) {
      const amount = Math.max(1, Number(teamFlat[1]) || 0);
      add({ kind: "healFlatTeam", target: "self", amount });
    }
    const hasSelfIntent = /(自身|自己|我方)/.test(desc) || !/(对方|敌方)/.test(desc);
    if (hasSelfIntent && !teamFlat) {
      const halfHit = /(?:回复|恢复)[^。；，\n]{0,18}(?:一半|50%)\s*(?:体力|生命|HP|hp)/.test(desc)
        || /(?:体力|生命|HP|hp)[^。；，\n]{0,8}(?:一半)/.test(desc);
      if (halfHit) {
        add({ kind: "heal", target: "self", ratio: 0.5 });
      } else {
        const maxPct = desc.match(/最大(?:生命值?|体力值?|HP|hp)[^0-9]{0,8}(\d+(?:\.\d+)?)\s*%/);
        if (maxPct) {
          const ratio = clamp((Number(maxPct[1]) || 0) / 100, 0.01, 1);
          add({ kind: "heal", target: "self", ratio });
        } else {
          const plainPct = desc.match(/(?:回复|恢复)[^。；，\n]{0,16}(\d+(?:\.\d+)?)\s*%\s*(?:体力|生命|HP|hp)/);
          if (plainPct) {
            const ratio = clamp((Number(plainPct[1]) || 0) / 100, 0.01, 1);
            add({ kind: "heal", target: "self", ratio });
          } else {
            const flat = desc.match(/(?:回复|恢复)[^。；，\n]{0,16}(\d+)\s*点(?:体力值?|生命值?|HP|hp)?/);
            if (flat) {
              const amount = Math.max(1, Number(flat[1]) || 0);
              add({ kind: "healFlat", target: "self", amount });
            } else if (/(回复|恢复)[^。；，\n]{0,10}(体力|生命|HP|hp)/.test(desc)) {
              // 无明确数值时，给保守默认值，避免技能不生效
              add({ kind: "heal", target: "self", ratio: 0.3 });
            }
          }
        }
      }
    }
  }
  // 嗜血类：按“本次造成伤害”的一定比例回血
  if (/(吸取|回复|恢复|转化)[^。；，\n]{0,20}(伤害值|造成伤害)/.test(desc) && /(自己|自身|我方)/.test(desc)) {
    let ratio = null;
    const mMul = desc.match(/伤害值[^。；，\n]{0,8}([0-9]+(?:\.[0-9]+)?)\s*倍/);
    if (mMul) ratio = Number(mMul[1]) || 0;
    const mFrac = desc.match(/伤害值[^。；，\n]{0,10}1\s*\/\s*([0-9]+(?:\.[0-9]+)?)/);
    if (mFrac) {
      const d = Number(mFrac[1]) || 1;
      ratio = d > 0 ? (1 / d) : 0;
    }
    const mPct = desc.match(/伤害值[^。；，\n]{0,10}([0-9]+(?:\.[0-9]+)?)\s*%/);
    if (mPct) ratio = (Number(mPct[1]) || 0) / 100;
    if (Number.isFinite(ratio) && ratio > 0) {
      add({ kind: "lifesteal", target: "self", ratio: clamp(ratio, 0.01, 3) });
    }
  }

  // 停行动副作用/控制
  // 这里必须精准识别“谁停止行动”，避免把“对方无法替换”误判成“对方无法行动”。
  if ((desc.includes("停止行动") || desc.includes("无法行动")) && !hasExplicitSelfSkip) {
    const turnsM = desc.match(/([0-9一二三四五六])\s*回合/);
    const turns = turnsM ? cnNumToInt(turnsM[1], 1) : 1;
    const selfStop = /(?:自身|自己|自身体?|本回合)[^。；，\n]{0,12}(?:停止行动|无法行动)/.test(desc);
    const oppStop = /(?:对方|敌方)[^。；，\n]{0,12}(?:停止行动|无法行动)/.test(desc);
    let target = "opponent";
    if (selfStop && !oppStop) target = "self";
    else if (!selfStop && oppStop) target = "opponent";
    else if (selfStop && oppStop) {
      // 同时出现时优先使用“更近的动作短语”
      const selfIdx = desc.search(/(?:自身|自己|自身体?|本回合)[^。；，\n]{0,12}(?:停止行动|无法行动)/);
      const oppIdx = desc.search(/(?:对方|敌方)[^。；，\n]{0,12}(?:停止行动|无法行动)/);
      target = (selfIdx >= 0 && (oppIdx < 0 || selfIdx <= oppIdx)) ? "self" : "opponent";
    }
    add({ kind: "skip", target, turns: Math.max(1, turns) });
  }

  // 自灭类副作用
  if (desc.includes("自身死亡") || desc.includes("自己死亡") || desc.includes("自爆") || desc.includes("濒死") || /牺牲自身|牺牲自己|献祭自己|自我牺牲/.test(desc)) {
    add({ kind: "selfKo", target: "self" });
  }
  if (
    /(防御值?减半|防御减半|防御值降低一半|防御降低一半)/.test(desc) &&
    /(自己以外|对方|敌方|敌人|目标)/.test(desc)
  ) {
    add({ kind: "defenseHalve", target: "opponent", turns: 10 });
  }

  // 暴击等级（会心一击率/暴击率）
  let explicitCritParsed = false;
  if (desc.includes("会心一击率") || desc.includes("暴击率") || desc.includes("暴击等级") || desc.includes("较高暴击") || desc.includes("会心")) {
    const levelM =
      desc.match(/(?:会心一击率|暴击率|暴击等级|会心)[^。；，\n]{0,12}?(提升|提高|上升|降低|下降|增加|减少)[^。；，\n]{0,6}?(\d+|一|二|两|三|四|五|六)\s*级/) ||
      desc.match(/(提升|提高|上升|降低|下降|增加|减少)[^。；，\n]{0,12}?(?:会心一击率|暴击率|暴击等级|会心)[^。；，\n]{0,6}?(\d+|一|二|两|三|四|五|六)\s*级/) ||
      desc.match(/(?:会心一击率|暴击率|暴击等级|会心)[^。；，\n]{0,12}(提升|提高|上升|降低|下降|增加|减少)/) ||
      desc.match(/(提升|提高|上升|降低|下降|增加|减少)[^。；，\n]{0,12}(?:会心一击率|暴击率|暴击等级|会心)/);
    let delta = 1;
    if (levelM) {
      const op = levelM[1] || "提升";
      const lv = levelM[2] ? cnNumToInt(levelM[2], 1) : 1;
      delta = (op === "降低" || op === "下降" || op === "减少") ? -lv : lv;
    }
    if (!levelM && (desc.includes("较高暴击") || /会心[^。；，\n]{0,8}(?:提高|提升|上升|增强)/.test(desc))) delta = 2;
    add({ kind: "critStage", target: "self", delta });
    explicitCritParsed = true;
  }

  const stageTextToKeys = (text) => {
    const t = normalize(text);
    if (!t) return [];
    if (t.includes("全属性") || t.includes("全能力")) return ALL_ABILITY_STAGE_KEYS.slice();
    if (t.includes("双攻") || ((t.includes("攻击") || t.includes("普攻") || t.includes("物攻")) && (t.includes("特攻") || t.includes("魔攻")))) return ["atk", "spAtk"];
    if (t.includes("双防") || (t.includes("防御") && t.includes("特防"))) return ["def", "spDef"];
    if (t.includes("攻击和速度") || t.includes("攻速") || t.includes("普攻和速度") || t.includes("物攻和速度")) return ["atk", "speed"];
    if (t.includes("攻防")) return ["atk", "def"];
    if ((t.includes("命中") || t.includes("命中率")) && (t.includes("暴击") || t.includes("会心"))) return ["accuracy", "critStage"];
    if ((t.includes("暴击") || t.includes("会心")) && (t.includes("命中") || t.includes("命中率"))) return ["accuracy", "critStage"];
    if ((t.includes("命中") || t.includes("命中率")) && (t.includes("闪避") || t.includes("闪避率") || t.includes("回避") || t.includes("回避率"))) return ["accuracy", "evasion"];
    const keys = [];
    if (t.includes("普攻") || t.includes("物攻") || t.includes("攻击")) keys.push("atk");
    if (t.includes("防御")) keys.push("def");
    if (t.includes("魔攻") || t.includes("特攻")) keys.push("spAtk");
    if (t.includes("特防")) keys.push("spDef");
    if (t.includes("速度")) keys.push("speed");
    if (t.includes("命中") || t.includes("命中率")) keys.push("accuracy");
    if (t.includes("闪避") || t.includes("闪避率") || t.includes("回避") || t.includes("回避率")) keys.push("evasion");
    if (t.includes("暴击") || t.includes("会心")) keys.push("critStage");
    return Array.from(new Set(keys));
  };
  parseStatusCureEffects(desc);
  // 句式1：提升/降低/下降 + (自身/对方) + 属性 + X级
  const shouldSkipImmediateStage = (sourceText, idx) => {
    const start = Math.max(0, idx - 18);
    const ctx = sourceText.slice(start, idx + 4);
    return /(受到伤害|受击|每回合|回合后)/.test(ctx);
  };
    const stageRule = new RegExp(`(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(自身|自己|我方|敌方|对方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^\\d一二三四五六两]*(\\d+|一|二|两|三|四|五|六)级`, "g");
  let sm = null;
  while ((sm = stageRule.exec(desc))) {
    if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
    const op = sm[1];
    const sideHint = sm[2];
    const stat = sm[3];
    const lv = cnNumToInt(sm[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (!sideHint || sideHint.includes("自身") || sideHint.includes("自己") || sideHint.includes("我方")) ? "self" : "opponent";
    if (shouldSkipImmediateStage(desc, sm.index || 0)) continue;
      const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat()
        .concat(stageTextToKeys(sm[0]));
      const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
      if (uniqKeys.length > 0) add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(desc, sm.index || 0), requireHit: hasHitGateNear(desc, sm.index || 0) });
    }
  // 句式2：令/使 + (对方/自身) + 属性 + 等级 + 提升/降低 + X级
  const stageRule2 = new RegExp(`(?:令|使)(对方|敌方|自身|自己|我方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^。；，\\n]{0,10}等级[^。；，\\n]{0,6}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(\\d+|一|二|两|三|四|五|六)级`, "g");
  let sm2 = null;
  while ((sm2 = stageRule2.exec(desc))) {
    if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
    const sideHint = sm2[1] || "";
    const stat = sm2[2];
    const op = sm2[3];
    const lv = cnNumToInt(sm2[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (sideHint.includes("对方") || sideHint.includes("敌方")) ? "opponent" : "self";
    if (shouldSkipImmediateStage(desc, sm2.index || 0)) continue;
      const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat()
        .concat(stageTextToKeys(sm2[0]));
      const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
      if (uniqKeys.length > 0) add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(desc, sm2.index || 0), requireHit: hasHitGateNear(desc, sm2.index || 0) });
    }
  // 句式3：削弱/降低 + 对方 + 属性 + 等级X级（如“削弱对方攻击等级1级”）
  const stageRule3 = new RegExp(`(削弱|降低|下降|减少)(对方|敌方|自身|自己|我方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)等级[^。；，\\n]{0,6}(\\d+|一|二|两|三|四|五|六)级`, "g");
  let sm3 = null;
  while ((sm3 = stageRule3.exec(desc))) {
    if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
    const sideHint = sm3[2] || "";
    const stat = sm3[3];
    const lv = cnNumToInt(sm3[4], 1);
    const delta = -lv;
    const target = (sideHint.includes("对方") || sideHint.includes("敌方")) ? "opponent" : "self";
    if (shouldSkipImmediateStage(desc, sm3.index || 0)) continue;
      const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat()
        .concat(stageTextToKeys(sm3[0]));
      const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
      if (uniqKeys.length > 0) add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(desc, sm3.index || 0), requireHit: hasHitGateNear(desc, sm3.index || 0) });
    }
  // 句式4：令/使 + 目标 + 属性 + 下降/提升 + X级（无“等级”字样，如“令敌方1体特攻下降两级”）
  const stageRule4 = new RegExp(`(?:令|使)(对方|敌方|自身|自己|我方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^。；，\\n]{0,8}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(\\d+|一|二|两|三|四|五|六)级`, "g");
  let sm4 = null;
  while ((sm4 = stageRule4.exec(desc))) {
    if (MANUAL_STAGE_SKILL_NAMES.has(name)) continue;
    const sideHint = sm4[1] || "";
    const stat = sm4[2];
    const op = sm4[3];
    const lv = cnNumToInt(sm4[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (sideHint.includes("对方") || sideHint.includes("敌方")) ? "opponent" : "self";
    if (shouldSkipImmediateStage(desc, sm4.index || 0)) continue;
      const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat()
        .concat(stageTextToKeys(sm4[0]));
      const uniqKeys = Array.from(new Set(keys)).filter((k) => !(explicitCritParsed && k === "critStage"));
      if (uniqKeys.length > 0) add({ kind: "stage", target, keys: uniqKeys, delta, chance: parseChanceNear(desc, sm4.index || 0), requireHit: hasHitGateNear(desc, sm4.index || 0) });
    }
  // 条件型能力等级变化：回合后触发（如“2回合后提升全属性3级”）
  const delayedStageRule = new RegExp(`([0-9一二三四五六两]+)\\s*回合后[^。；，\\n]{0,20}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(自身|自己|我方|敌方|对方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^\\d一二三四五六两]*(\\d+|一|二|两|三|四|五|六)级`, "g");
  let dm = null;
  while ((dm = delayedStageRule.exec(desc))) {
    let turns = Math.max(1, cnNumToInt(dm[1], 1));
    if (name === "潜龙勿用") turns = 3;
    const op = dm[2];
    const sideHint = dm[3] || "";
    const stat = dm[4];
    const lv = cnNumToInt(dm[5], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const target = (!sideHint || sideHint.includes("自身") || sideHint.includes("自己") || sideHint.includes("我方")) ? "self" : "opponent";
    const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat().concat(stageTextToKeys(dm[0]));
    const uniqKeys = Array.from(new Set(keys));
    if (uniqKeys.length > 0) add({ kind: "delayedStage", target, keys: uniqKeys, delta, turns });
  }
  // 条件型能力等级变化：受击后触发（如“受到攻击后，令对方普攻和特攻下降3级”）
  const onDamagedTurns = (() => {
    const m = desc.match(/持续\s*([0-9一二三四五六])\s*回合/);
    if (m) return Math.max(1, cnNumToInt(m[1], 1));
    if (/(当回合|本回合)/.test(desc)) return 1;
    return 1;
  })();
  const onDamagedRuleA = new RegExp(`(?:每回合)?受到(?:攻击|伤害)[^。；\\n]{0,8}(?:后|时|则)?[，,、\\s]*[^。；\\n]{0,20}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(自身|自己|我方|敌方|对方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^\\d一二三四五六两]*(\\d+|一|二|两|三|四|五|六)级`, "g");
  let omA = null;
  while ((omA = onDamagedRuleA.exec(desc))) {
    const op = omA[1];
    const sideHint = omA[2] || "self";
    const stat = omA[3];
    const lv = cnNumToInt(omA[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const applyTo = (sideHint.includes("对方") || sideHint.includes("敌方")) ? "attacker" : "self";
    const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat().concat(stageTextToKeys(omA[0]));
    const uniqKeys = Array.from(new Set(keys));
    const trigger = "damaged";
    if (uniqKeys.length > 0) add({ kind: "onDamagedStage", target: "self", applyTo, keys: uniqKeys, delta, turns: onDamagedTurns, chance: parseChanceNear(desc, omA.index || 0), trigger });
  }
  const onDamagedRuleB = new RegExp(`(?:每回合)?受到(?:攻击|伤害)[^。；\\n]{0,8}(?:后|时|则)?[，,、\\s]*[^。；\\n]{0,20}(?:令|使)(对方|敌方|自身|自己|我方)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?(${stageKeywordsPattern}(?:[、,，和与]\\s*${stageKeywordsPattern})*)[^。；\\n]{0,8}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(\\d+|一|二|两|三|四|五|六)级`, "g");
  let omB = null;
  while ((omB = onDamagedRuleB.exec(desc))) {
    const sideHint = omB[1] || "attacker";
    const stat = omB[2];
    const op = omB[3];
    const lv = cnNumToInt(omB[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const applyTo = (sideHint.includes("自身") || sideHint.includes("自己") || sideHint.includes("我方")) ? "self" : "attacker";
    const keys = stat.split(/[、,，和与]/g).map((x) => stageTextToKeys(x)).flat().concat(stageTextToKeys(omB[0]));
    const uniqKeys = Array.from(new Set(keys));
    const trigger = "damaged";
    if (uniqKeys.length > 0) add({ kind: "onDamagedStage", target: "self", applyTo, keys: uniqKeys, delta, turns: onDamagedTurns, chance: parseChanceNear(desc, omB.index || 0), trigger });
  }
  // 兜底：处理“受到攻击后，令对方普攻和特攻下降3级”这类中间有逗号/停顿词的写法
  const onDamagedFallback = desc.match(/受到(?:攻击|伤害)[^。；\n]{0,16}(?:后|时|则)[，,、\s]*(?:令|使)(对方|敌方|自身|自己|我方)?[^。；\n]{0,10}(普攻和特攻|攻击和特攻|双攻)[^。；\n]{0,8}(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(\d+|一|二|两|三|四|五|六)级/);
  if (onDamagedFallback) {
    const sideHint = onDamagedFallback[1] || "对方";
    const stat = onDamagedFallback[2] || "攻击和特攻";
    const op = onDamagedFallback[3];
    const lv = cnNumToInt(onDamagedFallback[4], 1);
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    const applyTo = (sideHint.includes("自身") || sideHint.includes("自己") || sideHint.includes("我方")) ? "self" : "attacker";
    const keys = stageTextToKeys(stat);
    if (keys.length > 0) add({ kind: "onDamagedStage", target: "self", applyTo, keys, delta, turns: onDamagedTurns, chance: 1, trigger: "damaged" });
  }
  if (name === "迷光镜") {
    add({
      kind: "onDamagedStage",
      target: "self",
      applyTo: "attacker",
      keys: ["atk", "spAtk"],
      delta: -3,
      turns: onDamagedTurns,
      chance: 1,
      trigger: "damaged"
    });
  }
  const statusMap = [
    { key: "中毒", status: "poison", turns: 5 },
    { key: "烧伤", status: "burn", turns: 5 },
    { key: "睡眠", status: "sleep", turns: 2 },
    { key: "麻痹", status: "paralyze", turns: 3 },
    { key: "冰冻", status: "freeze", turns: 2 }
  ];
  statusMap.forEach((x) => {
    if (!desc.includes(x.key)) return;
    if (!hasStatusApplyIntent(desc, x.key)) return;
    const m = desc.match(new RegExp(`${x.key}\\s*([0-9一二三四五六])\\s*回合`));
    const turns = m ? cnNumToInt(m[1], x.turns) : x.turns;
    const target = (desc.includes("自身") || desc.includes("自己") || desc.includes("我方")) && !desc.includes("敌方") && !desc.includes("对方") ? "self" : "opponent";
    const chance = statusChanceFromDesc(desc, x.key, 1);
    add({ kind: "status", target, status: x.status, turns, chance });
  });
  if ((name === "玄灵甲") || (desc.includes("伤害抗性") && desc.includes("50"))) {
    const turns = parseTurns(3);
    add({ kind: "damageReduction", target: "self", ratio: 0.5, turns });
    // 兜底：仅当通用解析未识别“受击后全属性下降”时再补，避免双触发
    const hasFullOnDamagedDebuff = effects.some((e) =>
      normalize(e && e.kind) === "onDamagedStage" &&
      Array.isArray(e && e.keys) &&
      e.keys.length >= ALL_ABILITY_STAGE_KEYS.length &&
      ALL_ABILITY_STAGE_KEYS.every((k) => e.keys.includes(k))
    );
    if (!hasFullOnDamagedDebuff) {
      add({
        kind: "onDamagedStage",
        target: "self",
        applyTo: "attacker",
        keys: ALL_ABILITY_STAGE_KEYS.slice(),
        delta: -1,
        turns: parseTurns(3),
        chance: 1,
        trigger: "damaged"
      });
    }
  }
  // 玄灵甲的“受伤后降全属性”走通用文本解析分支，避免重复挂载反制效果。
  const dedup = [];
  const seen = new Set();
  effects.forEach((e) => {
    const key = [
      normalize(e.kind),
      normalize(e.target),
      Array.isArray(e.keys) ? e.keys.join(",") : "",
      Number(e.delta) || 0,
      normalize(e.status),
      Number(e.turns) || 0,
      Number(e.ratio) || 0,
      normalize(e.element),
      Number(e.factor) || 0
      ,
      Number(e.amount) || 0,
      Number(e.requireHit ? 1 : 0),
      Number(e.chance) || 0,
      normalize(e.applyTo)
    ].join("|");
    if (seen.has(key)) return;
    seen.add(key);
    dedup.push(e);
  });
  return dedup;
};
const applySkillEffects = (scene, actor, skill, didHit) => {
  const effects = parseSkillEffects(skill);
  if (!effects.length) return [];
  const logs = [];
  const actorName = actor === "attacker" ? scene.attackerName : scene.targetName;
  const targetName = actor === "attacker" ? scene.targetName : scene.attackerName;
  effects.forEach((e) => {
    if (!didHit && (e.kind === "status" || e.kind === "stage") && e.target === "opponent") return;
    if (e.kind === "stage") {
      if (e.requireHit && !didHit) return;
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const changed = applyStageDelta(scene, side, e.keys, e.delta);
      if (changed.length > 0) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        const act = e.delta > 0 ? "提升" : "降低";
        logs.push(`${who}${act}${Math.abs(e.delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      }
      return;
    }
    if (e.kind === "status") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const st = getSideState(scene, side);
      st.statuses[e.status] = Math.max(st.statuses[e.status], Math.max(1, Math.floor(Number(e.turns) || 1)));
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const stLabel = statusLabel(e.status);
      logs.push(`${who}陷入${stLabel}${st.statuses[e.status]}回合（概率${Math.round(chance * 100)}%）`);
      if (e.status === "leech") {
        logs.push(`${who}被寄生，回合结束时将被吸取体力`);
      }
      return;
    }
    if (e.kind === "statusCure") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const chance = clamp(Number(e.chance) || 1, 0, 1);
      if (Math.random() > chance) return;
      const st = getSideState(scene, side);
      const prev = Math.max(0, Number(st.statuses[e.status]) || 0);
      if (prev <= 0) return;
      st.statuses[e.status] = 0;
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const stLabel = statusLabel(e.status);
      logs.push(`${who}解除了${stLabel}状态${chance < 1 ? `（概率${Math.round(chance * 100)}%）` : ""}`);
      return;
    }
    if (e.kind === "skip") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const st = getSideState(scene, side);
      st.skipTurns = Math.max(st.skipTurns, Math.max(1, Math.floor(Number(e.turns) || 1)));
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}将停止行动${st.skipTurns}回合`);
      return;
    }
    if (e.kind === "heal") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const healed = healSideByRatio(scene, side, e.ratio);
      if (healed > 0) {
        if (side === "attacker") scene.healOnAttacker = `+${healed}`;
        else scene.healOnTarget = `+${healed}`;
        if (side === "attacker" && Array.isArray(scene.team)) {
          const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
          if (idx >= 0) scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, scene.team[idx].maxHp);
        }
        logs.push(`${who}回复了 ${healed} 点体力`);
      }
      return;
    }
    if (e.kind === "healFlat") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const before = Number(scene[hpKey]) || 0;
      const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
      const val = Math.max(1, Number(e.amount) || 0);
      scene[hpKey] = clamp(before + val, 0, maxHp);
      const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
      if (healed > 0) {
        if (side === "attacker") scene.healOnAttacker = `+${healed}`;
        else scene.healOnTarget = `+${healed}`;
        if (side === "attacker" && Array.isArray(scene.team)) {
          const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
          if (idx >= 0) scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, scene.team[idx].maxHp);
        }
        logs.push(`${who}回复了 ${healed} 点体力`);
      }
      return;
    }
    if (e.kind === "healFlatTeam") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const val = Math.max(1, Number(e.amount) || 0);
      if (side === "attacker" && Array.isArray(scene.team)) {
        let healedActive = 0;
        scene.team.forEach((u) => {
          const before = clamp(Number(u.hp) || 0, 0, Number(u.maxHp) || 1);
          u.hp = clamp(before + val, 0, Number(u.maxHp) || 1);
          if (u.id === scene.currentAttackerId) {
            scene.attackerHp = clamp(Number(u.hp) || 0, 0, Number(scene.attackerMaxHp) || 1);
            healedActive = Math.max(0, (Number(u.hp) || 0) - before);
          }
        });
        if (healedActive > 0) scene.healOnAttacker = `+${healedActive}`;
        logs.push(`${who}使我方全体回复 ${val} 点体力`);
      } else {
        const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
        const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
        const before = Number(scene[hpKey]) || 0;
        const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
        scene[hpKey] = clamp(before + val, 0, maxHp);
        const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
        if (healed > 0) {
          if (side === "attacker") scene.healOnAttacker = `+${healed}`;
          else scene.healOnTarget = `+${healed}`;
        }
        logs.push(`${who}回复了 ${val} 点体力`);
      }
      return;
    }
    if (e.kind === "lifesteal") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const baseDamage = Math.max(0, Number(scene.lastDamage) || 0);
      if (baseDamage <= 0) return;
      const ratio = clamp(Number(e.ratio) || 0, 0.01, 3);
      const heal = Math.max(1, Math.floor(baseDamage * ratio));
      const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
      const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
      const before = Number(scene[hpKey]) || 0;
      const maxHp = Math.max(1, Number(scene[maxHpKey]) || 1);
      scene[hpKey] = clamp(before + heal, 0, maxHp);
      const healed = Math.max(0, (Number(scene[hpKey]) || 0) - before);
      if (healed > 0) {
        if (side === "attacker") scene.healOnAttacker = `+${healed}`;
        else scene.healOnTarget = `+${healed}`;
        if (side === "attacker" && Array.isArray(scene.team)) {
          const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
          if (idx >= 0) scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, scene.team[idx].maxHp);
        }
        logs.push(`${who}通过嗜血效果回复 ${healed} 点体力`);
      }
      return;
    }
    if (e.kind === "selfKo") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      if (side === "attacker") {
        scene.attackerHp = 0;
        if (Array.isArray(scene.team)) {
          const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
          if (idx >= 0) scene.team[idx].hp = 0;
        }
      } else {
        scene.targetHp = 0;
      }
      logs.push(`${who}承受反噬，失去战斗能力`);
      scene.forceDefeatSide = side;
      return;
    }
    if (e.kind === "critStage") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const st = getSideState(scene, side);
      const prev = st.critStage || 0;
      st.critStage = clamp(prev + (Number(e.delta) || 0), -6, 6);
      if (st.critStage !== prev) {
        const who = side === "attacker" ? scene.attackerName : scene.targetName;
        logs.push(`${who}${(Number(e.delta) || 0) >= 0 ? "提升" : "降低"}暴击等级${Math.abs(Number(e.delta) || 0)}级`);
      }
      return;
    }
    if (e.kind === "damageReduction") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, { kind: "damageReduction", turns: e.turns, data: { ratio: e.ratio } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得减伤${Math.round((Number(e.ratio) || 0) * 100)}%，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "timedHeal") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, { kind: "healOverTime", turns: e.turns, data: { ratio: e.ratio } });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得持续回血效果，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "onDamagedAllStatDown") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addOnDamagedEffect(scene, side, { turns: e.turns, chance: e.chance, allStatsDelta: e.delta });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}获得受击反制效果，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "onDamagedStage") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addOnDamagedEffect(scene, side, {
        turns: e.turns,
        chance: e.chance,
        keys: Array.isArray(e.keys) ? e.keys.slice() : [],
        delta: Number(e.delta) || 0,
        applyTo: normalize(e.applyTo) === "self" ? "self" : "attacker",
        trigger: normalize(e.trigger) === "attacked" ? "attacked" : "damaged"
      });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      const applyToWho = normalize(e.applyTo) === "self" ? "自身" : "攻击方";
      logs.push(`${who}获得受击触发效果，受击时使${applyToWho}${(Number(e.delta) || 0) >= 0 ? "提升" : "降低"}能力，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "delayedStage") {
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      addTimedEffect(scene, side, {
        kind: "delayedStage",
        turns: Math.max(1, Math.floor(Number(e.turns) || 1)),
        data: {
          keys: Array.isArray(e.keys) ? e.keys.slice() : [],
          delta: Number(e.delta) || 0
        }
      });
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      logs.push(`${who}进入延时强化状态：${e.turns}回合后触发能力变化`);
      return;
    }
    if (e.kind === "globalElementPower") {
      if (!Array.isArray(scene.globalTimedEffects)) scene.globalTimedEffects = [];
      scene.globalTimedEffects.push({
        kind: "elementPowerBuff",
        turns: Math.max(1, Math.floor(Number(e.turns) || 1)),
        data: { element: e.element, factor: Number(e.factor) || 1 }
      });
      logs.push(`全场${e.element}技能威力调整为${Math.round((Number(e.factor) || 1) * 100)}%，持续${e.turns}回合`);
      return;
    }
    if (e.kind === "defenseHalve") {
      if (!didHit) return;
      const side = e.target === "self" ? actor : (actor === "attacker" ? "target" : "attacker");
      const st = getSideState(scene, side);
      const exists = (st.timedEffects || []).some((fx) => normalize(fx && fx.kind) === "defenseHalve");
      const who = side === "attacker" ? scene.attackerName : scene.targetName;
      if (exists) {
        logs.push(`${who}已处于防御减半状态（不可叠加）`);
        return;
      }
      addTimedEffect(scene, side, { kind: "defenseHalve", turns: Math.max(1, Math.floor(Number(e.turns) || 10)), data: {} });
      logs.push(`${who}陷入防御减半状态（不可叠加）`);
    }
  });
  if (logs.length > 0) {
    logs.forEach((line) => pushBattleLog(scene, line));
  }
  return logs;
};
const runOnDamagedEffects = (scene, damagedSide, attackerSide, options = {}) => {
  const state = getSideState(scene, damagedSide);
  const effects = Array.isArray(state.onDamagedEffects) ? state.onDamagedEffects : [];
  const reason = normalize(options && options.reason) || "damaged";
  effects.forEach((e) => {
    const trigger = normalize(e && e.trigger) || "damaged";
    if (trigger === "attacked" && reason !== "attacked") return;
    if (trigger === "damaged" && reason !== "damaged") return;
    if (Math.random() > (Number(e.chance) || 0)) return;
    let changed = [];
    let appliedSide = attackerSide;
    if (Array.isArray(e.keys) && e.keys.length > 0 && Number(e.delta) !== 0) {
      appliedSide = normalize(e.applyTo) === "self" ? damagedSide : attackerSide;
      changed = applyStageDelta(scene, appliedSide, e.keys, Number(e.delta));
    } else if ((Number(e.allStatsDelta) || 0) !== 0) {
      appliedSide = attackerSide;
      changed = applyStageDelta(scene, attackerSide, ALL_ABILITY_STAGE_KEYS, Number(e.allStatsDelta));
    } else {
      return;
    }
    if (changed.length === 0) return;
    const owner = damagedSide === "attacker" ? scene.attackerName : scene.targetName;
    const victim = appliedSide === "attacker" ? scene.attackerName : scene.targetName;
    const d = Array.isArray(e.keys) && e.keys.length > 0 ? Number(e.delta) : Number(e.allStatsDelta);
    pushBattleLog(scene, `${owner}触发反制效果，${victim}${d < 0 ? "下降" : "提升"}${Math.abs(d)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
  });
};
const beforeActionCheck = (scene, side) => {
  const state = getSideState(scene, side);
  const actorName = side === "attacker" ? scene.attackerName : scene.targetName;
  if (state.skipTurns > 0) {
    state.skipTurns -= 1;
    return { canAct: false, log: `${actorName}本回合无法行动。` };
  }
  if (state.statuses.sleep > 0) {
    state.statuses.sleep -= 1;
    return { canAct: false, log: `${actorName}陷入睡眠，无法行动。` };
  }
  if (state.statuses.freeze > 0) {
    if (Math.random() < 0.2) {
      state.statuses.freeze = 0;
      return { canAct: true, log: `${actorName}挣脱了冰冻。` };
    }
    state.statuses.freeze -= 1;
    return { canAct: false, log: `${actorName}处于冰冻状态，无法行动。` };
  }
  if (state.statuses.paralyze > 0) {
    state.statuses.paralyze = Math.max(0, state.statuses.paralyze - 1);
    if (Math.random() < 0.25) return { canAct: false, log: `${actorName}麻痹，行动失败。` };
  }
  return { canAct: true, log: "" };
};
const applyEndTurnStatus = (scene, side) => {
  const state = getSideState(scene, side);
  const actorName = side === "attacker" ? scene.attackerName : scene.targetName;
  const hpKey = side === "attacker" ? "attackerHp" : "targetHp";
  const maxHpKey = side === "attacker" ? "attackerMaxHp" : "targetMaxHp";
  const oppSide = side === "attacker" ? "target" : "attacker";
  const oppName = side === "attacker" ? scene.targetName : scene.attackerName;
  const oppHpKey = side === "attacker" ? "targetHp" : "attackerHp";
  const oppMaxHpKey = side === "attacker" ? "targetMaxHp" : "attackerMaxHp";
  let totalDamage = 0;
  let totalHealSelf = 0;
  let totalHealOpp = 0;
  if (state.statuses.poison > 0) {
    const dmg = Math.max(1, Math.floor((Number(scene[maxHpKey]) || 1) / 16));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - dmg);
    state.statuses.poison = Math.max(0, state.statuses.poison - 1);
    totalDamage += dmg;
    pushBattleLog(scene, `${actorName}受到中毒伤害 ${dmg}`);
    if (side === "attacker") scene.damageOnAttacker = `-${dmg}`;
    else scene.damageOnTarget = `-${dmg}`;
  }
  if (state.statuses.burn > 0) {
    const dmg = Math.max(1, Math.floor((Number(scene[maxHpKey]) || 1) / 16));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - dmg);
    state.statuses.burn = Math.max(0, state.statuses.burn - 1);
    totalDamage += dmg;
    pushBattleLog(scene, `${actorName}受到烧伤伤害 ${dmg}`);
    if (side === "attacker") scene.damageOnAttacker = `-${dmg}`;
    else scene.damageOnTarget = `-${dmg}`;
  }
  if (state.statuses.leech > 0) {
    const dmg = Math.max(1, Math.floor((Number(scene[maxHpKey]) || 1) * 0.1));
    const actual = Math.min(dmg, Math.max(0, Number(scene[hpKey]) || 0));
    scene[hpKey] = Math.max(0, (Number(scene[hpKey]) || 0) - dmg);
    state.statuses.leech = Math.max(0, state.statuses.leech - 1);
    totalDamage += actual;
    pushBattleLog(scene, `${actorName}受到寄生吸取 ${actual}`);
    if (side === "attacker") scene.damageOnAttacker = `-${actual}`;
    else scene.damageOnTarget = `-${actual}`;
    if (actual > 0) {
      const healToOpp = Math.min(actual, Math.max(0, (Number(scene[oppMaxHpKey]) || 0) - (Number(scene[oppHpKey]) || 0)));
      scene[oppHpKey] = clamp((Number(scene[oppHpKey]) || 0) + healToOpp, 0, Number(scene[oppMaxHpKey]) || 0);
      if (healToOpp > 0) {
        totalHealOpp += healToOpp;
        pushBattleLog(scene, `寄生生效：${actorName}成功被扣取 ${actual}，${oppName}回复 ${healToOpp}`);
      }
    }
  }
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "healOverTime") return;
    const ratio = clamp(Number(e.data && e.data.ratio) || 0, 0.01, 1);
    const healed = Math.max(1, Math.floor((Number(scene[maxHpKey]) || 1) * ratio));
    const before = Number(scene[hpKey]) || 0;
    scene[hpKey] = clamp(before + healed, 0, Number(scene[maxHpKey]) || 0);
    const actual = Math.max(0, (Number(scene[hpKey]) || 0) - before);
    if (actual > 0) {
      totalHealSelf += actual;
      pushBattleLog(scene, `${actorName}持续回复 ${actual}`);
    }
  });
  const delayedStageToApply = [];
  (state.timedEffects || []).forEach((e) => {
    if (normalize(e.kind) !== "delayedStage") return;
    if (Number(e.turns) !== 1) return;
    const d = e && e.data ? e.data : {};
    const keys = Array.isArray(d.keys) ? d.keys.filter((k) => typeof k === "string") : [];
    const delta = Number(d.delta) || 0;
    if (keys.length === 0 || delta === 0) return;
    delayedStageToApply.push({ keys, delta });
  });
  delayedStageToApply.forEach((x) => {
    const changed = applyStageDelta(scene, side, x.keys, x.delta);
    if (changed.length <= 0) return;
    const act = x.delta > 0 ? "提升" : "降低";
    pushBattleLog(scene, `${actorName}的延时效果触发：${act}${Math.abs(x.delta)}级：${changed.map((k) => battleStatLabel(k)).join("、")}`);
  });
  if (totalDamage > 0) {
    if (side === "attacker") scene.uiAttackerHp = scene.attackerHp;
    else scene.uiTargetHp = scene.targetHp;
    if (side === "attacker") scene.damageOnAttacker = `-${totalDamage}`;
    else scene.damageOnTarget = `-${totalDamage}`;
  }
  if (totalHealSelf > 0) {
    if (side === "attacker") scene.uiAttackerHp = scene.attackerHp;
    else scene.uiTargetHp = scene.targetHp;
    if (side === "attacker") scene.healOnAttacker = `+${totalHealSelf}`;
    else scene.healOnTarget = `+${totalHealSelf}`;
  }
  if (totalHealOpp > 0) {
    if (oppSide === "attacker") scene.uiAttackerHp = scene.attackerHp;
    else scene.uiTargetHp = scene.targetHp;
    if (oppSide === "attacker") scene.healOnAttacker = `+${totalHealOpp}`;
    else scene.healOnTarget = `+${totalHealOpp}`;
  }
  tickSideEffects(scene, side);
  return totalDamage;
};
const tickGlobalTimedEffects = (scene) => {
  if (!scene || !Array.isArray(scene.globalTimedEffects)) return;
  scene.globalTimedEffects.forEach((e) => { e.turns = Math.max(0, Number(e.turns) - 1); });
  scene.globalTimedEffects = scene.globalTimedEffects.filter((e) => Number(e.turns) > 0);
};
const calcSkillDamageByOfficialStyle = ({
  level,
  power,
  atkStat,
  defStat,
  stab = 1,
  elementFactor = 1,
  randomFactor = 1
}) => {
  const lv = clamp(Number(level) || 1, 1, 100);
  const p = Math.max(0, Number(power) || 0);
  if (p <= 0) return 0;
  const atk = Math.max(1, Number(atkStat) || 1);
  const def = Math.max(1, Number(defStat) || 1);
  const rf = clamp(Number(randomFactor) || 1, 0.85, 1);
  // 参考奥拉星常用公开结算写法：先算基础伤害，再乘 STAB、克制与随机系数
  const base = Math.floor(((((2 * lv) / 5 + 2) * p * (atk / def)) / 50) + 2);
  const dmg = Math.floor(base * Math.max(0, Number(stab) || 1) * Math.max(0, Number(elementFactor) || 1) * rf);
  return Math.max(1, dmg);
};
const compareElementLabel = (factor) => (factor >= 2 ? "克制" : (factor <= 0.5 ? "微弱" : "正常"));
const compareElementDesc = (attackerElement, defenderElement, factor) => {
  const atk = normalize(attackerElement) || "未知系";
  const def = normalize(defenderElement) || "未知系";
  const label = compareElementLabel(factor);
  return `${atk} 对 ${def}：${label}，${factor.toFixed(2)}x`;
};
const parseMultiHitRangeFromDesc = (skill) => {
  const desc = normalize(skill && skill.desc);
  if (!desc) return null;
  const patterns = [
    /一回合内\s*([0-9]+)\s*[~～-]\s*([0-9]+)\s*次连续攻击/,
    /爆发\s*([0-9]+)\s*[~～-]\s*([0-9]+)\s*次的连续打击/,
    /1回合内攻击对方单体\s*([0-9]+)\s*[~～-]\s*([0-9]+)\s*次/,
    /1回合爆发\s*([0-9]+)\s*[~～-]\s*([0-9]+)\s*次攻击对方单体/
  ];
  for (const re of patterns) {
    const m = desc.match(re);
    if (!m) continue;
    const a = Math.max(1, Number(m[1]) || 1);
    const b = Math.max(a, Number(m[2]) || a);
    return { min: a, max: b };
  }
  return null;
};
const normalizeEquippedSkillsBySpecies = (species, rawSkills, level = null) => {
  const maxLv = Number.isFinite(Number(level)) ? Number(level) : null;
  const valid = new Set((species && Array.isArray(species.skills) ? species.skills : [])
    .filter((s) => maxLv === null || Number(s && s.level) <= maxLv)
    .map((s) => normalizeSkillKey(s && s.name))
    .filter(Boolean));
  const out = [];
  const seen = new Set();
  (Array.isArray(rawSkills) ? rawSkills : []).forEach((name) => {
    const key = normalizeSkillKey(name);
    if (!key || seen.has(key) || (valid.size > 0 && !valid.has(key))) return;
    seen.add(key);
    out.push(key);
  });
  return out.slice(0, 4);
};
const speciesSkillNameSet = (species, level = null) => new Set(
  (species && Array.isArray(species.skills) ? species.skills : [])
    .filter((s) => {
      if (!Number.isFinite(Number(level))) return true;
      return Number(s && s.level) <= Number(level);
    })
    .map((s) => normalizeSkillKey(s && s.name))
    .filter(Boolean)
);

const getNodeRuntime = () => {
  try {
    if (typeof window !== "undefined" && typeof window.require === "function") {
      const fs = window.require("fs");
      const path = window.require("path");
      if (fs && path) return { fs, path };
    }
  } catch {
    return null;
  }
  return null;
};

const resolveWorkspaceDir = (pathApi) => {
  try {
    if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
      let pathname = decodeURIComponent(window.location.pathname || "");
      if (/^\/[A-Za-z]:\//.test(pathname)) pathname = pathname.slice(1);
      return pathApi.dirname(pathname);
    }
  } catch {
    return ".";
  }
  return ".";
};

const createStorageAdapter = () => {
  const runtime = getNodeRuntime();
  if (runtime) {
    const { fs, path } = runtime;
    const backupDir = path.join(resolveWorkspaceDir(path), "backup");
    const ensureDir = () => {
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    };
    const listJsonFiles = () => {
      ensureDir();
      return fs.readdirSync(backupDir)
        .filter((f) => String(f).toLowerCase().endsWith(".json"))
        .map((name) => {
          const full = path.join(backupDir, name);
          let mtimeMs = 0;
          try { mtimeMs = Number(fs.statSync(full).mtimeMs) || 0; } catch {}
          return { name, full, mtimeMs };
        })
        .sort((a, b) => b.mtimeMs - a.mtimeMs);
    };
    return {
      mode: "file",
      loadRaw: () => {
        try {
          const files = listJsonFiles();
          if (files.length === 0) return null;
          return fs.readFileSync(files[0].full, "utf8");
        } catch {
          return null;
        }
      },
      saveRaw: (text) => {
        try {
          const files = listJsonFiles();
          files.forEach((f) => {
            try { fs.unlinkSync(f.full); } catch {}
          });
          const stamp = new Date().toISOString().replace(/[:.]/g, "-");
          const fileName = `${SAVE_FILE_PREFIX}${stamp}.json`;
          fs.writeFileSync(path.join(backupDir, fileName), text, "utf8");
          return true;
        } catch {
          return false;
        }
      }
    };
  }

  return {
    mode: "localStorage",
    loadRaw: () => {
      try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
    },
    saveRaw: (text) => {
      try { localStorage.setItem(STORAGE_KEY, text); return true; } catch { return false; }
    }
  };
};

createApp({
  setup() {
    const rawDex = Array.isArray(window.AOLA_DEX_1_100) ? window.AOLA_DEX_1_100 : [];
    const dexEntries = rawDex.map((item, idx) => ({
      dexId: Number(item.dexId) || idx + 1,
      name: normalize(item.name) || `未知亚比${idx + 1}`,
      image: ensureHttps(item.image) || PLACEHOLDER,
      element: normalizeElementName(item.element) || "未知系",
      subElement: normalizeElementName(item.subElement || item.element2 || ""),
      sourceUrl: String(item.sourceUrl || "")
    }));

    const speciesRaw = window.AOLA_SPECIES_DATA && typeof window.AOLA_SPECIES_DATA === "object" ? window.AOLA_SPECIES_DATA : {};
    const speciesRawByDex = window.AOLA_SPECIES_DATA_BY_DEX && typeof window.AOLA_SPECIES_DATA_BY_DEX === "object" ? window.AOLA_SPECIES_DATA_BY_DEX : {};
    const skillRawById = window.AOLA_SKILL_DATA_BY_ID && typeof window.AOLA_SKILL_DATA_BY_ID === "object" ? window.AOLA_SKILL_DATA_BY_ID : {};
    const skillRawList = Array.isArray(window.AOLA_SKILL_DATA_LIST) ? window.AOLA_SKILL_DATA_LIST : [];
    const skillMasterById = new Map();
    const skillMasterByKey = new Map();
    skillRawList.forEach((row) => {
      const item = row && typeof row === "object" ? row : {};
      const sid = Number(item.skillId);
      const name = normalize(item.name);
      const key = normalize(item.skillKey);
      const element = normalize(item.element);
      if (Number.isFinite(sid) && sid > 0) skillMasterById.set(sid, item);
      if (key) skillMasterByKey.set(key, item);
      if (!key && name && element) skillMasterByKey.set(`${name}#${element}`, item);
    });
    Object.keys(skillRawById).forEach((k) => {
      const item = skillRawById[k];
      const sid = Number(item && item.skillId);
      const name = normalize(item && item.name);
      const key = normalize(item && item.skillKey);
      const element = normalize(item && item.element);
      if (Number.isFinite(sid) && sid > 0 && !skillMasterById.has(sid)) skillMasterById.set(sid, item);
      if (key && !skillMasterByKey.has(key)) skillMasterByKey.set(key, item);
      if (!key && name && element) {
        const k2 = `${name}#${element}`;
        if (!skillMasterByKey.has(k2)) skillMasterByKey.set(k2, item);
      }
    });
    const speciesMap = new Map();
    const speciesByDexMap = new Map();
    const dexById = new Map(dexEntries.map((d) => [d.dexId, d]));
    const dexByName = new Map(dexEntries.map((d) => [d.name, d]));
    const pickSkillMaster = (rawSkill) => {
      const sid = Number(rawSkill && rawSkill.skillId);
      if (Number.isFinite(sid) && sid > 0 && skillMasterById.has(sid)) return skillMasterById.get(sid);
      const name = normalize(rawSkill && rawSkill.name);
      const type = normalize(rawSkill && rawSkill.type);
      const parsed = parseSkillTypeMeta(type);
      const key = name && parsed.element ? `${name}#${parsed.element}` : "";
      if (key && skillMasterByKey.has(key)) return skillMasterByKey.get(key);
      return null;
    };
    const applySkillDescFromExtractJson = async () => {
      if (typeof fetch !== "function") return;
      try {
        const [petRes, skillRes] = await Promise.all([
          fetch("./aola_pet_skill_extract.json", { cache: "no-store" }),
          fetch("./aola_pet_skill_extract_skills.json", { cache: "no-store" })
        ]);
        if (!petRes.ok || !skillRes.ok) return;
        const [petRows, skillRows] = await Promise.all([petRes.json(), skillRes.json()]);
        if (!Array.isArray(petRows) || !Array.isArray(skillRows)) return;

        const descBySkillId = new Map();
        skillRows.forEach((row) => {
          const sid = Number(row && row.skill_id);
          if (!Number.isFinite(sid) || sid <= 0) return;
          const desc = normalize((row && row.client_desc) || (row && row.new_effect_desc) || (row && row.old_effect_desc) || "");
          if (desc) descBySkillId.set(sid, desc);
        });
        if (descBySkillId.size <= 0) return;

        const raceSkillsById = new Map();
        petRows.forEach((row) => {
          const rid = Number(row && row.race_id);
          if (!Number.isFinite(rid) || rid <= 0) return;
          const skills = Array.isArray(row && row.skills) ? row.skills : [];
          raceSkillsById.set(rid, skills);
        });

        speciesByDexMap.forEach((species, dexId) => {
          const raceSkills = raceSkillsById.get(Number(dexId));
          if (!species || !Array.isArray(species.skills) || !Array.isArray(raceSkills)) return;
          const sidByName = new Map();
          const sidByNameLevel = new Map();
          raceSkills.forEach((s) => {
            const nm = normalize(s && s.name);
            const sid = Number(s && s.skill_id);
            const lv = Number(s && s.level);
            if (nm && Number.isFinite(sid) && sid > 0) {
              sidByName.set(nm, sid);
              if (Number.isFinite(lv)) sidByNameLevel.set(`${nm}#${lv}`, sid);
            }
          });
          species.skills = species.skills.map((s) => {
            const cur = s && typeof s === "object" ? s : {};
            const nm = normalize(cur.name);
            const lv = Number(cur.level);
            const sidByPair = (nm && Number.isFinite(lv)) ? Number(sidByNameLevel.get(`${nm}#${lv}`)) : NaN;
            let desc = Number.isFinite(sidByPair) && sidByPair > 0 ? normalize(descBySkillId.get(sidByPair)) : "";
            if (!desc) {
              const sidByNm = nm ? Number(sidByName.get(nm)) : NaN;
              if (Number.isFinite(sidByNm) && sidByNm > 0) desc = normalize(descBySkillId.get(sidByNm));
            }
            if (!desc) {
              const sid = Number(cur.skillId);
              if (Number.isFinite(sid) && sid > 0) desc = normalize(descBySkillId.get(sid));
            }
            if (!desc) return cur;
            return { ...cur, desc };
          });
        });
      } catch (err) {
        console.warn("[AolaStar] applySkillDescFromExtractJson failed:", err);
      }
    };

    const normalizeSpeciesSource = (source, entry) => {
      const fallback = buildFallbackSpecies(entry);
      if (!source || typeof source !== "object") return { ...fallback, raceStats: null, formCount: 1, stageIndex: 0 };

      let forms = [];
      let formCount = 1;
      let stageIndex = 0;
      if (Array.isArray(source.forms) && source.forms.length > 0) {
        const normalizedForms = source.forms.map((f) => ({
          name: normalize(f && f.name) || entry.name,
          img: ensureHttps(f && f.img) || entry.image
        })).filter((f) => f.img);
        if (normalizedForms.length > 0) {
          const uniqueStageByName = new Map();
          const stageForms = [];
          normalizedForms.forEach((f) => {
            const key = normalize(f.name) || entry.name;
            if (!uniqueStageByName.has(key)) {
              uniqueStageByName.set(key, uniqueStageByName.size);
              stageForms.push({ name: key, img: ensureHttps(f.img) || entry.image });
            }
          });

          let rawAnchorIndex = normalizedForms.findIndex((f) => normalize(f.name) === entry.name);
          if (rawAnchorIndex < 0) {
            const imageKey = normalize(entry.image);
            rawAnchorIndex = imageKey ? normalizedForms.findIndex((f) => normalize(f.img) === imageKey) : -1;
          }
          if (rawAnchorIndex < 0) rawAnchorIndex = 0;

          // 形态数按“有效去重后名称”计算，避免 1/2 形态被重复第三格误判成 3 形态。
          formCount = Math.max(1, Math.min(3, uniqueStageByName.size));
          const anchorKey = normalize((normalizedForms[rawAnchorIndex] && normalizedForms[rawAnchorIndex].name) || entry.name);
          const dedupStage = uniqueStageByName.get(anchorKey);
          stageIndex = clamp(Number.isFinite(dedupStage) ? dedupStage : 0, 0, formCount - 1);
          const f0 = stageForms[0] || normalizedForms[0];
          const f1 = stageForms[Math.min(1, stageForms.length - 1)] || f0;
          const f2 = stageForms[Math.min(2, stageForms.length - 1)] || f1 || f0;
          forms = [
            { name: normalize(f0 && f0.name) || entry.name, img: ensureHttps(f0 && f0.img) || entry.image },
            { name: normalize(f1 && f1.name) || entry.name, img: ensureHttps(f1 && f1.img) || entry.image },
            { name: normalize(f2 && f2.name) || entry.name, img: ensureHttps(f2 && f2.img) || entry.image }
          ];
        }
      }
      if (forms.length === 0) {
        forms = fallback.forms;
      }

      let skills = Array.isArray(source.skills)
        ? source.skills.map((s) => ({
            skillId: (() => {
              const n = Number(s && s.skillId);
              return Number.isFinite(n) && n > 0 ? n : null;
            })(),
            skillKey: normalize(s && s.skillKey),
            name: normalize(s && s.name),
            level: Number(s && s.level) || 0,
            power: Number(s && s.power),
            pp: Number(s && s.pp),
            accuracy: (() => {
              const n = Number(s && s.accuracy);
              if (!Number.isFinite(n) || n < 0) return 100;
              return n;
            })(),
            type: normalize(s && s.type),
            desc: normalize(s && s.desc)
          })).map((s) => {
            const master = pickSkillMaster(s);
            const sid = Number(s.skillId) || Number(master && master.skillId) || null;
            const mPower = Number(master && master.power);
            const mPp = Number(master && master.pp);
            const mAcc = Number(master && master.accuracy);
            return {
              skillId: sid,
              skillKey: normalize(s.skillKey) || normalize(master && master.skillKey),
              name: normalize(s.name) || normalize(master && master.name),
              level: Number(s.level) || 0,
              power: Number.isFinite(Number(s.power)) ? Number(s.power) : (Number.isFinite(mPower) ? mPower : 0),
              pp: Number.isFinite(Number(s.pp)) ? Number(s.pp) : (Number.isFinite(mPp) ? mPp : 10),
              accuracy: (() => {
                const a = Number(s.accuracy);
                if (Number.isFinite(a) && a >= 0) return a;
                if (Number.isFinite(mAcc) && mAcc >= 0) return mAcc;
                return 100;
              })(),
              type: normalize(s.type) || normalize(master && master.type),
              desc: normalize(s.desc) || normalize(master && master.desc)
            };
          }).filter((s) => s.name).sort((a, b) => a.level - b.level)
        : [];
      if (skills.length === 0) skills = fallback.skills;

      const race = source.raceStats && typeof source.raceStats === "object"
        ? {
            id: String(entry.dexId),
            name: entry.name,
            hp: safeNonNegInt(source.raceStats.hp),
            atk: safeNonNegInt(source.raceStats.atk),
            def: safeNonNegInt(source.raceStats.def),
            spAtk: safeNonNegInt(source.raceStats.spAtk),
            spDef: safeNonNegInt(source.raceStats.spDef),
            speed: safeNonNegInt(source.raceStats.speed),
            total: safeNonNegInt(
              source.raceStats.total,
              safeNonNegInt(source.raceStats.hp) +
              safeNonNegInt(source.raceStats.atk) +
              safeNonNegInt(source.raceStats.def) +
              safeNonNegInt(source.raceStats.spAtk) +
              safeNonNegInt(source.raceStats.spDef) +
              safeNonNegInt(source.raceStats.speed)
            )
          }
        : null;

      const element = normalize(source.element) || normalize(entry.element) || "未知系";
      const subElement = normalize(source.subElement || source.element2 || "");
      return { forms, skills, raceStats: race, formCount, stageIndex, element, subElement };
    };

    dexEntries.forEach((entry) => {
      const sourceByDex = speciesRawByDex[String(entry.dexId)] || speciesRawByDex[entry.dexId];
      const sourceByName = speciesRaw[entry.name];
      const species = normalizeSpeciesSource(sourceByDex || sourceByName, entry);
      const fromSpeciesMain = normalizeElementName(species.element);
      const fromSpeciesSub = normalizeElementName(species.subElement);
      // 只在 species 给出有效系别时覆盖，避免把图鉴原始系别覆盖成“未知系”
      if (fromSpeciesMain && fromSpeciesMain !== "未知系" && PET_TYPE_ICON[fromSpeciesMain]) {
        entry.element = fromSpeciesMain;
      }
      entry.subElement = fromSpeciesSub && fromSpeciesSub !== entry.element ? fromSpeciesSub : "";
      speciesByDexMap.set(entry.dexId, species);
      if (!speciesMap.has(entry.name)) speciesMap.set(entry.name, species);
    });
    applySkillDescFromExtractJson();

    const formNameToDexIds = new Map();
    dexEntries.forEach((entry) => {
      const species = speciesByDexMap.get(entry.dexId);
      if (!species || !Array.isArray(species.forms)) return;
      species.forms.forEach((f) => {
        const key = normalize(f && f.name);
        if (!key) return;
        const arr = formNameToDexIds.get(key) || [];
        if (!arr.includes(entry.dexId)) arr.push(entry.dexId);
        formNameToDexIds.set(key, arr);
      });
    });
    const chainRootByDex = new Map();
    const chainDexIdsByRoot = new Map();
    const evoLevelsByRoot = new Map();
    const evoData = (typeof window !== "undefined" && window.AOLA_EVOLUTION_CHAINS && Array.isArray(window.AOLA_EVOLUTION_CHAINS.chains))
      ? window.AOLA_EVOLUTION_CHAINS.chains
      : [];
    evoData.forEach((chain) => {
      const members = Array.isArray(chain && chain.members) ? chain.members : [];
      const ids = [];
      const levels = [];
      members.forEach((m) => {
        const id = Number(m && m.race_id) || 0;
        if (id <= 0) return;
        ids.push(id);
        const lv = Number(m && m.evo_level);
        levels.push(Number.isFinite(lv) && lv >= 0 ? lv : null);
      });
      const uniqIds = Array.from(new Set(ids)).filter((n) => n > 0);
      if (uniqIds.length <= 0) return;
      const rootId = uniqIds[0];
      chainDexIdsByRoot.set(rootId, uniqIds);
      evoLevelsByRoot.set(rootId, levels.slice(0, uniqIds.length));
      uniqIds.forEach((id) => chainRootByDex.set(id, rootId));
    });
    // CSV 中缺失的条目回退为单形态
    dexEntries.forEach((entry) => {
      if (chainRootByDex.has(entry.dexId)) return;
      chainRootByDex.set(entry.dexId, entry.dexId);
      chainDexIdsByRoot.set(entry.dexId, [entry.dexId]);
      evoLevelsByRoot.set(entry.dexId, [null]);
    });
    const rootDexByFormName = new Map();
    formNameToDexIds.forEach((ids, name) => {
      const root = Array.isArray(ids) && ids.length > 0 ? Math.min(...ids.map((n) => Number(n) || 0).filter(Boolean)) : 0;
      if (root > 0) rootDexByFormName.set(name, root);
    });

    const getSpeciesByDexId = (dexId, fallbackName = "") => {
      const id = Number(dexId) || 0;
      if (id > 0 && speciesByDexMap.has(id)) return speciesByDexMap.get(id);
      if (fallbackName && speciesMap.has(fallbackName)) return speciesMap.get(fallbackName);
      const dex = (id > 0 && dexById.get(id)) || dexEntries.find((d) => d.name === fallbackName);
      return dex ? buildFallbackSpecies(dex) : null;
    };
    const resolveEvolutionDexIdByPetAndStage = (pet, stage) => {
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const rootDexId = chainRootByDex.get(anchorDexId) || anchorDexId || 0;
      if (!rootDexId) return anchorDexId;
      const chainIds = chainDexIdsByRoot.get(rootDexId) || [rootDexId];
      const count = Math.max(1, chainIds.length || 1);
      const s = clamp(Number(stage) || 0, 0, count - 1);
      return Number(chainIds[s]) || rootDexId;
    };

    const stageIndexByLevelAndCount = (level, formCount, evoLevels = null) => {
      const lv = clamp(Number(level) || 1, 1, 100);
      const count = clamp(Number(formCount) || 1, 1, 9999);
      if (count <= 1) return 0;
      const levels = Array.isArray(evoLevels) ? evoLevels : [];
      if (levels.length >= count && levels.some((x) => Number.isFinite(Number(x)))) {
        let idx = 0;
        for (let i = 1; i < count; i += 1) {
          const needLv = Number(levels[i]);
          if (Number.isFinite(needLv) && lv >= needLv) idx = i;
        }
        return clamp(idx, 0, count - 1);
      }
      if (count === 2) return lv >= 40 ? 1 : 0;
      if (lv >= 40) return Math.min(2, count - 1);
      if (lv >= 20) return Math.min(1, count - 1);
      return 0;
    };
    const getChainStageInfoByDexId = (dexId, fallbackName = "") => {
      const id = Number(dexId) || 0;
      const rootDexId = chainRootByDex.get(id) || id || 0;
      if (!rootDexId) return { rootDexId: id, formCount: 1, stageIndex: 0 };
      const chainIds = chainDexIdsByRoot.get(rootDexId) || [rootDexId];
      const evoLevels = evoLevelsByRoot.get(rootDexId) || [];
      const formCount = Math.max(1, chainIds.length || 1);
      const idx = chainIds.indexOf(id);
      const stageIndex = idx >= 0 ? idx : 0;
      return {
        rootDexId: Number(chainIds[0]) || rootDexId,
        formCount,
        stageIndex: clamp(stageIndex, 0, formCount - 1),
        evoLevels: evoLevels.slice(0, formCount)
      };
    };
    const expectedStageByLevel = (level, formCount = 3, evoLevels = null) => stageIndexByLevelAndCount(level, formCount, evoLevels);
    const resolveDexFromSaved = ({ dexId, speciesName, level }) => {
      const sid = Number(dexId) || 0;
      const name = normalize(speciesName);
      const lv = clamp(Number(level) || 1, 1, 100);
      const byId = sid > 0 ? (dexById.get(sid) || null) : null;

      if (!name) return byId || dexEntries[0] || null;

      // 存档里可能保存的是“当前形态名”，先回推到该进化链根ID，确保20/40级进化规则稳定生效。
      const rootId = Number(rootDexByFormName.get(name)) || 0;
      if (rootId > 0 && dexById.has(rootId)) return dexById.get(rootId);

      const byFormCandidates = formNameToDexIds.get(name) || [];
      if (byFormCandidates.length > 0) {
        const stage = expectedStageByLevel(lv, 3);
        let hit = null;
        for (const id of byFormCandidates) {
          const species = speciesByDexMap.get(id);
          const count = Math.max(1, Number(species && species.formCount) || 1);
          const idx = expectedStageByLevel(lv, count);
          const form = species && Array.isArray(species.forms) ? species.forms[idx] : null;
          if (normalize(form && form.name) === name) {
            hit = dexById.get(id) || null;
            break;
          }
        }
        if (!hit) hit = dexById.get(byFormCandidates[0]) || null;
        if (hit) return hit;
      }

      const byExactName = dexByName.get(name) || null;
      if (byExactName) return byExactName;

      return byId || dexEntries[0] || null;
    };

    const findDexByName = (name) => dexEntries.find((d) => d.name === name);
    const starterPets = STARTER_DEX_IDS.map((dexId) => {
      const dex = dexById.get(Number(dexId)) || null;
      if (!dex) return null;
      const species = getSpeciesByDexId(dex.dexId, dex.name) || buildFallbackSpecies(dex);
      const equipped = normalizeEquippedSkillsBySpecies(
        species,
        species.skills.filter((s) => s.level <= 10).slice(0, 4).map((s) => s.name),
        10
      );
      return {
        id: uid(),
        dexId: dex.dexId,
        baseDexId: dex.dexId,
        speciesName: dex.name,
        element: normalize(dex.element) || "未知系",
        subElement: normalize(dex.subElement),
        level: 10,
        exp: 0,
        totalExp: 0,
        talent: createRandomHatchTalent(),
        study: createZeroStats(),
        equippedSkills: equipped,
        createdAt: Date.now()
      };
    }).filter(Boolean);

    const createInitialState = () => {
      const bagSeed = starterPets.slice(0, 6).map((p) => p.id);
      while (bagSeed.length < 6) bagSeed.push("");
      const starterActivated = Array.from(new Set(starterPets.map((p) => resolveEvolutionDexIdByPetAndStage(p, 0))));
      return {
        activatedDexIds: starterActivated,
        obtainedEggDexIds: [],
        activePets: starterPets,
        bagPetIds: bagSeed,
        eggs: [],
        selectedDexId: null,
        challengeFormIndex: 0,
        selectedAttackerId: bagSeed[0] || "",
        selectedPetId: (starterPets[0] && starterPets[0].id) || "",
        items: {},
        targetLevel: 10,
        battleLog: [],
        showDexPanel: false
      };
    };

    const sanitizeState = (loaded) => {
      if (!loaded || typeof loaded !== "object") return createInitialState();
      const activePets = Array.isArray(loaded.activePets) ? loaded.activePets.map((p) => {
        const nameInSave = normalize(p.speciesName);
        const dex = resolveDexFromSaved({ dexId: p.dexId, speciesName: nameInSave, level: p.level });
        if (!dex) return null;
        const species = getSpeciesByDexId(dex.dexId, dex.name);
        if (!species) return null;
        const level = clamp(Number(p.level) || 1, 1, 100);
        const savedBase = Number(p.baseDexId) || 0;
        const anchor = savedBase || dex.dexId;
        const rootDexId = chainRootByDex.get(anchor) || anchor;
        const chain = getChainStageInfoByDexId(rootDexId, dex.name);
        const stage = stageIndexByLevelAndCount(level, chain.formCount, chain.evoLevels);
        const currentDexId = Number(resolveEvolutionDexIdByPetAndStage({ dexId: rootDexId, baseDexId: rootDexId, speciesName: dex.name }, stage)) || Number(dex.dexId) || 0;
        const currentDex = dexById.get(currentDexId) || dex;
        const currentSpecies = getSpeciesByDexId(currentDex.dexId, currentDex.name) || species;
        return {
          id: String(p.id || uid()),
          dexId: currentDex.dexId,
          baseDexId: rootDexId,
          speciesName: currentDex.name,
          element: normalize(currentDex.element) || normalize(p.element) || normalize(dex.element) || "未知系",
          subElement: normalize(currentDex.subElement) || normalize(p.subElement) || normalize(dex.subElement),
          level,
          exp: Math.max(0, Number(p.exp) || 0),
          totalExp: Math.max(0, Number(p.totalExp) || 0),
          talent: normalizeTalent(p.talent),
          study: normalizeStudy(p.study),
          equippedSkills: normalizeEquippedSkillsBySpecies(currentSpecies, p.equippedSkills, level),
          createdAt: Number(p.createdAt) || Date.now()
        };
      }).filter(Boolean) : [];

      const eggs = Array.isArray(loaded.eggs) ? loaded.eggs.map((e) => {
        const nameInSave = normalize(e.speciesName);
        const dex = resolveDexFromSaved({ dexId: e.dexId, speciesName: nameInSave, level: 1 });
        if (!dex) return null;
        const species = getSpeciesByDexId(dex.dexId, dex.name);
        if (!species) return null;
        return {
          id: String(e.id || uid()),
          dexId: dex.dexId,
          speciesName: dex.name,
          startAt: Number(e.startAt) || Date.now(),
          hatchAt: Number(e.hatchAt) || (Date.now() + HATCH_MS)
        };
      }).filter(Boolean) : [];

      const activated = new Set(Array.isArray(loaded.activatedDexIds) ? loaded.activatedDexIds.map((n) => Number(n)).filter(Boolean) : []);
      activePets.forEach((p) => {
        const chain = getChainStageInfoByDexId(p.dexId, p.speciesName);
        const stage = stageIndexByLevelAndCount(p.level, chain.formCount);
        const evoDexId = resolveEvolutionDexIdByPetAndStage(p, stage);
        if (evoDexId > 0) activated.add(evoDexId);
        const baseDexId = resolveEvolutionDexIdByPetAndStage(p, 0);
        if (baseDexId > 0) activated.add(baseDexId);
      });
      eggs.forEach((e) => activated.add(e.dexId));
      if (activePets.length === 0) {
        starterPets.forEach((s) => {
          activePets.push({ ...s, id: uid() });
          const baseDexId = resolveEvolutionDexIdByPetAndStage(s, 0);
          if (baseDexId > 0) activated.add(baseDexId);
        });
      }

      const fallbackBag = activePets.slice(0, 6).map((p) => p.id);
      let bagPetIds = normalizeBagIds(Array.isArray(loaded.bagPetIds) ? loaded.bagPetIds : fallbackBag, activePets);
      if (!bagPetIds.some((id) => normalize(id))) {
        bagPetIds = normalizeBagIds(fallbackBag, activePets);
      }
      const selectedAttackerId = bagPetIds[0] || "";
      return {
        activatedDexIds: Array.from(activated),
        obtainedEggDexIds: Array.isArray(loaded.obtainedEggDexIds) ? loaded.obtainedEggDexIds.map((n) => Number(n)).filter((n) => n > 0) : [],
        activePets,
        bagPetIds,
        eggs,
        items: (loaded.items && typeof loaded.items === "object") ? loaded.items : {},
        selectedDexId: dexEntries.some((d) => d.dexId === Number(loaded.selectedDexId)) ? Number(loaded.selectedDexId) : null,
        challengeFormIndex: clamp(Number(loaded.challengeFormIndex) || 0, 0, 2),
        selectedAttackerId,
        selectedPetId: activePets.some((p) => p.id === loaded.selectedPetId) ? loaded.selectedPetId : ((activePets[0] && activePets[0].id) || ""),
        targetLevel: clamp(Number(loaded.targetLevel) || 10, 1, 100),
        battleLog: sanitizeBattleLog(loaded.battleLog),
        showDexPanel: false
      };
    };

    const storageAdapter = createStorageAdapter();
    const saveState = (nextState) => {
      try { storageAdapter.saveRaw(JSON.stringify(nextState)); } catch {}
    };

    const loadState = () => {
      try {
        const text = storageAdapter.loadRaw();
        if (!text) return createInitialState();
        return sanitizeState(JSON.parse(text));
      } catch {
        return createInitialState();
      }
    };

    const state = ref(loadState());
    const dexSearch = ref("");
    const dexElementFilter = ref("全部系别");
    const warehouseSearch = ref("");
    const warehouseElementFilter = ref("全部系别");
    const nowTs = ref(Date.now());
    const battleResult = ref(null);
    const evolutionQueue = ref([]);
    const activeEvolution = ref(null);
    const battleScene = ref(null);
    const showGuardianPanel = ref(false);
    const showTargetPanel = ref(false);
    const showGuardianChallengePanel = ref(false);
    const showSwitchPanel = ref(false);
    const selectedWarehousePetId = ref("");
    const showWarehouseActionModal = ref(false);
    const skillLongPressTimer = ref(null);
    const switchPanelMode = ref("manual");
    const selectedGuardianDexId = ref(null);
    const toast = ref({ show: false, message: "" });
    const evolvingIds = ref([]);
    const selectedSkillName = ref("");
    const selectedInfoTab = ref("skills");
    const replaceSkillCtx = ref(null);
    const bagReplaceCtx = ref(null);
    const showElementPanel = ref(false);
    const showWarehousePanel = ref(false);
    const showShopPanel = ref(false);
    const shopTab = ref("shop");
    const battleActionTab = ref("skills");
    const showPetDetailModal = ref(false);
    const detailPreviewPet = ref(null);
    const shopTargetPetId = ref("");
    const shopItems = ref([
      {
        id: "max_level_fruit",
        name: "满级经验果",
        price: 0,
        desc: "使目标亚比直接升至 Lv.100（测试道具）"
      },
      {
        id: "pp_bean_s",
        name: "初级PP豆",
        price: 0,
        desc: "回复目标亚比全部已装备技能 5PP"
      },
      {
        id: "pp_bean_m",
        name: "中级PP豆",
        price: 0,
        desc: "回复目标亚比全部已装备技能 10PP"
      },
      {
        id: "pp_bean_l",
        name: "高级PP豆",
        price: 0,
        desc: "回复目标亚比全部已装备技能 20PP"
      },
      {
        id: "hp_candy_s",
        name: "初级体力糖",
        price: 0,
        desc: "回复目标亚比 50 点体力"
      },
      {
        id: "hp_candy_m",
        name: "中级体力糖",
        price: 0,
        desc: "回复目标亚比 100 点体力"
      },
      {
        id: "hp_candy_l",
        name: "高级体力糖",
        price: 0,
        desc: "回复目标亚比 200 点体力"
      }
    ]);
    const battleBgmAudio = ref(null);
    const ensureItemInventory = () => {
      if (!state.value.items || typeof state.value.items !== "object") state.value.items = {};
    };
    const getItemCount = (itemId) => {
      ensureItemInventory();
      const id = normalize(String(itemId || ""));
      return Math.max(0, Number(state.value.items[id]) || 0);
    };
    const hasObtainedEggDex = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id) return false;
      const got = Array.isArray(state.value.obtainedEggDexIds) ? state.value.obtainedEggDexIds : [];
      if (got.includes(id)) return true;
      if (state.value.eggs.some((e) => Number(e && e.dexId) === id)) return true;
      const targetRoot = chainRootByDex.get(id) || id;
      const owned = (Array.isArray(state.value.activePets) ? state.value.activePets : []).some((p) => {
        const petDexId = Number(p && p.dexId) || 0;
        const petBaseDexId = Number(p && p.baseDexId) || 0;
        const petRoot = chainRootByDex.get(petDexId) || chainRootByDex.get(petBaseDexId) || petBaseDexId || petDexId;
        return petDexId === id || petBaseDexId === id || petRoot === targetRoot;
      });
      return owned;
    };
    const markObtainedEggDex = (dexId) => {
      const id = Number(dexId) || 0;
      if (!id) return;
      if (!Array.isArray(state.value.obtainedEggDexIds)) state.value.obtainedEggDexIds = [];
      if (!state.value.obtainedEggDexIds.includes(id)) state.value.obtainedEggDexIds.push(id);
    };
    const addItemCount = (itemId, delta) => {
      ensureItemInventory();
      const id = normalize(String(itemId || ""));
      if (!id) return;
      const cur = Math.max(0, Number(state.value.items[id]) || 0);
      state.value.items[id] = Math.max(0, cur + (Number(delta) || 0));
    };

    const showToast = (message) => {
      toast.value = { show: true, message };
      setTimeout(() => { toast.value.show = false; }, 2200);
    };
    const closeBattleResult = () => { battleResult.value = null; };
    const tryOpenNextEvolution = () => {
      if (activeEvolution.value || evolutionQueue.value.length === 0) return;
      activeEvolution.value = evolutionQueue.value.shift() || null;
    };
    const closeEvolutionModal = () => {
      activeEvolution.value = null;
      // 关闭当前后继续弹出队列中的下一个进化
      setTimeout(() => {
        tryOpenNextEvolution();
      }, 50);
    };
    const stopBattleBgm = () => {
      const audio = battleBgmAudio.value;
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    };
    const playBattleBgm = () => {
      try {
        if (!battleBgmAudio.value) {
          const audio = new Audio(BATTLE_BGM_SRC);
          audio.loop = true;
          audio.preload = "auto";
          battleBgmAudio.value = audio;
        }
        const audio = battleBgmAudio.value;
        audio.loop = true;
        const task = audio.play();
        if (task && typeof task.catch === "function") task.catch(() => {});
      } catch {}
    };
    const hpPercent = (hp, maxHp) => {
      const max = Math.max(1, Number(maxHp) || 1);
      const cur = clamp(Number(hp) || 0, 0, max);
      return clamp((cur / max) * 100, 0, 100);
    };
    const skillBattleDesc = (skill) => normalize(skill && skill.desc) || "暂无技能描述";
    const battleStageBadges = (side) => {
      const ns = normalizeBattleState(side && side.stages ? side : { stages: side });
      const st = ns.stages;
      const rows = [
        { key: "atk", label: "攻击", value: st.atk || 0 },
        { key: "spAtk", label: "特攻", value: st.spAtk || 0 },
        { key: "def", label: "防御", value: st.def || 0 },
        { key: "spDef", label: "特防", value: st.spDef || 0 },
        { key: "accuracy", label: "命中", value: st.accuracy || 0 },
        { key: "evasion", label: "闪避", value: st.evasion || 0 },
        { key: "speed", label: "速度", value: st.speed || 0 },
        { key: "critStage", label: "暴击", value: ns.critStage || 0 }
      ];
      return rows.map((r) => ({
        ...r,
        text: `${r.label}${r.value >= 0 ? "+" : ""}${r.value}`,
        cls: r.value > 0 ? "bg-rose-500/85 text-white border-rose-300/80" : (r.value < 0 ? "bg-emerald-500/85 text-white border-emerald-300/80" : "bg-slate-700/75 text-slate-100 border-slate-400/70")
      }));
    };

    const addEvolutionFx = (petId) => {
      if (!evolvingIds.value.includes(petId)) {
        evolvingIds.value.push(petId);
        setTimeout(() => {
          evolvingIds.value = evolvingIds.value.filter((id) => id !== petId);
        }, 1300);
      }
    };

    if (storageAdapter.mode === "localStorage") {
      watch(state, () => saveState(state.value), { deep: true });
    }
    let timer = null;
    const handleAutoSave = () => saveState(state.value);
    onMounted(() => {
      timer = setInterval(() => { nowTs.value = Date.now(); }, 1000);
      if (storageAdapter.mode === "file") {
        window.addEventListener("beforeunload", handleAutoSave);
        window.addEventListener("pagehide", handleAutoSave);
      }
    });
    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
      stopBattleBgm();
      if (storageAdapter.mode === "file") {
        window.removeEventListener("beforeunload", handleAutoSave);
        window.removeEventListener("pagehide", handleAutoSave);
      }
    });

    watch(() => state.value.activePets.map((p) => p.id).join("|"), () => {
      state.value.bagPetIds = normalizeBagIds(state.value.bagPetIds, state.value.activePets);
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
    });

    const selectedDexEntry = computed(() => {
      if (!state.value.selectedDexId) return null;
      return dexEntries.find((d) => d.dexId === state.value.selectedDexId) || null;
    });
    const selectedDexSpecies = computed(() => {
      const entry = selectedDexEntry.value;
      if (!entry) return null;
      const chain = getChainStageInfoByDexId(entry.dexId, entry.name);
      return getSpeciesByDexId(chain.rootDexId, entry.name) || null;
    });
    const selectedDexChainInfo = computed(() => {
      const entry = selectedDexEntry.value;
      if (!entry) return { rootDexId: 0, formCount: 1, stageIndex: 0 };
      return getChainStageInfoByDexId(entry.dexId, entry.name);
    });
    const selectedDexFormCount = computed(() => {
      return clamp(Number(selectedDexChainInfo.value.formCount) || 1, 1, 3);
    });
    const selectedDexStageIndex = computed(() => {
      return clamp(Number(selectedDexChainInfo.value.stageIndex) || 0, 0, selectedDexFormCount.value - 1);
    });
    const selectedDexAvailableFormIndices = computed(() => [selectedDexStageIndex.value]);
    const selectedChallengeFormIndex = computed(() => {
      return selectedDexStageIndex.value;
    });
    const selectedChallengeForm = computed(() => {
      const species = selectedDexSpecies.value;
      const entry = selectedDexEntry.value;
      if (!species || !entry) return null;
      return {
        index: selectedChallengeFormIndex.value,
        // 弹窗名称与图鉴 dex 名称保持一致，不显示“初阶/进阶”后缀
        name: normalize(entry.name),
        image: ensureHttps(entry.image) || PLACEHOLDER
      };
    });
    const selectedDexBattleImage = computed(() => {
      const entry = selectedDexEntry.value;
      return ensureHttps(entry && entry.image) || PLACEHOLDER;
    });
    const targetLevelInput = computed({
      get: () => state.value.targetLevel === null || state.value.targetLevel === undefined ? "" : String(state.value.targetLevel),
      set: (value) => {
        const text = String(value ?? "").trim();
        state.value.targetLevel = text;
      }
    });
    const targetLevelValidationText = computed(() => {
      const range = selectedChallengeLevelRange.value;
      const text = String(state.value.targetLevel ?? "").trim();
      if (!text) return `请输入${range.min}-${range.max}之间的等级`;
      const n = Number(text);
      if (!Number.isInteger(n) || n < range.min || n > range.max) return `挑战等级必须是${range.min}-${range.max}之间的整数`;
      return "";
    });
    const selectedChallengeLevelRange = computed(() => {
      const info = selectedDexChainInfo.value;
      const finalStage = (Number(info.formCount) || 1) <= 1 || Number(info.stageIndex) >= (Number(info.formCount) || 1) - 1;
      return finalStage ? { min: 60, max: 100 } : { min: 1, max: 100 };
    });
    const selectedChallengeDefaultLevel = computed(() => selectedChallengeLevelRange.value.min);
    const selectedChallengeFormLabel = computed(() => {
      const count = selectedDexFormCount.value;
      const idx = selectedDexStageIndex.value;
      if (count === 1) return "最终形态";
      if (count === 2) return idx === 0 ? "第一形态" : "最终形态";
      if (idx === 0) return "第一形态";
      if (idx === 1) return "第二形态";
      return "最终形态";
    });
    watch([selectedDexEntry, selectedDexStageIndex], () => {
      state.value.challengeFormIndex = selectedDexStageIndex.value;
      const range = selectedChallengeLevelRange.value;
      const n = Number(state.value.targetLevel);
      state.value.targetLevel = (Number.isInteger(n) && n >= range.min && n <= range.max) ? String(n) : String(selectedChallengeDefaultLevel.value);
    }, { immediate: true });
    const selectedPet = computed(() => {
      const real = state.value.activePets.find((p) => p.id === state.value.selectedPetId) || null;
      return detailPreviewPet.value || real || null;
    });
    const selectedDexDetailPet = computed(() => {
      const entry = selectedDexEntry.value;
      if (!entry) return null;
      const targetDexId = Number(entry.dexId) || 0;
      const targetRootDexId = chainRootByDex.get(targetDexId) || targetDexId;
      return safeActivePets.value.find((p) => {
        const petDexId = Number(p.dexId) || 0;
        const petRootDexId = chainRootByDex.get(petDexId) || petDexId;
        return petDexId === targetDexId || petRootDexId === targetRootDexId;
      }) || null;
    });

    const bagSlots = computed(() => state.value.bagPetIds.map((id, idx) => ({
      idx,
      pet: state.value.activePets.find((p) => p.id === id) || null
    })));
    const firstPet = computed(() => (bagSlots.value[0] && bagSlots.value[0].pet) ? bagSlots.value[0].pet : null);
    const bagPets = computed(() => bagSlots.value.map((x) => x.pet).filter((p) => p && p.id));
    const bagCount = computed(() => bagPets.value.length);
    const safeActivePets = computed(() => state.value.activePets.filter((p) => p && p.id));
    const warehousePets = computed(() => safeActivePets.value.filter((p) => !state.value.bagPetIds.includes(p.id)));
    const warehouseCount = computed(() => warehousePets.value.length);
    const shopTargetOptions = computed(() => safeActivePets.value.map((p) => ({
      id: p.id,
      name: petDisplayName(p),
      level: p.level
    })));
    const itemInventoryRows = computed(() => shopItems.value.map((it) => ({
      ...it,
      count: getItemCount(it.id)
    })));
    const warehouseElementOptions = computed(() => {
      const set = new Set();
      warehousePets.value.forEach((p) => {
        const e = normalize(p.element);
        if (e) set.add(e);
      });
      return ["全部系别"].concat(Array.from(set).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")));
    });
    const filteredWarehousePets = computed(() => {
      const keyword = normalize(warehouseSearch.value).toLowerCase();
      const element = normalize(warehouseElementFilter.value);
      return warehousePets.value.filter((pet) => {
        const name = normalize(petDisplayName(pet)).toLowerCase();
        const speciesName = normalize(pet.speciesName).toLowerCase();
        const petElement = normalize(pet.element);
        const hitName = !keyword || name.includes(keyword) || speciesName.includes(keyword);
        const hitElement = !element || element === "全部系别" || petElement === element;
        return hitName && hitElement;
      });
    });
    const safeEggs = computed(() => state.value.eggs.filter((e) => e && e.id));
    const safeBattleLog = computed(() => sanitizeBattleLog(state.value.battleLog));

    const dexElementOptions = computed(() => {
      const set = new Set();
      dexEntries.forEach((d) => {
        const e = normalize(d.element);
        if (e) set.add(e);
        const se = normalize(d.subElement);
        if (se) set.add(se);
      });
      return ["全部系别"].concat(Array.from(set).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")));
    });
    const filteredDex = computed(() => {
      const q = normalize(dexSearch.value).toLowerCase();
      const element = normalize(dexElementFilter.value);
      return dexEntries.filter((d) => {
        const hitName = !q || d.name.toLowerCase().includes(q);
        const hitElement = !element || element === "全部系别" || normalize(d.element) === element || normalize(d.subElement) === element;
        return hitName && hitElement;
      });
    });
    const guardianDexEntries = computed(() => dexEntries.filter((d) => isGuardianName(d.name)));
    const selectedGuardianEntry = computed(() => {
      const id = Number(selectedGuardianDexId.value) || 0;
      if (!id) return null;
      return dexById.get(id) || null;
    });
    const selectedGuardianIsExtra = computed(() => Boolean(selectedGuardianEntry.value && isExtraGuardianName(selectedGuardianEntry.value.name)));
    const selectedGuardianChallengeText = computed(() => selectedGuardianIsExtra.value
      ? "进阶守护者挑战：Lv.100 单阶段，体力种族为原种族值×7，天赋值均为50，除体力外学习力均为102，通关后可获得对应亚比蛋。"
      : "基础守护者挑战：从 Lv.30 开始逐级挑战至 Lv.100，体力种族为原种族值×3.5，天赋值均为30，除体力外学习力均为102，每击败一个阶段会清空我方能力等级。");
    const canChallengeFromDex = (entry) => {
      if (!entry) return false;
      return !isGuardianName(entry.name);
    };
    const canStartChallengeByDex = (entry) => {
      if (!entry) return false;
      if (!canChallengeFromDex(entry)) return false;
      const dexId = Number(entry.dexId) || 0;
      return dexId >= 1 && dexId <= MAX_OPEN_CHALLENGE_DEX_ID;
    };
    const selectedDexChallengeLocked = computed(() => !canStartChallengeByDex(selectedDexEntry.value));
    const activatedDexCount = computed(() => new Set(state.value.activatedDexIds).size);
    const dexTotal = computed(() => dexEntries.length);

    const resolvePetCurrentDexId = (pet) => {
      if (!pet || typeof pet !== "object") return 0;
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      if (!anchorDexId) return Number((pet && pet.dexId) || 0) || 0;
      const chain = getChainStageInfoByDexId(anchorDexId, pet && pet.speciesName);
      const idx = stageIndexByLevelAndCount(pet && pet.level, chain.formCount);
      const rootDexId = chain.rootDexId || anchorDexId;
      return resolveEvolutionDexIdByPetAndStage({ dexId: rootDexId, baseDexId: rootDexId, speciesName: pet && pet.speciesName }, idx);
    };
    const petCurrentForm = (pet) => {
      if (!pet || typeof pet !== "object") return { name: "", img: PLACEHOLDER };
      const anchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const chain = getChainStageInfoByDexId(anchorDexId, pet.speciesName);
      const rootDexId = chain.rootDexId || anchorDexId;
      const species = getSpeciesByDexId(rootDexId, pet.speciesName);
      if (!species) return { name: normalize(pet.speciesName), img: PLACEHOLDER };
      const idx = stageIndexByLevelAndCount(pet.level, chain.formCount);
      // 优先按进化阶段映射到具体 dex 条目，确保 20/40 级形态与图鉴图片完全一致
      const evoDexId = resolveEvolutionDexIdByPetAndStage({ dexId: rootDexId, baseDexId: rootDexId, speciesName: pet.speciesName }, idx);
      const evoDex = dexById.get(Number(evoDexId) || 0) || null;
      if (evoDex) {
        return {
          name: normalize(evoDex.name) || normalize(pet.speciesName),
          img: ensureHttps(evoDex.image) || PLACEHOLDER
        };
      }
      return species.forms[idx] || species.forms[0] || { name: normalize(pet.speciesName), img: PLACEHOLDER };
    };
    const stripFormSuffix = (name) => normalize(name).replace(/·(初阶|进阶|终阶|第一形态|第二形态|第三形态)$/g, "");
    const petDisplayName = (pet) => stripFormSuffix(petCurrentForm(pet).name) || normalize(pet.speciesName);
    const dexFinalForm = (entry) => {
      if (!entry) return { name: "", img: PLACEHOLDER };
      const species = getSpeciesByDexId(entry.dexId, entry.name);
      if (!species || !Array.isArray(species.forms) || species.forms.length === 0) {
        return { name: entry.name, img: entry.image || PLACEHOLDER };
      }
      const f2 = species.forms[2] || species.forms[species.forms.length - 1] || species.forms[0];
      return {
        name: normalize(f2 && f2.name) || entry.name,
        img: ensureHttps(f2 && f2.img) || entry.image || PLACEHOLDER
      };
    };

    const selectedPetDetailVisual = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return { name: "", img: PLACEHOLDER };
      if (detailPreviewPet.value && Number(detailPreviewPet.value.fixedDexId) > 0) {
        const fixedDexId = Number(detailPreviewPet.value.fixedDexId) || 0;
        const fixedDex = dexById.get(fixedDexId) || null;
        return {
          name: normalize(detailPreviewPet.value.fixedName) || normalize((fixedDex && fixedDex.name) || pet.speciesName),
          img: ensureHttps(detailPreviewPet.value.fixedImage) || ensureHttps(fixedDex && fixedDex.image) || PLACEHOLDER
        };
      }
      return petCurrentForm(pet);
    });
    const selectedPetSpecies = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return null;
      try {
        if (detailPreviewPet.value && Number(detailPreviewPet.value.fixedDexId) > 0) {
          const fixedDexId = Number(detailPreviewPet.value.fixedDexId) || 0;
          return getSpeciesByDexId(fixedDexId, pet.speciesName) || null;
        }
        const currentDexId = resolvePetCurrentDexId(pet);
        return getSpeciesByDexId(currentDexId, pet.speciesName) || getSpeciesByDexId(pet.dexId, pet.speciesName) || null;
      } catch {
        return null;
      }
    });
    const availableSkillsForSelectedPet = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return [];
      const species = selectedPetSpecies.value;
      if (!species) return [];
      const list = Array.isArray(species.skills) ? species.skills : [];
      if (detailPreviewPet.value && detailPreviewPet.value.previewAllSkills) return list;
      return list.filter((s) => Number(s && s.level) <= Number(pet.level));
    });
    const syncSelectedSkillName = () => {
      const list = availableSkillsForSelectedPet.value;
      if (list.length === 0) {
        selectedSkillName.value = "";
        return;
      }
      const current = normalizeSkillKey(selectedSkillName.value);
      const hit = list.find((s) => normalizeSkillKey(s.name) === current);
      selectedSkillName.value = hit ? normalizeSkillKey(hit.name) : normalizeSkillKey(list[0].name);
    };
    watch(() => state.value.selectedPetId, () => {
      syncSelectedSkillName();
      selectedInfoTab.value = "skills";
    }, { immediate: true });
    watch(availableSkillsForSelectedPet, () => {
      syncSelectedSkillName();
    }, { deep: true });
    watch(selectedPet, (pet) => {
      if (pet && pet.hideStudyTalentTabs && (selectedInfoTab.value === "study" || selectedInfoTab.value === "talent")) {
        selectedInfoTab.value = "skills";
      }
    });
    watch(() => (battleScene.value && Array.isArray(battleScene.value.logs) ? battleScene.value.logs.length : 0), () => {
      scrollBattleLogToBottom();
    });

    const selectedSkillDetail = computed(() => {
      const list = availableSkillsForSelectedPet.value;
      if (list.length === 0) return null;
      const current = normalizeSkillKey(selectedSkillName.value);
      const hit = list.find((s) => normalizeSkillKey(s.name) === current);
      return hit || list[0] || null;
    });
    const selectedPetEquippedSkills = computed(() => {
      const pet = selectedPet.value;
      if (detailPreviewPet.value && detailPreviewPet.value.previewAllSkills) {
        return availableSkillsForSelectedPet.value.map((s) => normalizeSkillKey(s && s.name)).filter(Boolean);
      }
      const arr = pet && Array.isArray(pet.equippedSkills) ? pet.equippedSkills : [];
      return arr.slice(0, 4);
    });
    const selectedRaceStats = computed(() => {
      const pet = selectedPet.value;
      const species = selectedPetSpecies.value;
      if (!pet || !species || !species.raceStats) return null;
      return species.raceStats;
    });
    const selectedAbilityStats = computed(() => {
      const pet = selectedPet.value;
      const race = selectedRaceStats.value;
      if (!pet || !race) return null;
      const talent = normalizeTalent(pet.talent);
      const study = normalizeStudy(pet.study);
      const out = {
        hp: calcAbilityHp(race.hp, talent.hp, study.hp, pet.level),
        atk: calcAbilityStat(race.atk, talent.atk, study.atk, pet.level, 1),
        def: calcAbilityStat(race.def, talent.def, study.def, pet.level, 1),
        spAtk: calcAbilityStat(race.spAtk, talent.spAtk, study.spAtk, pet.level, 1),
        spDef: calcAbilityStat(race.spDef, talent.spDef, study.spDef, pet.level, 1),
        speed: calcAbilityStat(race.speed, talent.speed, study.speed, pet.level, 1)
      };
      out.total = out.hp + out.atk + out.def + out.spAtk + out.spDef + out.speed;
      return out;
    });
    const calcPetAbilityByRace = (raceStats, level, talentRaw, studyRaw) => {
      const race = raceStats && typeof raceStats === "object" ? raceStats : createZeroStats();
      const talent = normalizeTalent(talentRaw);
      const study = normalizeStudy(studyRaw);
      return {
        hp: calcAbilityHp(race.hp, talent.hp, study.hp, level),
        atk: calcAbilityStat(race.atk, talent.atk, study.atk, level, 1),
        def: calcAbilityStat(race.def, talent.def, study.def, level, 1),
        spAtk: calcAbilityStat(race.spAtk, talent.spAtk, study.spAtk, level, 1),
        spDef: calcAbilityStat(race.spDef, talent.spDef, study.spDef, level, 1),
        speed: calcAbilityStat(race.speed, talent.speed, study.speed, level, 1)
      };
    };
    const selectedPetTalent = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return createZeroStats();
      return normalizeTalent(pet.talent);
    });
    const selectedPetStudy = computed(() => {
      const pet = selectedPet.value;
      if (!pet) return createZeroStats();
      return normalizeStudy(pet.study);
    });
    const selectedStudyTotal = computed(() => {
      const study = selectedPetStudy.value;
      return study.hp + study.atk + study.def + study.spAtk + study.spDef + study.speed;
    });
    const setInfoTab = (tab) => {
      const hit = String(tab || "");
      const ALLOWED = ["skills", "ability", "talent", "study", "race"];
      const hiddenStudyTalent = Boolean(selectedPet.value && selectedPet.value.hideStudyTalentTabs);
      selectedInfoTab.value = ALLOWED.includes(hit) && !(hiddenStudyTalent && (hit === "study" || hit === "talent")) ? hit : "skills";
    };
    const setTalentValue = (key, value) => {
      const pet = selectedPet.value;
      if (!pet || !STAT_KEYS.includes(key)) return;
      if (!pet.talent || typeof pet.talent !== "object") pet.talent = createZeroStats();
      const n = clamp(safeNonNegInt(value), 0, 62);
      pet.talent[key] = n;
      pet.talent = normalizeTalent(pet.talent);
    };
    const setStudyValue = (key, value) => {
      const pet = selectedPet.value;
      if (!pet || !STAT_KEYS.includes(key)) return;
      if (!pet.study || typeof pet.study !== "object") pet.study = createZeroStats();
      const draft = normalizeStudy(pet.study);
      let others = 0;
      STAT_KEYS.forEach((k) => { if (k !== key) others += draft[k]; });
      const maxForKey = Math.max(0, 510 - others);
      draft[key] = clamp(safeNonNegInt(value), 0, Math.min(255, maxForKey));
      pet.study = normalizeStudy(draft);
    };

    const autoFillSkills = (pet) => {
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) return;
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      const unlocked = species.skills.filter((s) => s.level <= pet.level).map((s) => normalizeSkillKey(s.name)).filter(Boolean);
      for (const skill of unlocked) {
        if (pet.equippedSkills.length >= 4) break;
        if (!pet.equippedSkills.includes(skill)) pet.equippedSkills.push(skill);
      }
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
    };

    const grantExp = (pet, amount) => {
      const beforeForm = petCurrentForm(pet);
      const beforeLevel = pet.level;
      const beforeExp = pet.exp;
      const crossed = [];
      pet.exp += amount;
      pet.totalExp += amount;
      const chainAnchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || 0;
      const chain = getChainStageInfoByDexId(chainAnchorDexId || pet.dexId, pet.speciesName);
      while (pet.level < 100 && pet.exp >= expRequired(pet.level)) {
        const oldLevel = pet.level;
        pet.exp -= expRequired(pet.level);
        pet.level += 1;
        const prevStage = stageIndexByLevelAndCount(oldLevel, chain.formCount, chain.evoLevels);
        const nextStage = stageIndexByLevelAndCount(pet.level, chain.formCount, chain.evoLevels);
        if (nextStage > prevStage) {
          addEvolutionFx(pet.id);
          const crossedLv = Array.isArray(chain.evoLevels) ? Number(chain.evoLevels[nextStage]) : null;
          if (Number.isFinite(crossedLv) && crossedLv > 0) crossed.push(crossedLv);
          else if (chain.formCount === 2) crossed.push(40);
          else if (nextStage === 1) crossed.push(20);
          else crossed.push(40);
        }
        const stage = nextStage;
        const evoDexId = resolveEvolutionDexIdByPetAndStage(pet, stage);
        if (Number(evoDexId) > 0) {
          pet.dexId = Number(evoDexId);
          const evoDex = dexById.get(Number(evoDexId)) || null;
          if (evoDex) {
            pet.element = normalize(evoDex.element) || pet.element || "未知系";
            pet.subElement = normalize(evoDex.subElement) || "";
          }
        }
        if (evoDexId > 0 && !state.value.activatedDexIds.includes(evoDexId)) {
          state.value.activatedDexIds.push(evoDexId);
        }
      }
      autoFillSkills(pet);
      const afterForm = petCurrentForm(pet);
      return {
        petId: pet.id,
        name: petDisplayName(pet),
        element: normalize(pet.element) || "未知系",
        subElement: normalize(pet.subElement),
        image: ensureHttps(afterForm && afterForm.img) || PLACEHOLDER,
        beforeImage: ensureHttps(beforeForm && beforeForm.img) || PLACEHOLDER,
        beforeName: normalize(beforeForm && beforeForm.name) || pet.speciesName,
        afterImage: ensureHttps(afterForm && afterForm.img) || PLACEHOLDER,
        afterName: normalize(afterForm && afterForm.name) || pet.speciesName,
        gainedExp: amount,
        beforeLevel,
        afterLevel: pet.level,
        beforeExp,
        afterExp: pet.exp,
        evolved: crossed.length > 0,
        crossedStages: crossed
      };
    };

    const getSkillPower = (pet) => {
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) return 120;
      const picked = pet.equippedSkills.map((name) => species.skills.find((s) => s.name === name)).filter(Boolean);
      if (picked.length === 0) return 120;
      const sum = picked.reduce((acc, s) => acc + (s.power > 0 ? s.power : 110), 0);
      return sum / picked.length;
    };

    const getElementFactor = (attackerElement, defenderElement) => {
      const atk = normalize(attackerElement) || "未知系";
      const def = normalize(defenderElement) || "未知系";
      const chart = ELEMENT_CHART[atk];
      if (!chart) return 1;
      if (chart.strong.includes(def)) return 2;
      if (chart.weak.includes(def)) return 0.5;
      return 1;
    };

    const predictedWinExp = computed(() => {
      const target = selectedDexEntry.value;
      if (!target) return 0;
      const n = Number(state.value.targetLevel);
      const level = Number.isFinite(n) ? n : selectedChallengeDefaultLevel.value;
      return calcWinExp(level);
    });
    const predictedLoseExp = computed(() => {
      const n = Number(state.value.targetLevel);
      const level = Number.isFinite(n) ? n : selectedChallengeDefaultLevel.value;
      return calcLoseExp(level);
    });
    const predictedElementFactor = computed(() => {
      const attacker = firstPet.value;
      const target = selectedDexEntry.value;
      if (!attacker || !target) return 1;
      return getElementFactor(attacker.element, target.element);
    });
    const predictedElementText = computed(() => {
      const attacker = firstPet.value;
      const target = selectedDexEntry.value;
      if (!attacker || !target) return "请先设置首宠（背包1号位）并选择挑战目标。";
      return compareElementDesc(attacker.element, target.element, predictedElementFactor.value);
    });

    const petElementIconStyle = (element, size = 18) => {
      const icon = PET_TYPE_ICON[normalizeElementName(element)] || "";
      const safeSize = Math.max(12, Number(size) || 18);
      if (!icon) return { width: `${safeSize}px`, height: `${safeSize}px`, display: "none" };
      return {
        width: `${safeSize}px`,
        height: `${safeSize}px`,
        backgroundImage: `url(${icon})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${safeSize}px ${safeSize}px`,
        backgroundPosition: "center"
      };
    };
    const petElementIconSrc = (element) => PET_TYPE_ICON[normalizeElementName(element)] || "";
    const petElementList = (obj) => {
      const main = normalizeElementName(obj && obj.element) || "";
      const sub = normalizeElementName(obj && obj.subElement) || "";
      if (!main && !sub) return [];
      if (!sub || sub === main) return main ? [main] : [];
      return main ? [main, sub] : [sub];
    };

    const skillTypeMeta = (typeText) => {
      const raw = normalize(typeText);
      const first = normalize(raw.split("/")[0] || "");
      let element = first;
      if (element && !element.endsWith("系")) element = `${element}系`;
      if (!element) element = "未知系";
      if (element === "普通系") return { label: element, icon: PET_TYPE_ICON["普通系"] || "" };
      return { label: element, icon: PET_TYPE_ICON[element] || "" };
    };
    const battleSceneSkills = computed(() => {
      const scene = battleScene.value;
      return scene && Array.isArray(scene.skills) ? scene.skills : [];
    });
    const battleAttackerStatusBadges = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return buildStatusBadges(normalizeBattleState(scene.attackerState));
    });
    const battleTargetStatusBadges = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return buildStatusBadges(normalizeBattleState(scene.targetState));
    });
    const battleAttackerTimedEffects = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return buildTimedEffectBadges(scene, "attacker");
    });
    const battleTargetTimedEffects = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return buildTimedEffectBadges(scene, "target");
    });
    const battleAttackerStageText = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return battleStageBadges(normalizeBattleState(scene.attackerState));
    });
    const battleTargetStageText = computed(() => {
      const scene = battleScene.value;
      if (!scene) return [];
      return battleStageBadges(normalizeBattleState(scene.targetState));
    });
    const battleSceneTargetSkills = computed(() => {
      const scene = battleScene.value;
      return scene && Array.isArray(scene.targetSkills) ? scene.targetSkills : [];
    });
    const battleAbilityNow = (side, key) => {
      const scene = battleScene.value;
      if (!scene) return 0;
      const safeSide = side === "attacker" ? "attacker" : "target";
      return getBattleAbilityStat(scene, safeSide, key);
    };
    const battleSceneAvailablePets = computed(() => {
      const scene = battleScene.value;
      if (!scene || !Array.isArray(scene.team)) return [];
      return scene.team.filter((u) => u && u.id && u.hp > 0 && u.id !== scene.currentAttackerId);
    });
    const battleSceneCurrentUnit = computed(() => {
      const scene = battleScene.value;
      if (!scene || !Array.isArray(scene.team)) return null;
      return scene.team.find((u) => u.id === scene.currentAttackerId) || null;
    });
    const battleSceneLogRef = ref(null);
    const scrollBattleLogToBottom = () => {
      nextTick(() => {
        const el = battleSceneLogRef.value;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      });
    };
    const PET_BATTLE_ANIM_ROOT = "./pet-action";
    const PET_BAG_ANIM_IDS = new Set("1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,118,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,794,795,796".split(",").map((n) => Number(n)));
    const SKILL_EFFECT_ROOT = "./skill-effect";
    const BATTLE_DAMAGE_VISUAL_DELAY_MS = 900;
    const BATTLE_SKILL_EFFECT_DURATION_MS = 900;
    const BATTLE_COUNTER_ATTACK_DELAY_MS = 3600;
    const BATTLE_DEFEAT_RESOLUTION_DELAY_MS = 2600;
    const BATTLE_DEFEAT_EXIT_START_DELAY_MS = 2400;
    const BATTLE_DEFEAT_EXIT_DURATION_MS = 1200;
    const PET_ANIM_FALLBACK_IDLE_DELAY_MS = 1200;
    const webpDurationCache = new Map();
    const getAnimatedWebpDurationMs = async (src) => {
      const key = String(src || "");
      if (!key) return PET_ANIM_FALLBACK_IDLE_DELAY_MS;
      if (webpDurationCache.has(key)) return webpDurationCache.get(key);
      try {
        const res = await fetch(key);
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let total = 0;
        for (let i = 12; i + 20 <= bytes.length;) {
          const four = String.fromCharCode(bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]);
          const size = bytes[i + 4] | (bytes[i + 5] << 8) | (bytes[i + 6] << 16) | (bytes[i + 7] << 24);
          const data = i + 8;
          if (four === "ANMF" && data + 16 <= bytes.length) {
            total += bytes[data + 12] | (bytes[data + 13] << 8) | (bytes[data + 14] << 16);
          }
          i = data + size + (size % 2);
        }
        const duration = total > 0 ? total : PET_ANIM_FALLBACK_IDLE_DELAY_MS;
        webpDurationCache.set(key, duration);
        return duration;
      } catch {
        return PET_ANIM_FALLBACK_IDLE_DELAY_MS;
      }
    };
    const PET_ANIM_DEBUG = true;
    const petAnimDebugLog = (msg, extra) => {
      if (!PET_ANIM_DEBUG || typeof console === "undefined" || !console.log) return;
      try {
        if (extra !== undefined) console.log("[PET_ANIM]", msg, extra);
        else console.log("[PET_ANIM]", msg);
      } catch (_) {}
    };
    const getPetBattleAnimPath = (dexId, side, stateKey) => {
      const id = Number(dexId) || 0;
      if (id <= 0) return "";
      const sideCode = side === "target" ? "1" : "2";
      const stateCode = stateKey === "idle" ? "1" : (stateKey === "hit" ? "2" : (stateKey === "status" ? "6" : "4"));
      return `${PET_BATTLE_ANIM_ROOT}/${id}/pet${id}_${sideCode}_${stateCode}.webp`;
    };
    const getBattleSkillEffectPath = (skill, actionSeq = 0) => {
      const id = Number(skill && skill.skillId) || 0;
      if (id <= 0) return "";
      const cacheBust = actionSeq > 0 ? `?fx=${actionSeq}` : "";
      return `${SKILL_EFFECT_ROOT}/effect${id}.gif${cacheBust}`;
    };
    const bagPetVisual = (pet) => {
      if (!pet) return { src: PLACEHOLDER, animated: false };
      const dexId = Number(pet.dexId) || Number(resolvePetCurrentDexId(pet)) || 0;
      if (dexId > 0 && PET_BAG_ANIM_IDS.has(dexId)) {
        return { src: getPetBattleAnimPath(dexId, "target", "idle"), animated: true };
      }
      return { src: ensureHttps(petCurrentForm(pet).img) || PLACEHOLDER, animated: false };
    };
    const markPetAnimStateOncePerAction = (scene, side, actionSeq, stateKey) => {
      if (!scene) return true;
      if (!scene._petAnimActionMarks || typeof scene._petAnimActionMarks !== "object") scene._petAnimActionMarks = {};
      const key = `${String(side)}:${String(actionSeq)}`;
      if (scene._petAnimActionMarks[key] === stateKey) return false;
      scene._petAnimActionMarks[key] = stateKey;
      return true;
    };
    const resolveBattleSideDexId = (scene, side) => {
      if (!scene) return 0;
      if (side === "target") return Number(scene.targetDexId) || 0;
      const curId = String(scene.currentAttackerId || "");
      const current = Array.isArray(scene.team)
        ? scene.team.find((u) => u && String(u.id || "") === curId)
        : null;
      const activePet = state && state.value && Array.isArray(state.value.activePets)
        ? state.value.activePets.find((p) => p && String(p.id || "") === curId)
        : null;
      const attackerName = normalize(
        (current && current.name) ||
        (activePet && (petDisplayName(activePet) || activePet.speciesName)) ||
        scene.attackerName
      );
      if (attackerName.includes("大师兔")) return 3;
      const dexId = Number(
        (current && current.dexId) ||
        (activePet && activePet.dexId) ||
        scene.attackerDexId
      ) || 0;
      const baseDexId = Number(
        (current && current.baseDexId) ||
        (activePet && activePet.baseDexId) ||
        scene.attackerBaseDexId
      ) || 0;
      if (dexId === 3 || baseDexId === 3) return 3;
      petAnimDebugLog("resolve attacker dex", { curId, dexId, baseDexId, fromTeam: current ? current.id : "", fromActive: activePet ? activePet.id : "" });
      return dexId || baseDexId || 0;
    };
    const isBattleAnimSide = (scene, side) => {
      const dexId = resolveBattleSideDexId(scene, side === "target" ? "target" : "attacker");
      return Boolean(getPetBattleAnimPath(dexId, side === "target" ? "target" : "attacker", "idle"));
    };
    const battleSkillEffectStyle = (side) => {
      const isTarget = side === "target";
      if (typeof window === "undefined") {
        return { "--skill-fx-x": isTarget ? "30vw" : "70vw", "--skill-fx-y": isTarget ? "38vh" : "70vh" };
      }
      const w = Math.max(1, window.innerWidth || 1);
      const h = Math.max(1, window.innerHeight || 1);
      const x = isTarget ? Math.round(w * 0.24) : Math.round(w * 0.65);
      const y = isTarget ? Math.round(h * 0.26) : Math.round(h * 0.56);
      return { "--skill-fx-x": `${x}px`, "--skill-fx-y": `${y}px` };
    };
    const applyBattleAnimImage = (scene, side, stateKey, actionSeq = 0) => {
      if (!scene) return;
      const safeSide = side === "target" ? "target" : "attacker";
      const lockKey = safeSide === "target" ? "_petAnimTargetPlayLock" : "_petAnimAttackerPlayLock";
      if (stateKey !== "idle" && scene[lockKey]) {
        petAnimDebugLog("skip locked side", { side: safeSide, stateKey });
        return;
      }
      if (actionSeq > 0 && !markPetAnimStateOncePerAction(scene, safeSide, actionSeq, stateKey)) {
        petAnimDebugLog("skip duplicated state in same action", { side: safeSide, stateKey, actionSeq });
        return;
      }
      const dexId = resolveBattleSideDexId(scene, safeSide);
      const next = getPetBattleAnimPath(dexId, safeSide, stateKey);
      if (!next) {
        petAnimDebugLog("skip side (no anim path)", { side: safeSide, dexId, stateKey });
        return;
      }
      if (safeSide === "target") {
        if (scene.targetImage === next) return;
        scene.targetImage = next;
        petAnimDebugLog("target image -> " + stateKey, next);
        if (stateKey !== "idle") {
          scene._petAnimTargetPlayLock = true;
          if (scene._petAnimTargetAutoIdleTimer) clearTimeout(scene._petAnimTargetAutoIdleTimer);
          getAnimatedWebpDurationMs(next).then((duration) => {
            if (!battleScene.value || battleScene.value !== scene || scene.ended) return;
            scene._petAnimTargetAutoIdleTimer = setTimeout(() => {
            const live = battleScene.value;
            if (!live || live !== scene || live.ended) return;
            applyBattleAnimImage(live, "target", "idle");
            }, Math.max(1, duration));
          });
        } else {
          scene._petAnimTargetPlayLock = false;
        }
        return;
      }
      if (scene.attackerImage === next) return;
      scene.attackerImage = next;
      petAnimDebugLog("attacker image -> " + stateKey, next);
      if (stateKey !== "idle") {
        scene._petAnimAttackerPlayLock = true;
        if (scene._petAnimAttackerAutoIdleTimer) clearTimeout(scene._petAnimAttackerAutoIdleTimer);
        getAnimatedWebpDurationMs(next).then((duration) => {
          if (!battleScene.value || battleScene.value !== scene || scene.ended) return;
          scene._petAnimAttackerAutoIdleTimer = setTimeout(() => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          applyBattleAnimImage(live, "attacker", "idle");
          }, Math.max(1, duration));
        });
      } else {
        scene._petAnimAttackerPlayLock = false;
      }
    };
    const resetBattleAnimIdle = (scene) => {
      applyBattleAnimImage(scene, "attacker", "idle");
      applyBattleAnimImage(scene, "target", "idle");
    };
    const scheduleBattleSkillEffectVisual = (scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, afterEffect) => {
      if (!scene || !skill) {
        if (typeof afterEffect === "function") afterEffect();
        return;
      }
      const effectSide = actionStateKey === "status" || atkKind === "status" ? actorSide : targetSide;
      const actorDexId = resolveBattleSideDexId(scene, actorSide);
      const actionSrc = getPetBattleAnimPath(actorDexId, actorSide, actionStateKey);
      const effectSrc = getBattleSkillEffectPath(skill, actionSeq);
      const runAfterEffect = () => {
        if (typeof afterEffect === "function") afterEffect();
      };
      getAnimatedWebpDurationMs(actionSrc).then((duration) => {
        const actionDelay = Math.max(1, Number(duration) || PET_ANIM_FALLBACK_IDLE_DELAY_MS);
        setTimeout(() => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) {
            runAfterEffect();
            return;
          }
          if (!effectSrc) {
            runAfterEffect();
            return;
          }
          scene.skillEffectFx = { side: effectSide, src: effectSrc, seq: actionSeq };
          setTimeout(() => {
            const current = battleScene.value;
            if (current && current === scene && scene.skillEffectFx && scene.skillEffectFx.seq === actionSeq) {
              scene.skillEffectFx = null;
            }
            runAfterEffect();
          }, BATTLE_SKILL_EFFECT_DURATION_MS);
        }, actionDelay);
      }).catch(() => {
        setTimeout(runAfterEffect, BATTLE_DAMAGE_VISUAL_DELAY_MS);
      });
    };
    const buildBattleUnitFromPet = (pet) => {
      if (!pet) return null;
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species || !species.raceStats) return null;
      const unlockedSkills = (species.skills || []).filter((s) => Number(s.level) <= pet.level);
      const equipped = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      const chosenByEquip = equipped
        .map((name) => unlockedSkills.find((s) => normalizeSkillKey(s.name) === normalizeSkillKey(name)))
        .filter(Boolean);
      const chosenSkills = (chosenByEquip.length > 0 ? chosenByEquip : unlockedSkills).slice(0, 4).map((s) => ({
        skillId: Number(s && s.skillId) || null,
        skillKey: normalize(s && s.skillKey),
        name: normalizeSkillKey(s.name) || "未知技能",
        type: normalize(s.type) || "未知系/普通攻击",
        power: Number(s.power) > 0 ? Number(s.power) : 0,
        ppMax: Math.max(1, Number(s.pp) || 10),
        pp: Math.max(1, Number(s.pp) || 10),
        level: Math.max(0, Number(s.level) || 0),
        accuracy: safeSkillAccuracy(s),
        desc: normalize(s.desc)
      }));
      if (chosenSkills.length === 0) return null;
      const ability = calcPetAbilityByRace(species.raceStats, pet.level, pet.talent, pet.study);
      return {
        id: pet.id,
        petId: pet.id,
        dexId: Number(pet.dexId || (species && species.dexId)) || 0,
        baseDexId: Number(pet.baseDexId) || Number(pet.dexId || (species && species.dexId)) || 0,
        name: petDisplayName(pet),
        image: ensureHttps(petCurrentForm(pet).img) || PLACEHOLDER,
        level: pet.level,
        element: normalize(pet.element) || "未知系",
        subElement: normalize(pet.subElement),
        ability,
        hp: ability.hp,
        maxHp: ability.hp,
        skills: chosenSkills,
        battleState: createBattleState()
      };
    };
    const buildBattleTarget = ({ entry, level, forceHpRace500 = false, hpRaceOverride = null, hpRaceMultiplier = null, talentOverride = null, studyOverride = null, displayName = "", displayImage = "" }) => {
      if (!entry) return null;
      const species = getSpeciesByDexId(entry.dexId, entry.name);
      if (!species || !species.raceStats) return null;
      const baseHpRace = safeNonNegInt(species.raceStats.hp);
      const hpRace = Number(hpRaceOverride) > 0
        ? Number(hpRaceOverride)
        : (Number(hpRaceMultiplier) > 0
          ? Math.max(1, Math.round(baseHpRace * Number(hpRaceMultiplier)))
          : (forceHpRace500 ? 500 : baseHpRace));
      const race = {
        hp: hpRace,
        atk: safeNonNegInt(species.raceStats.atk),
        def: safeNonNegInt(species.raceStats.def),
        spAtk: safeNonNegInt(species.raceStats.spAtk),
        spDef: safeNonNegInt(species.raceStats.spDef),
        speed: safeNonNegInt(species.raceStats.speed)
      };
      const ability = calcPetAbilityByRace(race, level, talentOverride || createUniformTalent30(), studyOverride || createZeroStats());
      const targetUnlockedSkills = (species.skills || []).filter((s) => Number(s.level) <= level).map((s) => ({
        skillId: Number(s && s.skillId) || null,
        skillKey: normalize(s && s.skillKey),
        name: normalizeSkillKey(s.name) || "未知技能",
        type: normalize(s.type) || "未知系/普通攻击",
        power: Number(s.power) > 0 ? Number(s.power) : 0,
        ppMax: Math.max(1, Number(s.pp) || 10),
        pp: Math.max(1, Number(s.pp) || 10),
        level: Math.max(0, Number(s.level) || 0),
        accuracy: safeSkillAccuracy(s),
        desc: normalize(s.desc)
      }));
      if (targetUnlockedSkills.length === 0) return null;
      const img = entry.image || PLACEHOLDER;
      return {
        dexId: entry.dexId,
        name: normalize(displayName) || entry.name,
        image: ensureHttps(displayImage || img),
        level,
        element: normalize(entry.element) || "未知系",
        subElement: normalize(entry.subElement),
        ability,
        hp: ability.hp,
        maxHp: ability.hp,
        skills: targetUnlockedSkills,
        battleState: createBattleState()
      };
    };
    const setupBattleScene = ({ targetEntry, targetLevel, forceTargetHpRace500 = false, targetHpRaceOverride = null, targetHpRaceMultiplier = null, targetTalentOverride = null, targetStudyOverride = null, mode = "normal", guardianMeta = null }) => {
      const team = bagPets.value.map((pet) => buildBattleUnitFromPet(pet)).filter(Boolean);
      if (team.length === 0) {
        showToast("背包中没有可出战亚比。");
        return false;
      }
      const target = buildBattleTarget({
        entry: targetEntry,
        level: targetLevel,
        forceHpRace500: forceTargetHpRace500,
        hpRaceOverride: targetHpRaceOverride,
        hpRaceMultiplier: targetHpRaceMultiplier,
        talentOverride: targetTalentOverride,
        studyOverride: targetStudyOverride,
        displayName: mode === "normal" ? targetEntry.name : targetEntry.name,
        displayImage: targetEntry.image
      });
      if (!target) {
        showToast("挑战目标缺少可用种族值或技能数据。");
        return false;
      }
      battleScene.value = {
        open: true,
        ended: false,
        win: false,
        mode,
        guardianMeta: guardianMeta || null,
        team,
        currentAttackerId: team[0].id,
        attackerDexId: Number(team[0].dexId) || 0,
        attackerBaseDexId: Number(team[0].baseDexId) || Number(team[0].dexId) || 0,
        attackerName: team[0].name,
        attackerImage: team[0].image,
        attackerLevel: team[0].level,
        attackerElement: team[0].element,
        attackerAbility: team[0].ability,
        attackerHp: team[0].hp,
        attackerMaxHp: team[0].maxHp,
        uiAttackerHp: team[0].hp,
        uiAttackerMaxHp: team[0].maxHp,
        attackerState: normalizeBattleState(team[0].battleState),
        targetDexId: target.dexId,
        targetName: target.name,
        targetImage: target.image,
        targetLevel: target.level,
        targetElement: target.element,
        targetAbility: target.ability,
        targetHp: target.hp,
        targetMaxHp: target.maxHp,
        uiTargetHp: target.hp,
        uiTargetMaxHp: target.maxHp,
        targetState: normalizeBattleState(target.battleState),
        globalTimedEffects: [],
        skills: team[0].skills,
        targetSkills: target.skills,
        logs: [],
        expGain: 0,
        unlockText: "",
        summary: "",
        lastDamage: 0,
        lastElementFactor: 1,
        fxSkillText: "",
        fxAttackerSkillText: "",
        fxTargetSkillText: "",
        fxDamageText: "",
        fxAttackerShake: false,
        fxTargetShake: false,
        fxAttackerDefeated: false,
        fxTargetDefeated: false,
        isActing: false,
        damageOnAttacker: "",
        damageOnTarget: "",
        healOnAttacker: "",
        healOnTarget: "",
        damageTagOnAttacker: "",
        damageTagOnTarget: "",
        critOnAttacker: false,
        critOnTarget: false,
        skillEffectFx: null,
        ppOnAttacker: "",
        ppOnTarget: "",
        comboHitsOnAttacker: [],
        comboHitsOnTarget: [],
        comboTotalOnAttacker: "",
        comboTotalOnTarget: "",
        comboTotalDelayOnAttacker: 0,
        comboTotalDelayOnTarget: 0,
        forceDefeatSide: "",
        pendingEndTurnTick: false,
        pendingFinish: false
      };
      battleActionTab.value = "skills";
      resetBattleAnimIdle(battleScene.value);
      pushBattleLog(battleScene.value, mode === "guardian" ? "守护者挑战开始。挑战方先手。" : "对战开始。挑战方先手。");
      playBattleBgm();
      return true;
    };
    const canCastBattleSkill = (skillName) => {
      const scene = battleScene.value;
      if (!scene || !scene.open || scene.ended || scene.isActing || scene.pendingFinish) return false;
      const key = normalizeSkillKey(skillName);
      const skill = battleSceneSkills.value.find((s) => normalizeSkillKey(s.name) === key);
      return Boolean(skill && skill.pp > 0);
    };
    const scheduleBattleDefeatResolution = (scene, defeatedSide, reason = "") => {
      if (!scene || scene.ended || scene.pendingFinish) return;
      scene.pendingFinish = true;
      if (scene._defeatExitTimer) clearTimeout(scene._defeatExitTimer);
      scene._defeatExitTimer = setTimeout(() => {
        const live = battleScene.value;
        if (!live || live !== scene || scene.ended) return;
        if (defeatedSide === "target") {
          scene.fxTargetShake = false;
          scene.fxTargetDefeated = true;
        }
        if (defeatedSide === "attacker") {
          scene.fxAttackerShake = false;
          scene.fxAttackerDefeated = true;
        }
      }, BATTLE_DEFEAT_EXIT_START_DELAY_MS);
      setTimeout(() => {
        const live = battleScene.value;
        if (!live || live !== scene || scene.ended) return;
        scene.pendingFinish = false;
        if (defeatedSide === "target") {
          finalizeBattleScene(scene, true, reason);
          return;
        }
        if (Array.isArray(scene.team)) {
          const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
          if (idx >= 0) scene.team[idx].hp = 0;
        }
        const next = (scene.team || []).find((u) => u.hp > 0 && u.id !== scene.currentAttackerId);
        if (next) {
          pushBattleLog(scene, `${scene.attackerName} 倒下，请选择下一只上场亚比。`);
          showSwitchPanel.value = true;
          switchPanelMode.value = "forced";
          scene.isActing = false;
          return;
        }
        finalizeBattleScene(scene, false, reason || "我方背包亚比全部倒下");
      }, Math.max(BATTLE_DEFEAT_RESOLUTION_DELAY_MS, BATTLE_DEFEAT_EXIT_START_DELAY_MS + BATTLE_DEFEAT_EXIT_DURATION_MS));
    };
    const runBattleSkill = (scene, actor, skill) => {
      if (!scene || !skill || scene.ended) return { ended: scene.ended };
      const isAttacker = actor === "attacker";
      const actorName = isAttacker ? scene.attackerName : scene.targetName;
      const targetName = isAttacker ? scene.targetName : scene.attackerName;
      const actorElement = isAttacker ? scene.attackerElement : scene.targetElement;
      const targetElement = isAttacker ? scene.targetElement : scene.attackerElement;
      const actorSide = isAttacker ? "attacker" : "target";
      const targetSide = isAttacker ? "target" : "attacker";
      const beforeAct = beforeActionCheck(scene, actorSide);
      if (beforeAct.log) {
        pushBattleLog(scene, beforeAct.log);
      }
      if (!beforeAct.canAct) {
        return { ended: false, skipped: true };
      }

      scene.fxSkillText = skill.name;
      scene.fxAttackerSkillText = isAttacker ? skill.name : "";
      scene.fxTargetSkillText = isAttacker ? "" : skill.name;
      scene.fxDamageText = "";
      scene.damageOnAttacker = "";
      scene.damageOnTarget = "";
      scene.healOnAttacker = "";
      scene.healOnTarget = "";
      scene.damageTagOnAttacker = "";
      scene.damageTagOnTarget = "";
      scene.critOnAttacker = false;
      scene.critOnTarget = false;
      if (isAttacker) {
        scene.fxTargetShake = true;
        scene.fxAttackerShake = true;
      } else {
        scene.fxTargetShake = true;
        scene.fxAttackerShake = true;
      }

      const actionSeq = (Number(scene._petAnimActionSeq) || 0) + 1;
      scene._petAnimActionSeq = actionSeq;
      const atkKind = parseSkillAttackKind(skill.type);
      const isStatusAnim = atkKind === "status" || Number(skill.power) <= 0;
      const actionStateKey = isStatusAnim ? "status" : "atk";
      if (isAttacker) {
        applyBattleAnimImage(scene, "attacker", actionStateKey, actionSeq);
      } else {
        applyBattleAnimImage(scene, "target", actionStateKey, actionSeq);
      }
      const skillElement = parseSkillElement(skill.type);
      const acc = atkKind === "status" ? 100 : clamp(Number(skill.accuracy) || 100, 1, 100);
      const actorAcc = stageMultiplier(getSideState(scene, actorSide).stages.accuracy || 0);
      const targetEva = stageMultiplier(getSideState(scene, targetSide).stages.evasion || 0);
      const finalHitRate = clamp((acc / 100) * (actorAcc / targetEva), 0.05, 1);
      const didHit = Math.random() <= finalHitRate;

      let damage = 0;
      let elementFactor = 1;
      let comboHitList = [];
      let isComboSkill = false;
      if (!didHit) {
        pushBattleLog(scene, `${actorName} 使用 ${skill.name}，但技能未命中。`);
        const showMissVisual = () => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          if (isAttacker) scene.damageOnTarget = "MISS";
          else scene.damageOnAttacker = "MISS";
        };
        scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showMissVisual);
      } else if (atkKind === "status" || Number(skill.power) <= 0) {
        pushBattleLog(scene, `${actorName} 使用 ${skill.name}（属性技能）。`);
        scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, null);
      } else {
        if (isAttacker) applyBattleAnimImage(scene, "target", "hit", actionSeq);
        else applyBattleAnimImage(scene, "attacker", "hit", actionSeq);
        elementFactor = getElementFactor(skillElement, targetElement);
        const stab = normalize(actorElement) === normalize(skillElement) ? 1.5 : 1;
        const atkStat = atkKind === "special"
          ? getBattleAbilityStat(scene, actorSide, "spAtk")
          : getBattleAbilityStat(scene, actorSide, "atk");
        const defStat = atkKind === "special"
          ? getBattleAbilityStat(scene, targetSide, "spDef")
          : getBattleAbilityStat(scene, targetSide, "def");
        const powerFactor = getElementPowerFactor(scene, actorSide, skillElement);
        const reduceFactor = getDamageReductionFactor(scene, targetSide);
        const mh = parseMultiHitRangeFromDesc(skill);
        const hitTimes = mh ? (mh.min + Math.floor(Math.random() * (mh.max - mh.min + 1))) : 1;
        isComboSkill = Boolean(mh && hitTimes > 1);
        for (let i = 0; i < hitTimes; i += 1) {
          const randomFactor = 0.85 + Math.random() * 0.15;
          let one = calcSkillDamageByOfficialStyle({
            level: isAttacker ? scene.attackerLevel : scene.targetLevel,
            power: Number(skill.power) * powerFactor,
            atkStat,
            defStat,
            stab,
            elementFactor,
            randomFactor
          });
          one = Math.max(1, Math.floor(one * reduceFactor));
          const actorCritStage = getSideState(scene, actorSide).critStage || 0;
          const crit = Math.random() < critChanceByStage(actorCritStage);
          if (crit) {
            one = Math.max(1, Math.floor(one * 1.5));
            if (isAttacker) scene.critOnTarget = true;
            else scene.critOnAttacker = true;
          }
          comboHitList.push(`-${one}`);
          damage += one;
        }
        if ((scene.critOnTarget && isAttacker) || (scene.critOnAttacker && !isAttacker)) {
          pushBattleLog(scene, `${actorName} 打出了暴击！`);
        }
      }

      scene.lastDamage = damage;
      scene.lastElementFactor = elementFactor;
      if (damage > 0) {
        const showDamageVisual = () => {
          const live = battleScene.value;
          if (!live || live !== scene || live.ended) return;
          scene.uiAttackerHp = scene.attackerHp;
          scene.uiTargetHp = scene.targetHp;
          if (isAttacker) {
            if (isComboSkill) {
              scene.damageOnTarget = "";
              scene.comboHitsOnTarget = comboHitList.slice();
              scene.comboTotalOnTarget = `总-${damage}`;
              scene.comboTotalDelayOnTarget = comboHitList.length * 0.28 + 0.1;
            } else {
              scene.damageOnTarget = `-${damage}`;
              scene.comboHitsOnTarget = [];
              scene.comboTotalOnTarget = "";
              scene.comboTotalDelayOnTarget = 0;
            }
            const tag = compareElementLabel(elementFactor);
            const critTag = scene.critOnTarget ? "暴击" : "";
            scene.damageTagOnTarget = [tag === "克制" || tag === "微弱" ? tag : "", critTag].filter(Boolean).join(" ");
          } else {
            if (isComboSkill) {
              scene.damageOnAttacker = "";
              scene.comboHitsOnAttacker = comboHitList.slice();
              scene.comboTotalOnAttacker = `总-${damage}`;
              scene.comboTotalDelayOnAttacker = comboHitList.length * 0.28 + 0.1;
            } else {
              scene.damageOnAttacker = `-${damage}`;
              scene.comboHitsOnAttacker = [];
              scene.comboTotalOnAttacker = "";
              scene.comboTotalDelayOnAttacker = 0;
            }
            const tag = compareElementLabel(elementFactor);
            const critTag = scene.critOnAttacker ? "暴击" : "";
            scene.damageTagOnAttacker = [tag === "克制" || tag === "微弱" ? tag : "", critTag].filter(Boolean).join(" ");
          }
        };
        if (isAttacker) {
          scene.targetHp = Math.max(0, scene.targetHp - damage);
            scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showDamageVisual);
          }
          else {
            scene.attackerHp = Math.max(0, scene.attackerHp - damage);
            applyBattleDamageToActivePet(scene);
            scheduleBattleSkillEffectVisual(scene, actorSide, targetSide, skill, atkKind, actionStateKey, actionSeq, showDamageVisual);
          }
        if (comboHitList.length > 1) {
          pushBattleLog(scene, `${actorName} 使用 ${skill.name}，连续攻击 ${comboHitList.length} 次，总伤害 ${damage}（${compareElementLabel(elementFactor)}）。`);
        } else {
          pushBattleLog(scene, `${actorName} 使用 ${skill.name}，对 ${targetName} 造成 ${damage} 点伤害（${compareElementLabel(elementFactor)}）。`);
        }
        runOnDamagedEffects(scene, targetSide, actorSide, { reason: "attacked" });
        runOnDamagedEffects(scene, targetSide, actorSide, { reason: "damaged" });
      }
      if (didHit && damage <= 0) {
        runOnDamagedEffects(scene, targetSide, actorSide, { reason: "attacked" });
      }
      applySkillEffects(scene, actorSide, skill, didHit);
      if (scene.forceDefeatSide) {
        const side = scene.forceDefeatSide;
        scene.forceDefeatSide = "";
        if (side === "attacker") {
          scheduleBattleDefeatResolution(scene, "attacker", "我方背包亚比全部倒下");
          return { ended: true };
        }
        scheduleBattleDefeatResolution(scene, "target");
        return { ended: true };
      }
      scene.pendingEndTurnTick = true;

      if (isAttacker && scene.targetHp <= 0) {
        scheduleBattleDefeatResolution(scene, "target");
        return { ended: true };
      }
      if (!isAttacker && scene.attackerHp <= 0) {
        pushBattleLog(scene, `${targetName} 击倒我方亚比。`);
        scheduleBattleDefeatResolution(scene, "attacker", "我方背包亚比全部倒下");
        return { ended: true };
      }
      return { ended: false };
    };
    const queueTargetCounterAttack = () => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.pendingFinish) return;
      setTimeout(() => {
        const live = battleScene.value;
        if (!live || live.ended || live.pendingFinish) return;
        const candidates = battleSceneTargetSkills.value.filter((s) => s.pp > 0);
        if (candidates.length === 0) {
          finalizeBattleScene(live, true, "挑战目标技能 PP 耗尽");
          live.isActing = false;
          return;
        }
        const skill = candidates[Math.floor(Math.random() * candidates.length)];
        skill.pp = Math.max(0, skill.pp - 1);
        runBattleSkill(live, "target", skill);
        if (live.ended || live.pendingFinish) return;
        setTimeout(() => {
          const turnEnd = battleScene.value;
          if (!turnEnd || turnEnd !== live || turnEnd.ended || turnEnd.pendingFinish) return;
          if (turnEnd.pendingEndTurnTick) {
            applyEndTurnStatus(turnEnd, "attacker");
            applyBattleDamageToActivePet(turnEnd);
            if (turnEnd.attackerHp <= 0) {
              pushBattleLog(turnEnd, `${turnEnd.attackerName} 倒下。`);
              scheduleBattleDefeatResolution(turnEnd, "attacker", "我方背包亚比全部倒下");
              turnEnd.pendingEndTurnTick = false;
              return;
            }
            if (!turnEnd.ended && !turnEnd.pendingFinish) {
              applyEndTurnStatus(turnEnd, "target");
              if (turnEnd.targetHp <= 0) {
                pushBattleLog(turnEnd, `${turnEnd.targetName} 倒下。`);
                scheduleBattleDefeatResolution(turnEnd, "target");
                turnEnd.pendingEndTurnTick = false;
                return;
              }
            }
            tickGlobalTimedEffects(turnEnd);
          }
          turnEnd.pendingEndTurnTick = false;
          setTimeout(() => {
            if (!battleScene.value || battleScene.value !== turnEnd) return;
            battleScene.value.fxSkillText = "";
            battleScene.value.fxAttackerSkillText = "";
            battleScene.value.fxTargetSkillText = "";
            battleScene.value.fxDamageText = "";
            battleScene.value.damageOnAttacker = "";
            battleScene.value.damageOnTarget = "";
            battleScene.value.healOnAttacker = "";
            battleScene.value.healOnTarget = "";
            battleScene.value.damageTagOnAttacker = "";
            battleScene.value.damageTagOnTarget = "";
            battleScene.value.critOnAttacker = false;
            battleScene.value.critOnTarget = false;
            battleScene.value.skillEffectFx = null;
            battleScene.value.ppOnAttacker = "";
            battleScene.value.ppOnTarget = "";
            battleScene.value.comboHitsOnAttacker = [];
            battleScene.value.comboHitsOnTarget = [];
            battleScene.value.comboTotalOnAttacker = "";
            battleScene.value.comboTotalOnTarget = "";
            battleScene.value.comboTotalDelayOnAttacker = 0;
            battleScene.value.comboTotalDelayOnTarget = 0;
            battleScene.value.fxTargetShake = false;
            battleScene.value.fxAttackerShake = false;
            battleScene.value._petAnimActionMarks = {};
            if (battleScene.value._petAnimTargetAutoIdleTimer) { clearTimeout(battleScene.value._petAnimTargetAutoIdleTimer); battleScene.value._petAnimTargetAutoIdleTimer = null; }
            if (battleScene.value._petAnimAttackerAutoIdleTimer) { clearTimeout(battleScene.value._petAnimAttackerAutoIdleTimer); battleScene.value._petAnimAttackerAutoIdleTimer = null; }
            battleScene.value._petAnimTargetPlayLock = false;
            battleScene.value._petAnimAttackerPlayLock = false;
            resetBattleAnimIdle(battleScene.value);
            battleScene.value.isActing = false;
          }, 1000);
        }, 1500);
      }, BATTLE_COUNTER_ATTACK_DELAY_MS);
    };
    const applyBattleDamageToActivePet = (scene) => {
      if (!scene || !Array.isArray(scene.team)) return;
      const idx = scene.team.findIndex((u) => u.id === scene.currentAttackerId);
      if (idx >= 0) {
        scene.team[idx].hp = clamp(Number(scene.attackerHp) || 0, 0, scene.team[idx].maxHp);
        scene.team[idx].battleState = normalizeBattleState(scene.attackerState);
      }
    };
    const resetAttackerBattleStages = (scene) => {
      if (!scene) return;
      scene.attackerState = createBattleState();
      if (Array.isArray(scene.team)) {
        scene.team.forEach((u) => {
          if (u) u.battleState = createBattleState();
        });
      }
      applyBattleDamageToActivePet(scene);
    };
    const switchGuardianStage = (scene) => {
      if (!scene || scene.mode !== "guardian" || !scene.guardianMeta) return false;
      const meta = scene.guardianMeta;
      if (meta.stageIndex >= meta.levels.length - 1) return false;
      meta.stageIndex += 1;
      const entry = dexById.get(Number(meta.dexId));
      if (!entry) return false;
      const nextLevel = meta.levels[meta.stageIndex];
      const nextTarget = buildBattleTarget({
        entry,
        level: nextLevel,
        forceHpRace500: false,
        hpRaceMultiplier: meta.hpRaceMultiplier,
        talentOverride: meta.talentValue === 50 ? createUniformTalent50() : null,
        studyOverride: createGuardianStudy(),
        displayName: entry.name,
        displayImage: entry.image
      });
      if (!nextTarget) return false;
      scene.targetDexId = nextTarget.dexId;
      scene.targetName = nextTarget.name;
      scene.targetImage = nextTarget.image;
      scene.targetLevel = nextTarget.level;
      scene.targetElement = nextTarget.element;
      scene.targetAbility = nextTarget.ability;
      scene.targetHp = nextTarget.hp;
      scene.targetMaxHp = nextTarget.maxHp;
      scene.uiTargetHp = nextTarget.hp;
      scene.uiTargetMaxHp = nextTarget.maxHp;
      scene.targetState = normalizeBattleState(nextTarget.battleState);
      scene.targetSkills = nextTarget.skills;
      resetAttackerBattleStages(scene);
      scene.fxTargetDefeated = false;
      resetBattleAnimIdle(scene);
      pushBattleLog(scene, `守护者进入下一阶段：Lv.${nextLevel}`);
      return true;
    };
    const finalizeBattleScene = (scene, win, reason = "") => {
      if (!scene || scene.ended) return;
      applyBattleDamageToActivePet(scene);
      scene.win = Boolean(win);

      const activePet = state.value.activePets.find((p) => p.id === scene.currentAttackerId) || firstPet.value || null;
      const target = dexById.get(Number(scene.targetDexId)) || selectedDexEntry.value;
      if (!target) return;

      let expGain = 0;
      let unlockText = "";
      let expDistribution = [];
      if (win) {
        expGain = calcWinExp(scene.targetLevel);
        const receivers = bagPets.value.filter((p) => p && p.id);
        if (receivers.length > 0) {
          const avg = Math.floor(expGain / receivers.length);
          const rem = expGain % receivers.length;
          receivers.forEach((pet, idx) => {
            const row = grantExp(pet, avg + (idx < rem ? 1 : 0));
            expDistribution.push(row);
          });
          pushBattleLog(scene, `获得总经验 ${expGain}，由背包 ${receivers.length} 只亚比平均共享。`);
        } else if (activePet) {
          expDistribution.push(grantExp(activePet, expGain));
        }
        if (scene.mode === "guardian") {
          const advanced = switchGuardianStage(scene);
          if (advanced) {
            scene.expGain = expGain;
            scene.unlockText = "";
            scene.summary = `${scene.attackerName} 守住当前阶段并获得 ${expGain} EXP，继续挑战。`;
            pushBattleLog(scene, scene.summary);
            scene.isActing = false;
            scene.pendingEndTurnTick = false;
            scene.pendingFinish = false;
            return;
          }
          if (!state.value.activatedDexIds.includes(target.dexId)) state.value.activatedDexIds.push(target.dexId);
          const alreadyHadEgg = hasObtainedEggDex(target.dexId);
          if (!alreadyHadEgg) {
            state.value.eggs.unshift({
              id: uid(),
              dexId: target.dexId,
              speciesName: target.name,
              startAt: Date.now(),
              hatchAt: Date.now() + HATCH_MS
            });
            markObtainedEggDex(target.dexId);
            unlockText = `${target.name} 守护者全阶段挑战成功，获得 1 个亚比蛋。`;
          } else {
            unlockText = `${target.name} 守护者全阶段挑战成功，亚比蛋已获取过，不重复发放。`;
          }
        } else {
          const targetChain = getChainStageInfoByDexId(target.dexId, target.name);
          const isFinalForm = targetChain.formCount <= 1 || targetChain.stageIndex >= (targetChain.formCount - 1);
          if (!state.value.activatedDexIds.includes(target.dexId)) state.value.activatedDexIds.push(target.dexId);
          if (isFinalForm) {
            const hatchDexId = Number(targetChain.rootDexId) || target.dexId;
            const hatchDex = dexById.get(hatchDexId) || target;
            const alreadyHadEgg = hasObtainedEggDex(hatchDex.dexId);
            if (!alreadyHadEgg) {
              state.value.eggs.unshift({
                id: uid(),
                dexId: hatchDex.dexId,
                speciesName: hatchDex.name,
                startAt: Date.now(),
                hatchAt: Date.now() + HATCH_MS
              });
              markObtainedEggDex(hatchDex.dexId);
              unlockText = `${target.name}（最终形态）挑战成功，获得 1 个亚比蛋。`;
            } else {
              unlockText = `${target.name}（最终形态）挑战成功，亚比蛋已获取过，不重复发放。`;
            }
          } else {
            unlockText = `${target.name} 不是最终形态，已激活图鉴但不掉落亚比蛋。`;
          }
        }
      }
      scene.ended = true;
      scene.expGain = expGain;
      scene.unlockText = unlockText;
      scene.summary = win
        ? `${scene.attackerName} 成功击败 ${scene.targetName}。`
        : `${scene.attackerName} 挑战失败${reason ? `：${reason}` : ""}。`;
      battleResult.value = {
        win,
        expGain,
        unlockText,
        summary: scene.summary,
        expDistribution
      };
      if (win) {
        const evoList = (expDistribution || []).filter((x) => x && x.evolved);
        if (evoList.length > 0) {
          evolutionQueue.value.push(...evoList);
          tryOpenNextEvolution();
        }
      }
      closeBattleScene();

      state.value.battleLog.unshift({
        id: uid(),
        win,
        attacker: scene.attackerName,
        attackerLevel: scene.attackerLevel,
        target: scene.targetName,
        targetLevel: scene.targetLevel,
        expGain,
        time: new Date().toLocaleTimeString("zh-CN", { hour12: false })
      });
      state.value.battleLog = sanitizeBattleLog(state.value.battleLog).slice(0, 30);
    };
    const castBattleSkill = (skillName) => {
      const scene = battleScene.value;
      if (!scene || !scene.open || scene.ended || scene.isActing || scene.pendingFinish) return;
      const key = normalizeSkillKey(skillName);
      const skill = (scene.skills || []).find((s) => normalizeSkillKey(s.name) === key);
      if (!skill || skill.pp <= 0) return;
      scene.isActing = true;
      skill.pp = Math.max(0, skill.pp - 1);
      runBattleSkill(scene, "attacker", skill);
      setTimeout(() => {
        if (!battleScene.value) return;
        battleScene.value.fxSkillText = "";
        battleScene.value.fxAttackerSkillText = "";
        battleScene.value.fxTargetSkillText = "";
        battleScene.value.fxDamageText = "";
        battleScene.value.damageOnAttacker = "";
        battleScene.value.damageOnTarget = "";
        battleScene.value.healOnAttacker = "";
        battleScene.value.healOnTarget = "";
        battleScene.value.damageTagOnAttacker = "";
        battleScene.value.damageTagOnTarget = "";
        battleScene.value.critOnAttacker = false;
        battleScene.value.critOnTarget = false;
        battleScene.value.skillEffectFx = null;
        battleScene.value.ppOnAttacker = "";
        battleScene.value.ppOnTarget = "";
        battleScene.value.comboHitsOnAttacker = [];
        battleScene.value.comboHitsOnTarget = [];
        battleScene.value.comboTotalOnAttacker = "";
        battleScene.value.comboTotalOnTarget = "";
        battleScene.value.comboTotalDelayOnAttacker = 0;
        battleScene.value.comboTotalDelayOnTarget = 0;
        battleScene.value.fxTargetShake = false;
        battleScene.value.fxAttackerShake = false;
        battleScene.value._petAnimActionMarks = {};
        if (battleScene.value._petAnimTargetAutoIdleTimer) { clearTimeout(battleScene.value._petAnimTargetAutoIdleTimer); battleScene.value._petAnimTargetAutoIdleTimer = null; }
        if (battleScene.value._petAnimAttackerAutoIdleTimer) { clearTimeout(battleScene.value._petAnimAttackerAutoIdleTimer); battleScene.value._petAnimAttackerAutoIdleTimer = null; }
        battleScene.value._petAnimTargetPlayLock = false;
        battleScene.value._petAnimAttackerPlayLock = false;
        resetBattleAnimIdle(battleScene.value);
      }, BATTLE_DEFEAT_RESOLUTION_DELAY_MS);
      if (scene.ended) {
        scene.isActing = false;
        return;
      }
      const noPp = (scene.skills || []).every((s) => s.pp <= 0);
      if (noPp) {
        finalizeBattleScene(scene, false, "技能 PP 耗尽");
        scene.isActing = false;
        return;
      }
      queueTargetCounterAttack();
    };
    const consumeBattleTurnAfterItem = () => {
      const scene = battleScene.value;
      if (!scene || !scene.open || scene.ended || scene.pendingFinish) return;
      const noPp = (scene.skills || []).every((s) => s.pp <= 0);
      if (noPp) {
        finalizeBattleScene(scene, false, "技能 PP 耗尽");
        scene.isActing = false;
        return;
      }
      scene.isActing = true;
      queueTargetCounterAttack();
    };
    const switchBattlePet = (unitId) => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.isActing || scene.pendingFinish) return;
      applyBattleDamageToActivePet(scene);
      const id = String(unitId || "");
      if (!id || id === scene.currentAttackerId) return;
      const next = (scene.team || []).find((u) => u.id === id && u.hp > 0);
      if (!next) return;
      scene.currentAttackerId = next.id;
      scene.attackerDexId = Number(next.dexId) || 0;
      scene.attackerBaseDexId = Number(next.baseDexId) || Number(next.dexId) || 0;
      scene.attackerName = next.name;
      scene.attackerImage = next.image;
      scene.attackerLevel = next.level;
      scene.attackerElement = next.element;
      scene.attackerAbility = next.ability;
      scene.attackerHp = next.hp;
      scene.attackerMaxHp = next.maxHp;
      scene.uiAttackerHp = next.hp;
      scene.uiAttackerMaxHp = next.maxHp;
      scene.attackerState = normalizeBattleState(next.battleState);
      scene.skills = next.skills;
      scene.fxAttackerDefeated = false;
      resetBattleAnimIdle(scene);
      pushBattleLog(scene, `我方换宠：${next.name} 上场。`);
      showSwitchPanel.value = false;
      const mode = switchPanelMode.value;
      switchPanelMode.value = "manual";
      if (mode === "manual") {
        scene.isActing = true;
        queueTargetCounterAttack();
      }
    };
    const openSwitchPanel = (mode = "manual") => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.isActing || scene.pendingFinish) return;
      switchPanelMode.value = mode;
      showSwitchPanel.value = true;
    };
    const closeSwitchPanel = () => {
      if (switchPanelMode.value === "forced") return;
      showSwitchPanel.value = false;
    };
    const closeBattleScene = () => {
      if (battleScene.value) {
        battleScene.value.pendingFinish = false;
        if (battleScene.value._petAnimTargetAutoIdleTimer) { clearTimeout(battleScene.value._petAnimTargetAutoIdleTimer); battleScene.value._petAnimTargetAutoIdleTimer = null; }
        if (battleScene.value._petAnimAttackerAutoIdleTimer) { clearTimeout(battleScene.value._petAnimAttackerAutoIdleTimer); battleScene.value._petAnimAttackerAutoIdleTimer = null; }
        battleScene.value._petAnimTargetPlayLock = false;
        battleScene.value._petAnimAttackerPlayLock = false;
      }
      battleScene.value = null;
      stopBattleBgm();
      showSwitchPanel.value = false;
      switchPanelMode.value = "manual";
    };
    const openBattleItemPanel = () => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.isActing || scene.pendingFinish) return;
      battleActionTab.value = "items";
      shopTargetPetId.value = scene.currentAttackerId || "";
    };
    const openBattleSkillPanel = () => {
      const scene = battleScene.value;
      if (!scene || scene.ended || scene.isActing || scene.pendingFinish) return;
      battleActionTab.value = "skills";
    };
    const clearSkillLongPress = () => {
      if (skillLongPressTimer.value) {
        clearTimeout(skillLongPressTimer.value);
        skillLongPressTimer.value = null;
      }
    };
    const onBattleSkillTouchStart = (skill) => {
      clearSkillLongPress();
      if (!skill) return;
      skillLongPressTimer.value = setTimeout(() => {
        const text = skillBattleDesc(skill);
        if (text) showToast(text);
      }, 420);
    };
    const onBattleSkillTouchEnd = () => {
      clearSkillLongPress();
    };

    const dexStatus = (entry) => {
      if (isGuardianName(entry.name)) return "守护者";
      if (state.value.activatedDexIds.includes(entry.dexId)) return "已激活";
      return "未激活";
    };
    const statusClass = (entry) => {
      const s = dexStatus(entry);
      if (s === "守护者") return "bg-amber-100 text-amber-700";
      if (s === "已激活") return "bg-emerald-100 text-emerald-700";
      return "bg-slate-100 text-slate-500";
    };
    const expPercent = (pet) => {
      const need = expRequired(pet.level);
      if (!isFinite(need) || need <= 0) return 100;
      return clamp((pet.exp / need) * 100, 0, 100);
    };
    const formatRemain = (ms) => {
      if (ms <= 0) return "00:00";
      const sec = Math.floor(ms / 1000);
      return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
    };

    const inspectSkill = (skillName) => {
      selectedSkillName.value = normalizeSkillKey(skillName);
      syncSelectedSkillName();
    };
    const hasEquippedSkill = (pet, skillName) => {
      if (!pet) return false;
      const key = normalizeSkillKey(skillName);
      if (!key) return false;
      return (Array.isArray(pet.equippedSkills) ? pet.equippedSkills : [])
        .some((x) => normalizeSkillKey(x) === key);
    };
    const toggleEquipSkill = (skillName) => {
      const pet = selectedPet.value;
      if (!pet) return;
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) return;
      const nextSkill = normalizeSkillKey(skillName);
      if (!nextSkill) return;
      const validSet = speciesSkillNameSet(species, pet.level);
      if (!validSet.has(nextSkill)) return;
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      const i = pet.equippedSkills.findIndex((x) => normalizeSkillKey(x) === nextSkill);
      if (i >= 0) { pet.equippedSkills.splice(i, 1); return; }
      if (pet.equippedSkills.length < 4) { pet.equippedSkills.push(nextSkill); return; }
      replaceSkillCtx.value = { petId: pet.id, newSkill: nextSkill };
    };
    const startDirectReplaceSkill = (oldSkill) => {
      const pet = selectedPet.value;
      if (!pet) return;
      const oldName = normalizeSkillKey(oldSkill);
      if (!oldName) return;
      replaceSkillCtx.value = { petId: pet.id, oldSkill: oldName, directReplaceMode: true };
    };
    const confirmDirectReplaceSkill = (newSkill) => {
      const pet = selectedPet.value;
      const ctx = replaceSkillCtx.value;
      if (!pet || !ctx || ctx.petId !== pet.id || !ctx.directReplaceMode) return;
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) { replaceSkillCtx.value = null; return; }
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      const oldName = normalizeSkillKey(ctx.oldSkill);
      const newName = normalizeSkillKey(newSkill);
      const validSet = speciesSkillNameSet(species, pet.level);
      if (!oldName || !newName || !validSet.has(newName)) { replaceSkillCtx.value = null; return; }
      const idx = pet.equippedSkills.findIndex((x) => normalizeSkillKey(x) === oldName);
      if (idx >= 0) {
        pet.equippedSkills.splice(idx, 1, newName);
        pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      }
      replaceSkillCtx.value = null;
    };
    const confirmReplaceSkill = (oldSkill) => {
      const pet = selectedPet.value;
      const ctx = replaceSkillCtx.value;
      if (!pet || !ctx || ctx.petId !== pet.id) return;
      const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
      if (!species) { replaceSkillCtx.value = null; return; }
      pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      const oldName = normalizeSkillKey(oldSkill);
      const newName = normalizeSkillKey(ctx.newSkill);
      const validSet = speciesSkillNameSet(species, pet.level);
      if (!newName || !validSet.has(newName)) { replaceSkillCtx.value = null; return; }
      const idx = pet.equippedSkills.indexOf(oldName);
      if (idx >= 0) {
        pet.equippedSkills.splice(idx, 1, newName);
        pet.equippedSkills = normalizeEquippedSkillsBySpecies(species, pet.equippedSkills, pet.level);
      }
      replaceSkillCtx.value = null;
    };
    const cancelReplaceSkill = () => { replaceSkillCtx.value = null; };

    const isInBag = (petId) => state.value.bagPetIds.includes(petId);
    const beginReplaceBag = (incomingPetId) => {
      if (!incomingPetId) return false;
      if (isInBag(incomingPetId)) return false;
      const incoming = safeActivePets.value.find((p) => p.id === incomingPetId);
      if (!incoming) return false;
      bagReplaceCtx.value = { incomingPetId };
      return true;
    };
    const addToBag = (petId) => {
      if (isInBag(petId)) return true;
      const emptyIdx = state.value.bagPetIds.findIndex((x) => !x);
      if (emptyIdx < 0) {
        if (beginReplaceBag(petId)) showToast("背包已满，请选择一个背包位进行替换。");
        return false;
      }
      state.value.bagPetIds.splice(emptyIdx, 1, petId);
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
      return true;
    };
    const removeFromBag = (slotIdx) => {
      state.value.bagPetIds.splice(slotIdx, 1, "");
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
    };
    const swapBagSlots = (a, b) => {
      if (a === b) return;
      const ids = state.value.bagPetIds;
      const tmp = ids[a];
      ids[a] = ids[b];
      ids[b] = tmp;
      state.value.selectedAttackerId = ids[0] || "";
    };
    const moveBagLeft = (slotIdx) => {
      if (slotIdx <= 0) return;
      swapBagSlots(slotIdx, slotIdx - 1);
    };
    const moveBagRight = (slotIdx) => {
      if (slotIdx >= 5) return;
      swapBagSlots(slotIdx, slotIdx + 1);
    };
    const setAsFirstPet = (petId) => {
      if (!petId) return;
      if (!isInBag(petId) && !addToBag(petId)) return;
      const idx = state.value.bagPetIds.indexOf(petId);
      if (idx < 0) return;
      if (idx !== 0) swapBagSlots(0, idx);
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
    };
    const toggleBagByPet = (petId) => {
      const idx = state.value.bagPetIds.indexOf(petId);
      if (idx >= 0) removeFromBag(idx);
      else addToBag(petId);
    };
    const replaceBagSlot = (slotIdx) => {
      const ctx = bagReplaceCtx.value;
      if (!ctx) return;
      const idx = clamp(Number(slotIdx) || 0, 0, 5);
      const incomingPetId = String(ctx.incomingPetId || "");
      if (!incomingPetId) { bagReplaceCtx.value = null; return; }
      if (!safeActivePets.value.some((p) => p.id === incomingPetId)) {
        bagReplaceCtx.value = null;
        return;
      }
      const outgoingPetId = state.value.bagPetIds[idx] || "";
      state.value.bagPetIds.splice(idx, 1, incomingPetId);
      if (outgoingPetId && state.value.selectedPetId === outgoingPetId) {
        state.value.selectedPetId = incomingPetId;
      }
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
      bagReplaceCtx.value = null;
      showToast(`已替换背包 ${idx + 1} 号位亚比。`);
    };
    const cancelReplaceBag = () => { bagReplaceCtx.value = null; };
    const useAsAttacker = (petId) => {
      setAsFirstPet(petId);
    };

    const selectDex = (dexId) => { state.value.selectedDexId = dexId; };
    const selectPet = (petId) => { state.value.selectedPetId = petId; };
    const toggleDexPanel = () => { state.value.showDexPanel = !state.value.showDexPanel; };
    const openDexPanel = () => { state.value.showDexPanel = true; };
    const closeDexPanel = () => { state.value.showDexPanel = false; };
    const openWarehousePanel = () => { showWarehousePanel.value = true; };
    const closeWarehousePanel = () => {
      showWarehousePanel.value = false;
      selectedWarehousePetId.value = "";
      showWarehouseActionModal.value = false;
    };
    const toggleWarehousePetActions = (petId) => {
      const id = String(petId || "");
      if (!id) return;
      selectedWarehousePetId.value = id;
      showWarehouseActionModal.value = true;
    };
    const isWarehousePetExpanded = (petId) => selectedWarehousePetId.value === String(petId || "");
    const closeWarehouseActionModal = () => { showWarehouseActionModal.value = false; };
    const addToBagFromWarehouse = (petId) => {
      const ok = addToBag(petId);
      if (ok) closeWarehouseActionModal();
      return ok;
    };
    const selectedWarehouseActionPet = computed(() => state.value.activePets.find((p) => p && p.id === selectedWarehousePetId.value) || null);
    const openShopPanel = () => {
      showShopPanel.value = true;
      shopTab.value = "shop";
      if (!shopTargetPetId.value) {
        const first = safeActivePets.value[0];
        shopTargetPetId.value = first ? first.id : "";
      }
    };
    const closeShopPanel = () => { showShopPanel.value = false; };
    const buyShopItem = (itemId) => {
      const id = normalize(String(itemId || ""));
      if (!id) return;
      const item = shopItems.value.find((x) => normalize(x.id) === id);
      if (!item) return;
      addItemCount(id, 1);
      showToast(`已购买 ${item.name} x1`);
    };
    const useShopItem = (itemId) => {
      const id = normalize(String(itemId || ""));
      if (!id) return;
      if (getItemCount(id) <= 0) return showToast("该道具数量不足。");
      if (battleScene.value && battleScene.value.currentAttackerId) {
        shopTargetPetId.value = battleScene.value.currentAttackerId;
      }
      const pet = state.value.activePets.find((p) => p && p.id === shopTargetPetId.value);
      if (!pet) return showToast("请先选择目标亚比。");
      if (id === "max_level_fruit") {
        if (pet.level >= 100) return showToast(`${petDisplayName(pet)} 已是满级。`);
        const chainAnchorDexId = Number((pet && pet.baseDexId) || (pet && pet.dexId)) || Number(pet.dexId) || 0;
        const chain = getChainStageInfoByDexId(chainAnchorDexId, pet.speciesName);
        const crossed = [];
        while (pet.level < 100) {
          const beforeForm = petCurrentForm(pet);
          const oldLevel = pet.level;
          pet.level += 1;
          const prevStage = stageIndexByLevelAndCount(oldLevel, chain.formCount, chain.evoLevels);
          const nextStage = stageIndexByLevelAndCount(pet.level, chain.formCount, chain.evoLevels);
          if (nextStage > prevStage) {
            addEvolutionFx(pet.id);
            const beforeDexId = resolveEvolutionDexIdByPetAndStage(pet, prevStage);
            const afterDexId = resolveEvolutionDexIdByPetAndStage(pet, nextStage);
            const beforeDex = dexById.get(Number(beforeDexId));
            const afterDex = dexById.get(Number(afterDexId));
            const afterForm = petCurrentForm(pet);
            crossed.push({
              petId: pet.id,
              beforeName: (beforeDex && beforeDex.name) || normalize(beforeForm && beforeForm.name) || pet.speciesName,
              afterName: (afterDex && afterDex.name) || normalize(afterForm && afterForm.name) || pet.speciesName,
              beforeImage: (beforeDex && ensureHttps(beforeDex.image)) || ensureHttps(beforeForm && beforeForm.img) || PLACEHOLDER,
              afterImage: (afterDex && ensureHttps(afterDex.image)) || ensureHttps(afterForm && afterForm.img) || PLACEHOLDER
            });
          }
          const evoDexId = resolveEvolutionDexIdByPetAndStage(pet, nextStage);
          if (evoDexId > 0 && !state.value.activatedDexIds.includes(evoDexId)) {
            state.value.activatedDexIds.push(evoDexId);
          }
        }
        pet.exp = 0;
        autoFillSkills(pet);
        syncSelectedSkillName();
        addItemCount(id, -1);
        if (crossed.length > 0) {
          evolutionQueue.value.push(...crossed);
          tryOpenNextEvolution();
        }
        showToast(`${petDisplayName(pet)} 已升至 Lv.100。`);
        return;
      }
      if (id === "pp_bean_s" || id === "pp_bean_m" || id === "pp_bean_l") {
        const gain = id === "pp_bean_s" ? 5 : (id === "pp_bean_m" ? 10 : 20);
        const scene = battleScene.value;
        const actor = scene && scene.currentAttackerId === pet.id ? scene : null;
        if (!actor) return showToast("PP 豆需在该亚比出战时使用。");
        let deltaSum = 0;
        const detail = [];
        (actor.skills || []).forEach((s) => {
          const cur = Number(s.pp) || 0;
          const mx = Math.max(1, Number(s.ppMax) || cur || 1);
          const next = clamp(cur + gain, 0, mx);
          const inc = Math.max(0, next - cur);
          deltaSum += inc;
          detail.push(`${s.name}+${inc}`);
          s.pp = next;
        });
        addItemCount(id, -1);
        actor.ppOnAttacker = `PP+${deltaSum}`;
        setTimeout(() => {
          if (battleScene.value && battleScene.value === actor) actor.ppOnAttacker = "";
        }, 1000);
        pushBattleLog(actor, `${petDisplayName(pet)} 使用 ${shopItems.value.find((x) => x.id === id)?.name || "PP豆"}：${detail.join("，")}（合计+${deltaSum}）`);
        battleActionTab.value = "skills";
        showToast(`${petDisplayName(pet)} 的技能 PP 实际恢复 ${deltaSum} 点。`);
        consumeBattleTurnAfterItem();
        return;
      }
      if (id === "hp_candy_s" || id === "hp_candy_m" || id === "hp_candy_l") {
        const heal = id === "hp_candy_s" ? 50 : (id === "hp_candy_m" ? 100 : 200);
        const species = getSpeciesByDexId(pet.dexId, pet.speciesName);
        const race = species && species.raceStats ? species.raceStats : createZeroStats();
        const ability = calcPetAbilityByRace(race, pet.level, pet.talent, pet.study);
        const maxHp = Math.max(1, Number(ability.hp) || 1);
        const scene = battleScene.value;
        const oldHp = (scene && scene.currentAttackerId === pet.id)
          ? clamp(Number(scene.attackerHp) || 0, 0, maxHp)
          : clamp(Number(pet.hp || maxHp), 0, maxHp);
        pet.hp = clamp(oldHp + heal, 0, maxHp);
        addItemCount(id, -1);
        const healedActual = Math.max(0, pet.hp - oldHp);
        if (scene && scene.currentAttackerId === pet.id) {
          scene.attackerHp = clamp(Number(pet.hp) || 0, 0, Number(scene.attackerMaxHp) || 1);
          scene.uiAttackerHp = scene.attackerHp;
          scene.healOnAttacker = `+${healedActual}`;
          setTimeout(() => {
            if (battleScene.value && battleScene.value === scene) scene.healOnAttacker = "";
          }, 1000);
          pushBattleLog(scene, `${petDisplayName(pet)} 使用 ${shopItems.value.find((x) => x.id === id)?.name || "体力糖"}，回复 ${healedActual} 体力`);
        }
        battleActionTab.value = "skills";
        showToast(`${petDisplayName(pet)} 回复体力 ${healedActual} 点。`);
        if (scene && scene.currentAttackerId === pet.id) consumeBattleTurnAfterItem();
        return;
      }
      showToast("该道具暂未开放。");
    };
    const setChallengeFormIndex = (idx) => {
      void idx;
      const next = selectedDexStageIndex.value;
      state.value.challengeFormIndex = next;
      state.value.targetLevel = selectedChallengeDefaultLevel.value;
    };
    const openPetDetailModal = (petId) => {
      const id = String(petId || "");
      if (!id) return;
      const exists = state.value.activePets.some((p) => p && p.id === id);
      if (!exists) {
        showToast("该亚比数据异常，请重试。");
        return;
      }
      const openNow = () => {
        state.value.selectedPetId = id;
        showPetDetailModal.value = true;
        selectedInfoTab.value = "skills";
        syncSelectedSkillName();
      };
      detailPreviewPet.value = null;
      // 关键修复：当点击的就是当前 selectedPetId（常见于首宠）时，
      // 强制重置一次选择，确保依赖链完整刷新，避免弹窗白屏。
      if (state.value.selectedPetId === id) {
        state.value.selectedPetId = "";
        nextTick(() => openNow());
        return;
      }
      openNow();
    };
    const openSelectedDexDetail = () => {
      const entry = selectedDexEntry.value;
      if (!entry) return;
      // 查看详情时固定按 100 级展示，保证“技能栏（全部技能）”完整可见。
      const lv = 100;
      const species = speciesByDexMap.get(Number(entry.dexId));
      if (!species) {
        showToast("该挑战目标暂无已生成的技能/种族值数据。");
        return;
      }
      const unlocked = (species.skills || []).filter((s) => Number(s.level) <= lv).map((s) => normalizeSkillKey(s.name)).filter(Boolean);
      detailPreviewPet.value = {
        id: `preview_${entry.dexId}`,
        dexId: entry.dexId,
        fixedDexId: entry.dexId,
        fixedName: entry.name,
        fixedImage: ensureHttps(entry.image) || PLACEHOLDER,
        previewAllSkills: true,
        hideStudyTalentTabs: true,
        speciesName: entry.name,
        level: lv,
        exp: 0,
        totalExp: 0,
        element: entry.element || "",
        subElement: entry.subElement || "",
        equippedSkills: unlocked,
        talent: createRandomHatchTalent(),
        study: createZeroStats()
      };
      showPetDetailModal.value = true;
      selectedInfoTab.value = "skills";
      syncSelectedSkillName();
    };
    const openSelectedGuardianDetail = () => {
      const entry = selectedGuardianEntry.value;
      if (!entry) return;
      const species = speciesByDexMap.get(Number(entry.dexId));
      if (!species) {
        showToast("该守护者暂无已生成的技能/种族值数据。");
        return;
      }
      const lv = 100;
      const extraGuardian = isExtraGuardianName(entry.name);
      const unlocked = (species.skills || []).filter((s) => Number(s.level) <= lv).map((s) => normalizeSkillKey(s.name)).filter(Boolean);
      detailPreviewPet.value = {
        id: `preview_guardian_${entry.dexId}`,
        dexId: entry.dexId,
        fixedDexId: entry.dexId,
        fixedName: entry.name,
        fixedImage: ensureHttps(entry.image) || PLACEHOLDER,
        speciesName: entry.name,
        level: lv,
        exp: 0,
        totalExp: 0,
        element: entry.element || "",
        subElement: entry.subElement || "",
        equippedSkills: unlocked,
        previewAllSkills: true,
        hideStudyTalentTabs: false,
        talent: extraGuardian ? createUniformTalent50() : createUniformTalent30(),
        study: createGuardianStudy()
      };
      showPetDetailModal.value = true;
      selectedInfoTab.value = "skills";
      syncSelectedSkillName();
    };
    const closePetDetailModal = () => {
      showPetDetailModal.value = false;
      detailPreviewPet.value = null;
    };
    watch(showPetDetailModal, (open) => {
      if (!open) return;
      nextTick(() => {
        syncSelectedSkillName();
      });
    });
    const openElementPanel = () => { showElementPanel.value = true; };
    const closeElementPanel = () => { showElementPanel.value = false; };

    const startChallenge = () => {
      const target = selectedDexEntry.value;
      if (!target) return showToast("请先在图鉴中选择挑战目标。");
      if (!canChallengeFromDex(target)) return showToast("该亚比为守护者，请从【守护者】入口挑战。");
      if (!canStartChallengeByDex(target)) return showToast("当前仅开放编号1-796的亚比挑战。");

      const range = selectedChallengeLevelRange.value;
      const rawText = String(state.value.targetLevel ?? "").trim();
      const raw = Number(rawText);
      if (!rawText || !Number.isInteger(raw) || raw < range.min || raw > range.max) {
        return showToast(`挑战等级必须是${range.min}-${range.max}之间的整数。`);
      }
      state.value.targetLevel = String(raw);
      const tl = raw;
      closeTargetPanel();
      setupBattleScene({
        targetEntry: target,
        targetLevel: tl,
        forceTargetHpRace500: false,
        mode: "normal"
      });
    };
    const openGuardianPanel = () => { showGuardianPanel.value = true; };
    const closeGuardianPanel = () => { showGuardianPanel.value = false; };
    const openTargetPanel = () => {
      if (!selectedDexEntry.value) return showToast("请先在图鉴中选择挑战目标。");
      if (!canChallengeFromDex(selectedDexEntry.value)) return showToast("该亚比为守护者，请从【守护者】入口挑战。");
      showTargetPanel.value = true;
    };
    const closeTargetPanel = () => { showTargetPanel.value = false; };
    const selectDexAndOpenTarget = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry) return;
      if (!canChallengeFromDex(entry)) return showToast("该亚比为守护者，请从【守护者】入口挑战。");
      selectDex(entry.dexId);
      closeDexPanel();
      openTargetPanel();
    };
    const openGuardianChallengePanel = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isGuardianName(entry.name)) return;
      selectedGuardianDexId.value = entry.dexId;
      closeGuardianPanel();
      showGuardianChallengePanel.value = true;
    };
    const closeGuardianChallengePanel = () => { showGuardianChallengePanel.value = false; };
    const startGuardianChallenge = (dexId) => {
      const entry = dexById.get(Number(dexId));
      if (!entry || !isGuardianName(entry.name)) return showToast("该亚比不是守护者。");
      if (bagPets.value.length === 0) return showToast("背包中没有可出战亚比。");
      closeGuardianChallengePanel();
      const extraGuardian = isExtraGuardianName(entry.name);
      const meta = {
        dexId: entry.dexId,
        guardianName: entry.name,
        levels: extraGuardian ? EXTRA_GUARDIAN_LEVELS.slice() : GUARDIAN_LEVELS.slice(),
        stageIndex: 0,
        hpRaceMultiplier: extraGuardian ? 7 : 3.5,
        talentValue: extraGuardian ? 50 : 30
      };
      const level = meta.levels[0];
      setupBattleScene({
        targetEntry: entry,
        targetLevel: level,
        forceTargetHpRace500: false,
        targetHpRaceMultiplier: meta.hpRaceMultiplier,
        targetTalentOverride: extraGuardian ? createUniformTalent50() : null,
        targetStudyOverride: createGuardianStudy(),
        mode: "guardian",
        guardianMeta: meta
      });
    };
    const confirmGuardianChallenge = () => {
      const entry = selectedGuardianEntry.value;
      if (!entry) return showToast("请先选择守护者。");
      startGuardianChallenge(entry.dexId);
    };

    const hatchEgg = (eggId) => {
      const idx = state.value.eggs.findIndex((e) => e.id === eggId);
      if (idx < 0) return;
      const egg = state.value.eggs[idx];
      if (egg.hatchAt > nowTs.value) return showToast("该亚比蛋还在孵化中。");
      const hatchDex = dexById.get(Number(egg.dexId)) || findDexByName(egg.speciesName);
      if (!hatchDex) return showToast("孵化失败：找不到图鉴编号。");
      const species = getSpeciesByDexId(hatchDex.dexId, hatchDex.name);
      if (!species) return showToast("孵化失败：缺少亚比数据。");

      const newPet = {
        id: uid(),
        dexId: hatchDex.dexId,
        baseDexId: hatchDex.dexId,
        speciesName: hatchDex.name,
        element: normalize(hatchDex.element) || "未知系",
        subElement: normalize(hatchDex.subElement),
        level: 1,
        exp: 0,
        totalExp: 0,
        talent: createRandomHatchTalent(),
        study: createZeroStats(),
        equippedSkills: normalizeEquippedSkillsBySpecies(
          species,
          species.skills.filter((s) => s.level <= 1).slice(0, 4).map((s) => s.name),
          1
        ),
        createdAt: Date.now()
      };
      state.value.activePets.unshift(newPet);
      markObtainedEggDex(newPet.dexId);
      state.value.selectedPetId = newPet.id;
      const emptyIdx = state.value.bagPetIds.findIndex((x) => !x);
      if (emptyIdx >= 0) state.value.bagPetIds.splice(emptyIdx, 1, newPet.id);
      state.value.selectedAttackerId = state.value.bagPetIds[0] || "";
      state.value.eggs.splice(idx, 1);
      const talentTotal = Object.values(newPet.talent || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);
      const grade = talentGradeByTotal(talentTotal);
      showToast(`${hatchDex.name} 孵化成功，初始 Lv.1。天赋总值 ${talentTotal}（${grade}）`);
    };

    const resetProgress = () => {
      if (!confirm("确定重置全部进度吗？")) return;
      state.value = createInitialState();
      selectedSkillName.value = "";
      replaceSkillCtx.value = null;
      bagReplaceCtx.value = null;
      saveState(state.value);
      showToast("进度已重置。");
    };

    const withFallback = (event) => {
      const img = event && event.target;
      if (!img) return;
      if (img.dataset.fallbackDone === "1") { img.style.display = "none"; return; }
      img.dataset.fallbackDone = "1";
      img.src = PLACEHOLDER;
    };

    return {
      state,
      dexSearch,
      dexElementFilter,
      warehouseSearch,
      warehouseElementFilter,
      nowTs,
      toast,
      battleResult,
      activeEvolution,
      battleScene,
      showSwitchPanel,
      selectedWarehousePetId,
      showWarehouseActionModal,
      selectedWarehouseActionPet,
      switchPanelMode,
      showElementPanel,
      showWarehousePanel,
      showShopPanel,
      shopTab,
      battleActionTab,
      showPetDetailModal,
      elementRelationImage: ELEMENT_RELATION_IMAGE,
      selectedDexEntry,
      selectedDexSpecies,
      selectedDexFormCount,
      selectedDexStageIndex,
      selectedDexAvailableFormIndices,
      selectedChallengeFormIndex,
      selectedChallengeForm,
      selectedDexBattleImage,
      selectedChallengeLevelRange,
      selectedChallengeDefaultLevel,
      targetLevelInput,
      targetLevelValidationText,
      selectedChallengeFormLabel,
      selectedPet,
      selectedDexDetailPet,
      selectedSkillName,
      selectedSkillDetail,
      selectedPetSpecies,
      selectedPetDetailVisual,
      selectedPetEquippedSkills,
      selectedRaceStats,
      selectedAbilityStats,
      selectedPetTalent,
      selectedPetStudy,
      selectedStudyTotal,
      selectedInfoTab,
      replaceSkillCtx,
      bagReplaceCtx,
      filteredDex,
      dexElementOptions,
      activatedDexCount,
      dexTotal,
      bagSlots,
      firstPet,
      bagPets,
      bagCount,
      safeActivePets,
      warehousePets,
      warehouseElementOptions,
      filteredWarehousePets,
      warehouseCount,
      shopItems,
      itemInventoryRows,
      shopTargetPetId,
      shopTargetOptions,
      safeEggs,
      safeBattleLog,
      predictedWinExp,
      predictedLoseExp,
      predictedElementFactor,
      predictedElementText,
      availableSkillsForSelectedPet,
      expRequired,
      expPercent,
      petCurrentForm,
      bagPetVisual,
      petDisplayName,
      dexFinalForm,
      dexStatus,
      statusClass,
      formatRemain,
      isInBag,
      isEvolving: (petId) => evolvingIds.value.includes(petId),
      petId,
      eggId,
      rowId,
      safeSkillName,
      safeSkillType,
      safeSkillPower,
      safeSkillPP,
      safeSkillAccuracy,
      skillBattleDesc,
      skillAttackTypeLabel,
      hasEquippedSkill,
      petElementIconStyle,
      petElementIconSrc,
      petElementList,
      skillTypeMeta,
      hpPercent,
      battleSceneLogRef,
      battleSceneSkills,
      battleAttackerStatusBadges,
      battleTargetStatusBadges,
      battleAttackerTimedEffects,
      battleTargetTimedEffects,
      battleAttackerStageText,
      battleTargetStageText,
      battleAbilityNow,
      battleSceneAvailablePets,
      isBattleAnimSide,
      battleSkillEffectStyle,
      canCastBattleSkill,
      castBattleSkill,
      switchBattlePet,
      openSwitchPanel,
      openBattleItemPanel,
      openBattleSkillPanel,
      onBattleSkillTouchStart,
      onBattleSkillTouchEnd,
      closeSwitchPanel,
      closeBattleScene,
      closeBattleResult,
      closeEvolutionModal,
      showGuardianPanel,
      showTargetPanel,
      showGuardianChallengePanel,
      guardianDexEntries,
      selectedGuardianEntry,
      selectedGuardianChallengeText,
      canChallengeFromDex,
      canStartChallengeByDex,
      selectedDexChallengeLocked,
      openGuardianPanel,
      closeGuardianPanel,
      openTargetPanel,
      closeTargetPanel,
      selectDexAndOpenTarget,
      openGuardianChallengePanel,
      closeGuardianChallengePanel,
      startGuardianChallenge,
      confirmGuardianChallenge,
      selectDex,
      selectPet,
      toggleDexPanel,
      openDexPanel,
      closeDexPanel,
      openWarehousePanel,
      closeWarehousePanel,
      toggleWarehousePetActions,
      isWarehousePetExpanded,
      closeWarehouseActionModal,
      addToBagFromWarehouse,
      openShopPanel,
      closeShopPanel,
      buyShopItem,
      useShopItem,
      setChallengeFormIndex,
      openPetDetailModal,
      openSelectedDexDetail,
      openSelectedGuardianDetail,
      closePetDetailModal,
      openElementPanel,
      closeElementPanel,
      toggleBagByPet,
      addToBag,
      replaceBagSlot,
      cancelReplaceBag,
      removeFromBag,
      moveBagLeft,
      moveBagRight,
      setAsFirstPet,
      useAsAttacker,
      inspectSkill,
      setInfoTab,
      setTalentValue,
      setStudyValue,
      toggleEquipSkill,
      startDirectReplaceSkill,
      confirmDirectReplaceSkill,
      confirmReplaceSkill,
      cancelReplaceSkill,
      startChallenge,
      hatchEgg,
      resetProgress,
      withFallback
    };
  }
}).mount("#app");

