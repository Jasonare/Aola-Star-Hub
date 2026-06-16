const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const MAX_SKILL_ID = 24000;
const SKILL_JSON = path.join(ROOT, "aola_pet_skill_extract_skills.json");
const APP_JS = path.join(ROOT, "aola-star-app.js");
const OUT_JS = path.join(ROOT, "aola-skill-effects-hardcoded.js");

const normalize = (s) => String(s || "").replace(/[\u200b\u00a0]/g, "").trim();
const allStageKeys = ["atk", "def", "spAtk", "spDef", "speed", "accuracy", "evasion", "critStage"];
const cnNumToInt = (text, fallback = 1) => {
  const t = normalize(text);
  if (!t) return fallback;
  const n = Number(t);
  if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  const map = { "零": 0, "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6 };
  return map[t] !== undefined ? map[t] : fallback;
};

const normalizeVagueChanceText = (text) => normalize(text)
  .replace(/较高(?:概率|几率|机率)/g, "70%概率")
  .replace(/一定(?:概率|几率|机率)/g, "30%概率");

const vagueChanceOf = (text) => {
  const t = normalize(text);
  if (/较高(?:概率|几率|机率)/.test(t)) return 0.7;
  if (/一定(?:概率|几率|机率)/.test(t)) return 0.3;
  return null;
};

const chanceNear = (text, idx, fallback = 1) => {
  const t = normalizeVagueChanceText(text).replace(/％/g, "%");
  const start = Math.max(0, Number(idx) - 28);
  const seg = t.slice(start, Math.min(t.length, Number(idx) + 32));
  if (/极大(?:概率|几率|机率)/.test(seg)) return 0.9;
  if (/较高(?:概率|几率|机率)/.test(seg)) return 0.7;
  if (/一定(?:概率|几率|机率)|有概率/.test(seg)) return 0.3;
  const m = seg.match(/(\d+(?:\.\d+)?)\s*%\s*(?:概率|几率|机率)?|(?:概率|几率|机率)\s*(\d+(?:\.\d+)?)\s*%/);
  if (!m) return fallback;
  const n = Number(m[1] || m[2]);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n / 100)) : fallback;
};

const stageKeysFromText = (text) => {
  const t = normalize(text);
  if (!t) return [];
  const hasSpecific = /双攻|双防|攻防|攻速|攻击|普攻|物攻|魔攻|特攻|防御|特防|速度|命中|闪避|回避|暴击|会心/.test(t);
  if (/所有|全属性|全能力|属性能力|能力等级|属性等级|增益属性|增益能力/.test(t) && !hasSpecific) return allStageKeys.slice();
  const keys = [];
  if (/双攻|攻击和特攻|普攻和特攻|物攻和特攻/.test(t)) keys.push("atk", "spAtk");
  if (/双防|防御和特防/.test(t)) keys.push("def", "spDef");
  if (/攻击|普攻|物攻/.test(t)) keys.push("atk");
  if (/特攻|魔攻/.test(t)) keys.push("spAtk");
  if (/防御/.test(t)) keys.push("def");
  if (/特防/.test(t)) keys.push("spDef");
  if (/速度/.test(t)) keys.push("speed");
  if (/命中/.test(t)) keys.push("accuracy");
  if (/闪避|回避/.test(t)) keys.push("evasion");
  if (/暴击|会心/.test(t)) keys.push("critStage");
  return Array.from(new Set(keys));
};

const createParser = () => {
  const appSource = fs.readFileSync(APP_JS, "utf8");
  const context = {
    console,
    setTimeout: () => 0,
    clearTimeout: () => {},
    window: {
      Vue: {
        createApp: () => ({ mount: () => null }),
        ref: (value) => ({ value }),
        computed: (fn) => ({ get value() { return fn(); } }),
        watch: () => null,
        onMounted: () => null,
        onBeforeUnmount: () => null,
        nextTick: (fn) => Promise.resolve().then(fn || (() => null))
      }
    },
    document: {
      getElementById: () => ({ innerHTML: "", textContent: "", appendChild: () => null }),
      createElement: () => ({ style: {}, setAttribute: () => null, appendChild: () => null }),
      body: { children: [], appendChild: () => null }
    }
  };
  context.window.window = context.window;
  context.window.document = context.document;
  vm.createContext(context);
  vm.runInContext(appSource, context, { filename: APP_JS });
  const parser = context.window.AOLA_PARSE_SKILL_EFFECTS_FROM_DESC;
  if (typeof parser !== "function") throw new Error("AOLA_PARSE_SKILL_EFFECTS_FROM_DESC was not exported.");
  return parser;
};

const addStageUtilityEffects = (effects, rawDesc) => {
  const desc = normalizeVagueChanceText(rawDesc).replace(/<br\s*\/?>/gi, "，").replace(/％/g, "%");
  if (!desc) return;
  const add = (effect) => effects.push(effect);

  const copyRules = [
    /(?:复制|夺取|偷取)[^。；，\n]{0,24}(?:对方|对手|敌方|目标)[^。；，\n]{0,24}(?:提升|增益)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级|属性能力|能力)/g,
    /(?:对方|对手|敌方|目标)[^。；，\n]{0,20}(?:提升|增益)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级|属性能力|能力)[^。；，\n]{0,24}(?:复制|夺取|偷取)/g
  ];
  copyRules.forEach((rule) => {
    let m = null;
    while ((m = rule.exec(desc))) {
      add({ kind: "copyStage", target: "opponent", copyTo: "self", keys: allStageKeys.slice(), chance: chanceNear(desc, m.index, 1), requireHit: /命中/.test(m[0]) });
    }
  });

  const clearPositiveRules = [
    /(?:清除|消除|重置|恢复)[^。；，\n]{0,20}(?:对方|对手|敌方|目标)[^。；，\n]{0,24}(?:提升|增益)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级|属性能力|能力)/g,
    /(?:清除|消除|重置|恢复)[^。；，\n]{0,20}(?:对方|对手|敌方|目标)[^。；，\n]{0,24}(?:所有|全属性|全能力|属性能力|能力|属性)[^。；，\n]{0,12}(?:提升|增益)[^。；，\n]{0,10}(?:等级|效果)?/g,
    /(?:清除|消除|重置|恢复)[^。；，\n]{0,20}(?:对方|对手|敌方|目标)[^。；，\n]{0,12}(?:攻击和特攻|双攻|防御和特防|双防|攻击|特攻|防御|特防|速度|命中|闪避|回避|暴击|会心)[^。；，\n]{0,10}(?:提升|增益)[^。；，\n]{0,10}(?:等级|效果)?/g
  ];
  clearPositiveRules.forEach((rule) => {
    let m = null;
    while ((m = rule.exec(desc))) {
      const keys = stageKeysFromText(m[0]);
      add({ kind: "clearStage", target: "opponent", mode: "positive", keys: keys.length > 0 ? keys : allStageKeys.slice(), chance: chanceNear(desc, m.index, 1), requireHit: /命中/.test(m[0]) });
    }
  });

  const clearSelfNegativeRules = [
    /(?:清除|消除|恢复|回复)[^。；，\n]{0,20}(?:自身|自己|我方)[^。；，\n]{0,24}(?:被削弱|削弱|降低|减益)[^。；，\n]{0,18}(?:属性能力等级|属性等级|能力等级|属性能力|能力)/g,
    /(?:恢复|回复)[^。；，\n]{0,18}(?:自己|自身|我方)?[^。；，\n]{0,18}(?:被削弱|削弱|降低)[^。；，\n]{0,18}(?:能力等级|属性能力等级)/g
  ];
  clearSelfNegativeRules.forEach((rule) => {
    let m = null;
    while ((m = rule.exec(desc))) {
      const keys = stageKeysFromText(m[0]);
      add({ kind: "clearStage", target: "self", mode: "negative", keys: keys.length > 0 ? keys : allStageKeys.slice(), chance: chanceNear(desc, m.index, 1), requireHit: /命中/.test(m[0]) });
    }
  });

  if (/重置(?:双方|全场)[^。；，\n]{0,12}(?:属性|能力|属性能力).*等级|(?:双方|全场)[^。；，\n]{0,12}(?:属性|能力|属性能力).*等级[^。；，\n]{0,12}重置/.test(desc)) {
    add({ kind: "clearStage", target: "self", mode: "all", keys: allStageKeys.slice(), chance: 1 });
    add({ kind: "clearStage", target: "opponent", mode: "all", keys: allStageKeys.slice(), chance: 1 });
  } else {
    const resetOpp = desc.match(/重置[^。；，\n]{0,20}(?:对方|对手|敌方|目标)[^。；，\n]{0,18}(?:属性等级|能力等级|属性能力等级)/);
    if (resetOpp) add({ kind: "clearStage", target: "opponent", mode: "all", keys: allStageKeys.slice(), chance: chanceNear(desc, resetOpp.index, 1), requireHit: /命中/.test(resetOpp[0]) });
    const resetSelf = desc.match(/重置[^。；，\n]{0,20}(?:自身|自己|我方)[^。；，\n]{0,18}(?:属性等级|能力等级|属性能力等级)/);
    if (resetSelf) add({ kind: "clearStage", target: "self", mode: "all", keys: allStageKeys.slice(), chance: chanceNear(desc, resetSelf.index, 1), requireHit: /命中/.test(resetSelf[0]) });
  }
};

const addBattleUtilityEffects = (effects, row, rawDesc) => {
  const desc = normalizeVagueChanceText(rawDesc).replace(/<br\s*\/?>/gi, "，").replace(/％/g, "%");
  if (!desc) return;
  const add = (effect) => effects.push(effect);
  const skillId = Number(row && row.skill_id);
  const name = normalize((row && row.new_cn_name) || (row && row.cn_name));

  if (/本回合/.test(desc) && /自己[^。；\n]{0,24}被(?:对手|对方|敌方)[^。；\n]{0,16}打败/.test(desc) && /双方同归于尽/.test(desc)) {
    add({ kind: "destinyBond", target: "self", turns: 1 });
  }

  if (/交换[^。；，\n]{0,12}双方[^。；，\n]{0,18}(?:属性能力|属性|能力)[^。；，\n]{0,8}等级/.test(desc)) {
    add({ kind: "swapStage", target: "both", keys: allStageKeys.slice(), chance: 1 });
  }

  const ppRules = [
    { rule: /(?:扣除|减少|降低)(?:对方|对手|敌方|目标|对方单体)[^。；，\n]{0,12}(?:所有技能|所有|全部)?PP\s*(\d+)\s*点?/gi, target: "opponent", sign: -1 },
    { rule: /(?:增加|回复|恢复)(?:自己|自身|我方)[^。；，\n]{0,12}(?:所有技能|所有|全部)?PP\s*(\d+)\s*点?/gi, target: "self", sign: 1 },
    { rule: /(?:扣除|减少|降低)(?:对方|对手|敌方|目标|对方单体)[^。；，\n]{0,12}(?:所有技能|所有|全部)?pp\s*(\d+)\s*点?/gi, target: "opponent", sign: -1 },
    { rule: /(?:增加|回复|恢复)(?:自己|自身|我方)[^。；，\n]{0,12}(?:所有技能|所有|全部)?pp\s*(\d+)\s*点?/gi, target: "self", sign: 1 }
  ];
  ppRules.forEach(({ rule, target, sign }) => {
    let m = null;
    while ((m = rule.exec(desc))) {
      const amount = Math.max(1, Math.floor(Number(m[1]) || 0)) * sign;
      add({ kind: "ppChange", target, amount, chance: chanceNear(desc, m.index, 1), requireHit: /命中/.test(m[0]) });
    }
  });

  const halfHp = desc.match(/(?:扣除|减少|降低)(?:对方|对手|敌方|目标|对方单体)[^。；，\n]{0,10}(?:一半|50%)的?体力值/);
  if (halfHp) {
    add({ kind: "damageByMaxHpRatio", target: "opponent", ratio: 0.5, chance: chanceNear(desc, halfHp.index, 1), requireHit: /命中/.test(halfHp[0]) });
  }
  const maxHpDamage = /(?:额外)?(?:扣除|减少|降低)(?:对方|对手|敌方|目标|对方单体)?[^。；，\n]{0,12}(\d+(?:\.\d+)?)\s*%最大体力值/g;
  let hm = null;
  while ((hm = maxHpDamage.exec(desc))) {
    const ratio = Math.max(0.01, Math.min(1, Number(hm[1]) / 100));
    add({ kind: "damageByMaxHpRatio", target: "opponent", ratio, chance: chanceNear(desc, hm.index, 1), requireHit: /命中/.test(hm[0]) });
  }

  if (/本回合[^。；，\n]{0,12}无视(?:对手|对方|敌方)[^。；，\n]{0,8}攻击/.test(desc)) {
    add({ kind: "attackImmunity", target: "self", turns: 1, chance: 1, attackKind: "all" });
  }
  const endHeal = desc.match(/回合结束时[^。；，\n]{0,12}(?:为自己|自己|自身)[^。；，\n]{0,8}回复\s*(\d+)\s*体力值/);
  if (endHeal) {
    add({ kind: "endTurnHealFlat", target: "self", turns: 1, amount: Math.max(1, Math.floor(Number(endHeal[1]) || 0)) });
  }

  if (skillId === 11208 || name === "千杀水翔") {
    add({ kind: "fixedPowerOverride", target: "opponent", power: 350 });
    add({ kind: "selfSamePower", target: "self" });
  }
};

const addMultiHitEffects = (effects, rawDesc) => {
  const desc = normalizeVagueChanceText(rawDesc).replace(/<br\s*\/?>/gi, "，").replace(/％/g, "%");
  if (!desc) return;
  const add = (min, max, sourceText = "") => {
    const a = Math.max(1, Math.floor(Number(min) || 1));
    const b = Math.max(a, Math.floor(Number(max) || a));
    const effect = { kind: "multiHit", target: "opponent", min: a, max: b };
    const powerText = `${sourceText}，${desc}`;
    if (/威力(?:加倍|翻倍)|威力[^。；，\n]{0,8}递增|每(?:次|回合)威力[^。；，\n]{0,8}(?:加倍|翻倍)/.test(powerText)) {
      effect.powerMultiplier = 2;
    }
    if (/元素庇护/.test(desc) && /威力(?:再)?加倍/.test(desc)) {
      effect.elementShelterMultiplier = 2;
    }
    addEffectOnce(effect);
  };
  const addEffectOnce = (effect) => {
    const exists = effects.some((e) => normalize(e && e.kind) === "multiHit"
      && Number(e && e.min) === Number(effect.min)
      && Number(e && e.max) === Number(effect.max)
      && Number(e && e.powerMultiplier || 1) === Number(effect.powerMultiplier || 1)
      && Number(e && e.elementShelterMultiplier || 1) === Number(effect.elementShelterMultiplier || 1));
    if (!exists) effects.push(effect);
  };

  const rangeRules = [
    /(?:一|1)回合(?:内)?\s*([0-9]+)\s*[~～-]\s*([0-9]+)\s*次连续攻击/g,
    /(?:一|1)回合(?:内)?[^。；，\n]{0,18}(?:连续)?(?:攻击|打击|爆发)[^。；，\n]{0,18}([0-9]+)\s*[~～-]\s*([0-9]+)\s*次/g,
    /(?:攻击|打击|爆发)[^。；，\n]{0,18}([0-9]+)\s*[~～-]\s*([0-9]+)\s*次/g
  ];
  rangeRules.forEach((rule) => {
    let m = null;
    while ((m = rule.exec(desc))) add(m[1], m[2], m[0]);
  });

  const fixedRules = [
    /(?:连续)?(?:攻击|打击)\s*([0-9]+)\s*次/g,
    /(?:一|1)回合(?:内)?[^。；，\n]{0,18}(?:连续)?(?:攻击|打击)[^。；，\n]{0,18}([0-9]+)\s*次/g,
    /(?:攻击|打击)目标\s*([0-9]+)\s*次/g,
    /(?:攻击|打击)(?:对方|目标|对方单体)[^。；，\n]{0,12}([0-9]+)\s*次/g
  ];
  fixedRules.forEach((rule) => {
    let m = null;
    while ((m = rule.exec(desc))) add(m[1], m[1], m[0]);
  });

  const consecutiveTurn = desc.match(/(?:连续攻击(?:对方|目标|对方单体)?\s*([0-9一二三四五六])\s*回合|连续\s*([0-9一二三四五六])\s*回合攻击(?:对方|目标|对方单体)?)/);
  if (consecutiveTurn) {
    const count = cnNumToInt(consecutiveTurn[1] || consecutiveTurn[2], 1);
    add(count, count, consecutiveTurn[0]);
  }
};

const shouldNormalizeChance = (effect) => {
  const kind = normalize(effect && effect.kind);
  if (effect && effect.forceChance) return false;
  return ["status", "stage", "critStage", "statusCure", "attackImmunity", "onDamagedStage", "onDamagedAllStatDown", "clearStage", "copyStage", "ppChange", "damageByMaxHpRatio", "swapStage", "swapStagePairs", "bonusFixedDamage", "damageReflectFlat", "transferStage", "transferStatus", "instantKo", "statusCountBonusDamage", "fixedDamageBySelfLevel"].includes(kind);
};

const normalizeEffect = (effect, vagueChance) => {
  const out = {};
  Object.keys(effect || {}).sort().forEach((key) => {
    const value = effect[key];
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "number") {
      out[key] = Number(value.toFixed(6));
      return;
    }
    out[key] = Array.isArray(value) ? value.slice() : value;
  });
  if (vagueChance !== null && shouldNormalizeChance(out) && (!Number.isFinite(Number(out.chance)) || Number(out.chance) >= 1)) {
    out.chance = vagueChance;
  }
  return out;
};

const dedupeEffects = (effects) => {
  const seen = new Set();
  return effects.filter((effect) => {
    if ((normalize(effect && effect.kind) === "stage" || normalize(effect && effect.kind) === "clearStage")
      && (!Array.isArray(effect && effect.keys) || effect.keys.length <= 0)) {
      return false;
    }
    const key = JSON.stringify(effect);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const replaceEffectsForKnownSkill = (skillId, name, effects) => {
  if (skillId === 22034) {
    return [
      { kind: "priority", target: "self", value: -1 },
      { kind: "unharmedPowerMultiplier", target: "self", factor: 2 },
      { kind: "stage", target: "self", keys: allStageKeys.slice(), delta: 1, chance: 0.25, requireHit: false }
    ];
  }
  if (skillId === 21038) {
    return [
      { kind: "stage", target: "opponent", keys: ["def", "evasion", "speed"], delta: -1, chance: 1, requireHit: false },
      { kind: "stage", target: "opponent", keys: ["def", "evasion", "speed"], delta: -1, chance: 0.3, requireHit: false },
      { kind: "status", target: "opponent", status: "fear", turns: 1, chance: 0.3 }
    ];
  }
  if (skillId === 17290) {
    return [
      { kind: "status", target: "opponent", status: "fear", turns: 1, chance: 0.25, requireHit: true },
      { kind: "onCritLifesteal", target: "self", ratio: 0.5, requireHit: true },
      { kind: "onCritStage", target: "opponent", keys: allStageKeys.slice(), delta: -1, chance: 1, requireHit: true }
    ];
  }
  if (skillId === 3249) {
    return [{ kind: "endTurnDamageByMaxHpChance", target: "opponent", ratio: 0.15, chance: 0.5, turns: 3 }];
  }
  if (skillId === 14241) {
    return [
      { kind: "bonusFixedDamage", target: "opponent", amount: 200, chance: 1, forceChance: true, requireHit: false, condition: { dexIds: [215], baseDexIds: [215], nameIncludes: ["青龙灵兽", "青龙守护"], multiplier: 2 } },
      { kind: "status", target: "opponent", status: "poison", turns: 5, chance: 0.3, condition: { dexIds: [215], baseDexIds: [215], nameIncludes: ["青龙灵兽", "青龙守护"], multiplier: 2 } },
      { kind: "status", target: "opponent", status: "freeze", turns: 3, chance: 0.3, condition: { dexIds: [215], baseDexIds: [215], nameIncludes: ["青龙灵兽", "青龙守护"], multiplier: 2 } },
      { kind: "status", target: "opponent", status: "burn", turns: 5, chance: 0.3, condition: { dexIds: [215], baseDexIds: [215], nameIncludes: ["青龙灵兽", "青龙守护"], multiplier: 2 } }
    ];
  }
  if (skillId === 9281) {
    return [
      { kind: "stageGuard", target: "opponent", mode: "buff", turns: 2, requireHit: true },
      { kind: "stageGuard", target: "self", mode: "debuff", turns: 2, requireHit: false }
    ];
  }
  if (skillId === 21039) {
    return [
      { kind: "multiHit", target: "opponent", min: 2, max: 2 },
      { kind: "onHitRandomStage", target: "self", keys: ["atk", "accuracy", "critStage", "speed"], pick: 2, delta: 1, chance: 1 }
    ];
  }
  if (skillId === 17289) {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "clearStage", target: "self", mode: "all", keys: allStageKeys.slice(), chance: 1 },
      { kind: "clearStage", target: "opponent", mode: "all", keys: allStageKeys.slice(), chance: 1 },
      { kind: "status", target: "self", status: "bind", turns: 3, chance: 1 },
      { kind: "status", target: "opponent", status: "bind", turns: 3, chance: 1 },
      { kind: "onDamagedStage", target: "self", applyTo: "self", keys: ["speed", "evasion"], delta: 1, turns: 3, chance: 1, trigger: "damaged" }
    ];
  }
  if (skillId === 2317) {
    return [{ kind: "speedConditionalStage", target: "opponent", keys: ["def"], delta: -1, fastChance: 1, slowChance: 0.35, requireHit: true }];
  }
  if (skillId === 2318) {
    return [
      { kind: "multiHit", target: "opponent", min: 4, max: 7 },
      { kind: "onCritHealMaxHp", target: "self", ratio: 0.1 }
    ];
  }
  if (skillId === 20069 || name === "傲世龙啸") {
    return [
      { kind: "stage", target: "self", keys: allStageKeys.slice(), delta: 1, chance: 1, requireHit: false },
      { kind: "endTurnStageChance", target: "self", turns: 1, chance: 0.3, changes: [
        { keys: ["atk"], delta: 1 },
        { keys: ["speed"], delta: -1 }
      ] }
    ];
  }
  if (skillId === 3322 || name === "极空之舞") {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "evasion"], delta: 2, chance: 1, requireHit: false },
      { kind: "onDamagedStage", target: "self", applyTo: "self", keys: ["critStage", "speed"], delta: 1, turns: 3, chance: 1, trigger: "attacked" }
    ];
  }
  if (skillId === 15315 || name === "冰晶涅槃") {
    return [
      { kind: "stage", target: "self", keys: ["def", "spDef"], delta: 1, chance: 1, requireHit: false },
      { kind: "endTurnHealFlatRange", target: "self", min: 80, max: 200, turns: 3 }
    ];
  }
  if (skillId === 3323 || name === "凤凰双重奏") {
    return [
      { kind: "multiHit", target: "opponent", min: 2, max: 2 },
      { kind: "onCritHealMaxHp", target: "self", ratio: 1 / 3 }
    ];
  }
  if (skillId === 15316 || name === "冰魂轰击") {
    return [
      { kind: "onCritStatus", target: "opponent", status: "freeze", turns: 3, requireHit: true },
      { kind: "stage", target: "self", keys: ["critStage"], delta: 1, chance: 1, requireHit: true }
    ];
  }
  if (skillId === 20070 || name === "龙皇制裁") {
    return [
      { kind: "multiHit", target: "opponent", min: 5, max: 10 },
      { kind: "perHitStage", target: "opponent", keys: allStageKeys.slice(), delta: -1, chance: 0.06 },
      { kind: "perHitStage", target: "self", keys: ["critStage"], delta: 1, chance: 0.06 }
    ];
  }
  if (skillId === 9280 || name === "银龙领域") {
    return [
      { kind: "timedRandomStage", target: "self", keys: ["accuracy", "critStage", "speed"], pick: 2, delta: 1, turns: 3 },
      { kind: "damageReduction", target: "self", ratio: 0.3, turns: 3 }
    ];
  }
  if (skillId === 23013 || name === "万世主宰") {
    return [
      { kind: "priority", target: "self", value: 2 },
      { kind: "heal", target: "self", ratio: 0.25 },
      { kind: "stageGuard", target: "self", mode: "debuff", turns: 4, requireHit: false }
    ];
  }
  if (skillId === 23014 || name === "帝皇能量炮") {
    return [
      { kind: "stage", target: "self", keys: ["atk", "speed"], delta: 1, chance: 0.3, requireHit: true },
      { kind: "onCritLifesteal", target: "self", ratio: 0.5, requireHit: true }
    ];
  }
  if (skillId === 2228 || name === "斗气护甲") {
    return [{ kind: "damageReduction", target: "self", ratio: 0.5, turns: 3 }];
  }
  if (skillId === 1285 || name === "星诺力量") {
    return [
      { kind: "priority", target: "self", value: 1 },
      { kind: "damageReduction", target: "self", ratio: 0.3, turns: 3 },
      { kind: "endTurnHealFlat", target: "self", amount: 150, turns: 3 }
    ];
  }
  if (skillId === 17238) {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "speed", "accuracy"], delta: 1, chance: 1, requireHit: false },
      { kind: "damageReduction", target: "self", ratio: 0.25, turns: 10 }
    ];
  }
  if (skillId === 17234 || name === "魔神之域") {
    return [
      { kind: "stage", target: "self", keys: ["spAtk", "speed", "accuracy"], delta: 1, chance: 1, requireHit: false },
      { kind: "damageReduction", target: "self", ratio: 0.25, turns: 5 }
    ];
  }
  if (skillId === 16297 || name === "终焉之翼") {
    return [
      { kind: "multiHit", target: "opponent", min: 4, max: 8 },
      { kind: "status", target: "opponent", status: "bind", turns: 5, chance: 0.2, requireHit: true },
      { kind: "stage", target: "opponent", keys: allStageKeys.slice(), delta: -1, chance: 0.2, requireHit: true }
    ];
  }
  if (skillId === 3268 || name === "米果空气炮") {
    return [{ kind: "clearStage", target: "opponent", mode: "positive", keys: ["atk"], chance: 0.3, requireHit: true }];
  }
  return effects;
};

const normalizeSkipTarget = (effects, rawDesc) => {
  const desc = normalize(rawDesc);
  if (!/(使用后|自己|自身)[^。；，\n]{0,12}(?:停止行动|无法行动)/.test(desc)) return effects;
  return effects.map((effect) => {
    if (normalize(effect && effect.kind) !== "skip") return effect;
    return { ...effect, target: "self" };
  });
};

const directStageTargetFromText = (sideHint, op, sourceText) => {
  const hint = normalize(sideHint);
  const text = normalize(sourceText);
  if (/(?:全场|双方)/.test(hint) || /(?:全场|双方)/.test(text)) return "both";
  if (/(?:对方|对手|敌方|目标)/.test(hint)) return "opponent";
  if (/(?:自身|自己|我方)/.test(hint)) return "self";
  return /提升|提高|上升|增加|增强/.test(op) ? "self" : "opponent";
};

const shouldSkipDirectStage = (desc, idx) => {
  const start = Math.max(0, Number(idx) - 20);
  const ctx = desc.slice(start, Math.min(desc.length, Number(idx) + 8));
  return /(?:每回合|回合后|次回合|下回合|受到伤害|受击|被攻击|攻击时|命中时|若|如果)/.test(ctx);
};

const stageEffectSignature = (effect) => {
  const keys = Array.isArray(effect && effect.keys) ? effect.keys.slice().sort().join(",") : "";
  return `${Number(effect && effect.delta) || 0}|${keys}`;
};

const addDirectStageEffects = (effects, rawDesc) => {
  const desc = normalizeVagueChanceText(rawDesc).replace(/<br\s*\/?>/gi, "，").replace(/％/g, "%");
  if (!desc) return effects;
  const direct = [];
  const addDirect = (sourceText, index, op, sideHint, statText, lvText) => {
    if (shouldSkipDirectStage(desc, index)) return;
    const keys = stageKeysFromText(`${statText || ""}${sourceText || ""}`)
      .filter((key) => allStageKeys.includes(key));
    if (keys.length <= 0) return;
    const lv = cnNumToInt(lvText, 1);
    if (lv <= 0) return;
    const delta = /提升|提高|上升|增加|增强/.test(op) ? lv : -lv;
    direct.push({
      kind: "stage",
      target: directStageTargetFromText(sideHint, op, sourceText),
      keys: Array.from(new Set(keys)),
      delta,
      chance: chanceNear(desc, index, 1),
      requireHit: /命中/.test(sourceText)
    });
  };

  const rules = [
    {
      regex: /(提升|提高|上升|增加|增强|降低|下降|削弱|减少)(全场|双方|自身|自己|我方|敌方|对方|对手|目标)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?([^。；，\n]{0,24}?)(?:的)?(?:等级|能力等级|属性等级)?(?:各|均|都)?\s*(\d+|一|二|两|三|四|五|六)\s*级/g,
      pick: (m) => ({ op: m[1], sideHint: m[2], statText: m[3], lvText: m[4] })
    },
    {
      regex: /(?:令|使)(全场|双方|自身|自己|我方|敌方|对方|对手|目标)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?([^。；，\n]{0,24}?)(?:的)?(?:等级|能力等级|属性等级)?(?:各|均|都)?\s*(提升|提高|上升|增加|增强|降低|下降|削弱|减少)\s*(\d+|一|二|两|三|四|五|六)\s*级/g,
      pick: (m) => ({ sideHint: m[1], statText: m[2], op: m[3], lvText: m[4] })
    },
    {
      regex: /(全场|双方|自身|自己|我方|敌方|对方|对手|目标)?(?:的)?(?:单体|1体|一体|全体|1只|一只)?([^。；，\n]{0,24}?)(?:的)?(?:等级|能力等级|属性等级)(?:各|均|都)?\s*(提升|提高|上升|增加|增强|降低|下降|削弱|减少)\s*(\d+|一|二|两|三|四|五|六)\s*级/g,
      pick: (m) => ({ sideHint: m[1], statText: m[2], op: m[3], lvText: m[4] })
    }
  ];

  rules.forEach(({ regex, pick }) => {
    let match = null;
    while ((match = regex.exec(desc))) {
      const row = pick(match);
      addDirect(match[0], match.index || 0, row.op, row.sideHint, row.statText, row.lvText);
    }
  });

  if (direct.length <= 0) return effects;
  const bothStageSignatures = new Set(direct
    .filter((effect) => normalize(effect.target) === "both")
    .map(stageEffectSignature));
  const filtered = effects.filter((effect) => {
    if (normalize(effect && effect.kind) !== "stage") return true;
    if (normalize(effect && effect.target) === "both") return true;
    return !bothStageSignatures.has(stageEffectSignature(effect));
  });
  return filtered.concat(direct);
};

const parser = createParser();
const rows = JSON.parse(fs.readFileSync(SKILL_JSON, "utf8"));
if (!Array.isArray(rows)) throw new Error("aola_pet_skill_extract_skills.json must be an array.");

const byId = {};
const byName = {};
let parsedCount = 0;
let effectCount = 0;

rows.forEach((row) => {
  const skillId = Number(row && row.skill_id);
  if (!Number.isFinite(skillId) || skillId <= 0 || skillId > MAX_SKILL_ID) return;
  const name = normalize((row && row.new_cn_name) || (row && row.cn_name));
  const legacyName = normalize(row && row.cn_name);
  const rawDesc = normalize((row && row.client_desc) || (row && row.new_effect_desc) || (row && row.old_effect_desc));
  const desc = normalizeVagueChanceText(rawDesc);
  let effects = parser({ skillId, name, desc }).filter((effect) => effect && normalize(effect.kind));
  if (name === "火海焚烧" || legacyName === "火海焚烧") effects = [];
  if (/(?:扣除|减少|降低)(?:对方|对手|敌方|目标|对方单体)[^。；，\n]{0,10}(?:一半|50%)的?体力值/.test(rawDesc)) {
    effects = effects.filter((effect) => !(normalize(effect && effect.kind) === "recoilByMaxHp" && normalize(effect && effect.target) === "self"));
  }
  if (/回合结束时[^。；，\n]{0,12}(?:为自己|自己|自身)[^。；，\n]{0,8}回复\s*\d+\s*体力值/.test(rawDesc)) {
    effects = effects.filter((effect) => !(normalize(effect && effect.kind) === "healFlat" && normalize(effect && effect.target) === "self"));
  }
  effects = normalizeSkipTarget(effects, rawDesc);
  effects = addDirectStageEffects(effects, rawDesc);
  addStageUtilityEffects(effects, rawDesc);
  addBattleUtilityEffects(effects, row, rawDesc);
  addMultiHitEffects(effects, rawDesc);
  effects = replaceEffectsForKnownSkill(skillId, name, effects);
  const normalizedEffects = dedupeEffects(effects
    .map((effect) => normalizeEffect(effect, vagueChanceOf(rawDesc)))
    .filter((effect) => effect && normalize(effect.kind)));
  parsedCount += 1;
  byId[String(skillId)] = normalizedEffects;
  if (name && !byName[name]) byName[name] = normalizedEffects;
  effectCount += normalizedEffects.length;
});

const effectSkillCount = Object.values(byId).filter((effects) => Array.isArray(effects) && effects.length > 0).length;
const payload = {
  version: "generated_from_client_desc_v2",
  maxSkillId: MAX_SKILL_ID,
  generatedAt: new Date().toISOString(),
  source: "aola_pet_skill_extract_skills.json",
  parsedSkillCount: parsedCount,
  effectSkillCount,
  effectCount,
  byId,
  byName
};

fs.writeFileSync(
  OUT_JS,
  `window.AOLA_SKILL_EFFECTS_HARDCODED = ${JSON.stringify(payload)};\n`,
  "utf8"
);

console.log(`Generated ${path.basename(OUT_JS)}: ${effectSkillCount}/${parsedCount} skills, ${effectCount} effects, max skill_id ${MAX_SKILL_ID}.`);
