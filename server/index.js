const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = process.env.AOLA_DATA_DIR || path.join(__dirname, "data");
const SAVE_ROOT = path.join(DATA_DIR, "saves");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TEAMS_FILE = path.join(DATA_DIR, "teams.json");
const STATIC_RESOURCE_DIR = process.env.AOLA_STATIC_RESOURCE_DIR || "";
const STATIC_RESOURCE_PREFIXES = [
  "resource/BGM/",
  "resource/boss-level/",
  "resource/fight-ui/",
  "resource/hub 守护者联盟勋章/",
  "resource/pet-action/",
  "resource/pet-img/",
  "resource/pet-state/",
  "resource/skill-effect/",
  "resource/skill-effect-fullscreen/",
  "resource/scene/",
  "resource/shengyu/",
  "resource/time-tunnel-environments/",
  "resource/type/",
  "resource/type-transparent/",
  "resource/ui/",
  "vendor/",
  "resource/地台boss/",
  "resource/小图标/",
  "resource/提升/"
];
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const PORT = Number(process.env.PORT) || 3030;
const sessions = new Map();

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const readJsonFile = (file, fallback) => {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    try {
      const backup = `${file}.bak`;
      if (fs.existsSync(backup)) return JSON.parse(fs.readFileSync(backup, "utf8"));
    } catch {}
    return fallback;
  }
};

const writeJsonFile = (file, data) => {
  ensureDir(path.dirname(file));
  const text = JSON.stringify(data, null, 2);
  const tmpFile = `${file}.${process.pid}.${Date.now()}.tmp`;
  const backupFile = `${file}.bak`;
  fs.writeFileSync(tmpFile, text, "utf8");
  if (fs.existsSync(file)) {
    try { fs.copyFileSync(file, backupFile); } catch {}
  }
  fs.renameSync(tmpFile, file);
};

const toPosixPath = (value) => String(value || "").replace(/\\/g, "/");

const usersDb = () => {
  const raw = readJsonFile(USERS_FILE, { users: [] });
  return { users: Array.isArray(raw.users) ? raw.users : [] };
};

const saveUsersDb = (db) => writeJsonFile(USERS_FILE, db);

const safeUserName = (name) => String(name || "").trim();

const safeTeamText = (value, maxLen) => String(value || "").replace(/[\u200b\u00a0]/g, "").trim().slice(0, maxLen);

const createUserId = () => crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.pbkdf2Sync(String(password || ""), salt, 120000, 32, "sha256").toString("hex");
  return { salt, hash };
};

const verifyPassword = (password, user) => {
  if (!user || !user.salt || !user.passwordHash) return false;
  const { hash } = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
};

const userSaveDir = (userId) => path.join(SAVE_ROOT, String(userId));
const userSaveFile = (userId) => path.join(userSaveDir(userId), "save.json");
const TEST_USER_ID = "test-account-all-pets-1-1960";
const LEGACY_TEST_USER_IDS = ["test-account-all-pets-1-1928", "test-account-all-pets-1-796"];
const TEST_USERNAME = "test";
const TEST_PASSWORD = "test123456";
const LEADERBOARD_MAX_OPEN_DEX_ID = 2072;
const LEADERBOARD_MAX_HCOINS = 100000000;
const LEADERBOARD_METRICS = new Set(["battlePower", "activatedDexCount", "hCoins", "timeTunnelMaxClearedFloor", "equipmentDungeonBestScore"]);
const LEADERBOARD_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const TEAM_LEVEL_RULES = [
  { level: 1, memberLimit: 20, nextHonor: 15000 },
  { level: 2, memberLimit: 25, nextHonor: 30000 },
  { level: 3, memberLimit: 30, nextHonor: 60000 },
  { level: 4, memberLimit: 35, nextHonor: 120000 },
  { level: 5, memberLimit: 40, nextHonor: 300000 },
  { level: 6, memberLimit: 45, nextHonor: 800000 },
  { level: 7, memberLimit: 50, nextHonor: 0 }
];
const TEAM_ROLE_LABELS = {
  leader: "队长",
  vice: "副队长",
  elder: "元老",
  member: "成员"
};
const TEAM_MAX_VICE_CAPTAINS = 2;
const TEAM_MAX_ELDERS = 5;
const TEAM_SHOP_ITEMS = [
  { id: "double_exp_device", name: "双倍经验器", minLevel: 1, cost: 50, limit: 0 },
  { id: "auto_battle_device", name: "自动战斗仪", minLevel: 1, cost: 50, limit: 0 },
  { id: "divine_pet_key_10", name: "10个神宠之匙", minLevel: 1, cost: 200, limit: 5 },
  { id: "equipment_crystal_10", name: "10个秘境晶石", minLevel: 1, cost: 200, limit: 5 },
  { id: "double_hcoin_device", name: "双倍H币器", minLevel: 2, cost: 300, limit: 0 },
  { id: "talent_grade_wanzhong_fruit", name: "万众瞩目果实", minLevel: 2, cost: 300, limit: 15 },
  { id: "divine_pet_key_20", name: "20个神宠之匙", minLevel: 2, cost: 400, limit: 3 },
  { id: "equipment_crystal_20", name: "20个秘境晶石", minLevel: 2, cost: 400, limit: 3 },
  { id: "divine_pet_key_30", name: "30个神宠之匙", minLevel: 3, cost: 570, limit: 2 },
  { id: "equipment_crystal_30", name: "30个秘境晶石", minLevel: 3, cost: 570, limit: 2 },
  { id: "rare_battle_blade", name: "稀有战刃", minLevel: 3, cost: 700, limit: 2 },
  { id: "rare_shield", name: "稀有护盾", minLevel: 3, cost: 700, limit: 2 },
  { id: "rare_charm", name: "稀有护符", minLevel: 3, cost: 700, limit: 2 },
  { id: "rare_boots", name: "稀有护靴", minLevel: 3, cost: 700, limit: 2 },
  { id: "divine_pet_key_40", name: "40个神宠之匙", minLevel: 4, cost: 640, limit: 2 },
  { id: "equipment_crystal_40", name: "40个秘境晶石", minLevel: 4, cost: 640, limit: 2 },
  { id: "talent_grade_wangzhe_fruit", name: "王者无敌果实", minLevel: 4, cost: 500, limit: 10 },
  { id: "hcoins_10000", name: "10000H币", minLevel: 4, cost: 200, limit: 0 },
  { id: "divine_pet_key_50", name: "50个神宠之匙", minLevel: 5, cost: 750, limit: 2 },
  { id: "equipment_crystal_50", name: "50个秘境晶石", minLevel: 5, cost: 750, limit: 2 },
  { id: "precious_battle_blade", name: "珍奇战刃", minLevel: 5, cost: 1080, limit: 2 },
  { id: "precious_shield", name: "珍奇护盾", minLevel: 5, cost: 1080, limit: 2 },
  { id: "precious_charm", name: "珍奇护符", minLevel: 5, cost: 1080, limit: 2 },
  { id: "precious_boots", name: "珍奇护靴", minLevel: 5, cost: 1080, limit: 2 },
  { id: "divine_pet_key_60", name: "60个神宠之匙", minLevel: 6, cost: 840, limit: 2 },
  { id: "equipment_crystal_60", name: "60个秘境晶石", minLevel: 6, cost: 840, limit: 2 },
  { id: "talent_grade_tianxia_fruit", name: "天下无双果实", minLevel: 6, cost: 660, limit: 8 },
  { id: "trait_choice_bundle", name: "特性自选礼包", minLevel: 6, cost: 1000, limit: 6 },
  { id: "divine_pet_key_100", name: "100个神宠之匙", minLevel: 7, cost: 1200, limit: 2 },
  { id: "equipment_crystal_100", name: "100个秘境晶石", minLevel: 7, cost: 1200, limit: 2 },
  { id: "legend_battle_blade", name: "传说战刃", minLevel: 7, cost: 1400, limit: 2 },
  { id: "legend_shield", name: "传说护盾", minLevel: 7, cost: 1400, limit: 2 },
  { id: "legend_charm", name: "传说护符", minLevel: 7, cost: 1400, limit: 2 },
  { id: "legend_boots", name: "传说护靴", minLevel: 7, cost: 1400, limit: 2 }
];
const TEAM_SHOP_ITEM_BY_ID = new Map(TEAM_SHOP_ITEMS.map((item) => [item.id, item]));
const TEST_MAX_DEX_ID = 1960;
const TEST_DEFAULT_WEEKLY_REWARD_STATE_VERSION = "wunian_2020_exchange_reset_v2";
const TEST_DEFAULT_WEEKLY_MEDAL_ITEM_ID = "weekly_boss_medal_wunian_2020";
const HATCH_MS = 5 * 60 * 1000;
const SHOP_REDEEM_CODE_ALHUB666 = "ALHUB666";
const SHOP_REDEEM_CODE_ALHUB666_DEX_ID = 1782;
const SHOP_REDEEM_CODE_ALHUB666_PET_NAME = "迷雾龙";
const SHOP_REDEEM_CODE_ALHUB666_SOURCE = "redeem:ALHUB666";
const SHOP_REDEEM_CODE_ALHUB666_BACKFILL_MIGRATION_KEY = "redeem_alhub666_mist_dragon_backfill_v1";

const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  saveDir: `server/data/saves/${user.id}`,
  createdAt: user.createdAt || null
});

const cleanText = (s) => String(s || "").replace(/[\u200b\u00a0]/g, "").trim();
const createSaveUid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const isAlhub666CurrentRewardRow = (row) => (
  Number(row && row.dexId) === SHOP_REDEEM_CODE_ALHUB666_DEX_ID
  && cleanText(row && row.source) === SHOP_REDEEM_CODE_ALHUB666_SOURCE
);

const authHeaders = (token) => ({
  "Set-Cookie": `aola_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/`,
  "X-Aola-Session": token
});

const createSession = (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
};

const loadWindowDataScript = (fileName, globalName) => {
  const text = fs.readFileSync(path.join(ROOT_DIR, fileName), "utf8");
  const sandbox = { window: {} };
  const wrapped = new Function("window", `${text}\nreturn window[${JSON.stringify(globalName)}];`);
  return wrapped(sandbox.window);
};

const readAppSourceText = (() => {
  let cached = null;
  return () => {
    if (cached == null) cached = fs.readFileSync(path.join(ROOT_DIR, "aola-star-app.js"), "utf8");
    return cached;
  };
})();

const extractSourceBlock = (source, startToken, endToken) => {
  const start = source.indexOf(startToken);
  if (start < 0) return "";
  const end = source.indexOf(endToken, start);
  return end < 0 ? source.slice(start) : source.slice(start, end);
};

const extractQuotedStrings = (text) => Array.from(text.matchAll(/"([^"]+)"/g)).map((match) => match[1]);

const extractConstArrayStrings = (source, name) => {
  const match = source.match(new RegExp(`const ${name} = \\[(.*?)\\];`, "s"));
  return match ? extractQuotedStrings(match[1]) : [];
};

const loadTestProgressionMeta = (() => {
  let cached = null;
  return () => {
    if (cached) return cached;
    const source = readAppSourceText();
    const challengeBlock = extractSourceBlock(source, "const BASE_GUARDIAN_NAMES", "const QIXING_SEAL_ITEM_ID");
    const guardianNames = Array.from(new Set(
      extractConstArrayStrings(challengeBlock, "BASE_GUARDIAN_NAMES")
        .concat(extractConstArrayStrings(challengeBlock, "EXTRA_GUARDIAN_NAMES"))
    ));
    const bossNames = Array.from(new Set(
      Array.from(challengeBlock.matchAll(/bossNames:\s*\[(.*?)\]/gs)).flatMap((match) => extractQuotedStrings(match[1]))
    ));
    const bossRewardBlock = extractSourceBlock(source, "const BOSS_DIFFICULTY_FIRST_WIN_REWARDS = {", "const SUPER_DICE_BOMB_SKILL_STONE_ITEM_ID");
    const bossDifficulties = Array.from(new Set(
      Array.from(bossRewardBlock.matchAll(/^\s*([a-zA-Z0-9_]+):\s*\{/gm)).map((match) => match[1])
    ));
    const weeklyConfigBlock = extractSourceBlock(source, "const WEEKLY_BOSS_CONFIG = {", "const WEEKLY_BOSS_MEDAL_ITEM_ID");
    const weeklyConfigs = [];
    Array.from(weeklyConfigBlock.matchAll(/key:\s*"([^"]+)",[\s\S]*?name:\s*"([^"]+)",[\s\S]*?honorBadgeId:\s*"([^"]+)",[\s\S]*?honorBadgeName:\s*"([^"]+)"/g))
      .forEach((match) => {
        const row = { key: match[1], name: match[2], badgeId: match[3], badgeName: match[4] };
        if (!weeklyConfigs.some((item) => item.key === row.key)) weeklyConfigs.push(row);
      });
    const rewardStateVersionMatch = source.match(/const WEEKLY_BOSS_REWARD_STATE_VERSION = "([^"]+)"/);
    const weeklyMedalItemIdMatch = source.match(/const WEEKLY_BOSS_MEDAL_ITEM_ID = "([^"]+)"/);
    cached = {
      guardianNames,
      bossNames,
      bossDifficulties: bossDifficulties.length > 0 ? bossDifficulties : ["normal", "hard", "nightmare"],
      weeklyConfigs,
      currentWeeklyBossKey: weeklyConfigs.some((item) => item.key === "wunian_2020") ? "wunian_2020" : ((weeklyConfigs[0] && weeklyConfigs[0].key) || "wunian_2020"),
      weeklyRewardStateVersion: rewardStateVersionMatch ? rewardStateVersionMatch[1] : TEST_DEFAULT_WEEKLY_REWARD_STATE_VERSION,
      weeklyMedalItemId: weeklyMedalItemIdMatch ? weeklyMedalItemIdMatch[1] : TEST_DEFAULT_WEEKLY_MEDAL_ITEM_ID
    };
    return cached;
  };
})();

const buildFinalFormDexRows = (dexRows, evolutionData) => {
  const rows = Array.isArray(dexRows) ? dexRows : [];
  const rowByDexId = new Map(rows.map((row) => [Number(row && row.dexId) || 0, row]));
  const finalByDexId = new Map();
  (Array.isArray(evolutionData && evolutionData.chains) ? evolutionData.chains : []).forEach((chain) => {
    const members = (Array.isArray(chain && chain.members) ? chain.members : [])
      .map((member) => Number(member && member.race_id) || 0)
      .filter((dexId) => dexId >= 1 && dexId <= TEST_MAX_DEX_ID && rowByDexId.has(dexId));
    if (members.length <= 0) return;
    const rootDexId = members[0];
    const finalDexId = members[members.length - 1];
    members.forEach((dexId) => {
      finalByDexId.set(dexId, {
        rootDexId,
        finalDexId,
        stageIndex: members.length - 1
      });
    });
  });
  const seen = new Set();
  const resolveFinalInfo = (info) => {
    let current = info;
    const visited = new Set();
    while (current && current.finalDexId && !visited.has(current.finalDexId)) {
      visited.add(current.finalDexId);
      const next = finalByDexId.get(current.finalDexId);
      if (!next || next.finalDexId === current.finalDexId) break;
      current = next;
    }
    return current || info;
  };
  return rows
    .filter((row) => Number(row && row.dexId) >= 1 && Number(row && row.dexId) <= TEST_MAX_DEX_ID)
    .map((row) => finalByDexId.get(Number(row.dexId)) || {
      rootDexId: Number(row.dexId),
      finalDexId: Number(row.dexId),
      stageIndex: 0
    })
    .map(resolveFinalInfo)
    .filter((info) => {
      if (!info.finalDexId || seen.has(info.finalDexId)) return false;
      seen.add(info.finalDexId);
      return rowByDexId.has(info.finalDexId);
    })
    .map((info) => ({
      row: rowByDexId.get(info.finalDexId),
      rootDexId: info.rootDexId,
      stageIndex: info.stageIndex
    }));
};

const createTestSaveState = () => {
  const dexRows = loadWindowDataScript("aola-dex-1-100.js", "AOLA_DEX_1_100");
  const speciesByDex = loadWindowDataScript("aola-species-data.js", "AOLA_SPECIES_DATA_BY_DEX") || {};
  const evolutionData = loadWindowDataScript("aola-evolution-chains.js", "AOLA_EVOLUTION_CHAINS") || {};
  const zeroStats = () => ({ hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 });
  const maxTalent = () => ({ hp: 62, atk: 62, def: 62, spAtk: 62, spDef: 62, speed: 62 });
  const clean = (s) => String(s || "").replace(/[\u200b\u00a0]/g, "").trim();
  const now = Date.now();
  const openedDexRows = (Array.isArray(dexRows) ? dexRows : [])
    .filter((d) => Number(d && d.dexId) >= 1 && Number(d && d.dexId) <= TEST_MAX_DEX_ID);
  const finalFormRows = buildFinalFormDexRows(openedDexRows, evolutionData);
  const activePets = finalFormRows
    .map(({ row: d, rootDexId, stageIndex }, idx) => {
      const dexId = Number(d.dexId);
      const species = speciesByDex[String(dexId)] || {};
      const equippedSkills = (Array.isArray(species.skills) ? species.skills : [])
        .filter((s) => Number(s && s.level) <= 100)
        .sort((a, b) => Number(b.level || 0) - Number(a.level || 0))
        .slice(0, 4)
        .map((s) => clean(s && s.name))
        .filter(Boolean)
        .reverse();
      const pet = {
        id: `test_pet_${String(dexId).padStart(4, "0")}`,
        dexId,
        baseDexId: rootDexId || dexId,
        speciesName: clean(d.name) || clean(species.name) || `亚比${dexId}`,
        element: clean(species.element) || clean(d.element) || "未知系",
        subElement: clean(species.subElement || d.subElement),
        level: 100,
        exp: 0,
        totalExp: 0,
        talent: maxTalent(),
        study: zeroStats(),
        equippedSkills,
        createdAt: now + idx
      };
      if (Number(stageIndex) > 0) {
        pet.fixedStageIndex = Number(stageIndex);
        pet.keepEquippedSkillsAboveLevel = true;
      }
      return pet;
    });
  const bagPetIds = activePets.slice(0, 6).map((p) => p.id);
  while (bagPetIds.length < 6) bagPetIds.push("");
  return {
    activatedDexIds: openedDexRows.map((d) => Number(d.dexId)),
    obtainedEggDexIds: [],
    activePets,
    bagPetIds,
    eggs: [],
    selectedDexId: null,
    challengeFormIndex: 0,
    selectedAttackerId: bagPetIds[0] || "",
    selectedPetId: activePets[0] ? activePets[0].id : "",
    items: { level_40_fruit: 1, divine_pet_key: 10000 },
    hCoins: 100000,
    guardianWinCounts: {},
    equippedBadgeId: "",
    targetLevel: 10,
    battleLog: [],
    showDexPanel: false
  };
};

const createFullTestSaveState = () => {
  const dexRows = loadWindowDataScript("aola-dex-1-100.js", "AOLA_DEX_1_100");
  const speciesByDex = loadWindowDataScript("aola-species-data.js", "AOLA_SPECIES_DATA_BY_DEX") || {};
  const evolutionData = loadWindowDataScript("aola-evolution-chains.js", "AOLA_EVOLUTION_CHAINS") || {};
  const progressionMeta = loadTestProgressionMeta();
  const zeroStats = () => ({ hp: 0, atk: 0, def: 0, spAtk: 0, spDef: 0, speed: 0 });
  const maxTalent = () => ({ hp: 62, atk: 62, def: 62, spAtk: 62, spDef: 62, speed: 62 });
  const clean = (s) => String(s || "").replace(/[\u200b\u00a0]/g, "").trim();
  const now = Date.now();
  const rows = (Array.isArray(dexRows) ? dexRows : []).filter((d) => Number(d && d.dexId) >= 1 && Number(d && d.dexId) <= TEST_MAX_DEX_ID);
  const stageByDexId = new Map();
  (Array.isArray(evolutionData && evolutionData.chains) ? evolutionData.chains : []).forEach((chain) => {
    const members = Array.isArray(chain && chain.members) ? chain.members : [];
    const rootDexId = Number(members[0] && members[0].race_id) || 0;
    members.forEach((member, stageIndex) => {
      const dexId = Number(member && member.race_id) || 0;
      if (dexId >= 1 && dexId <= TEST_MAX_DEX_ID) stageByDexId.set(dexId, { rootDexId: rootDexId || dexId, stageIndex });
    });
  });
  const activePets = rows.map((row, idx) => {
    const dexId = Number(row.dexId) || 0;
    const species = speciesByDex[String(dexId)] || {};
    const stageInfo = stageByDexId.get(dexId) || { rootDexId: dexId, stageIndex: 0 };
    const equippedSkills = (Array.isArray(species.skills) ? species.skills : [])
      .filter((s) => Number(s && s.level) <= 100)
      .sort((a, b) => Number(b.level || 0) - Number(a.level || 0))
      .slice(0, 4)
      .map((s) => clean(s && s.name))
      .filter(Boolean)
      .reverse();
    return {
      id: `test_pet_${String(dexId).padStart(4, "0")}`,
      dexId,
      baseDexId: stageInfo.rootDexId || dexId,
      speciesName: clean(row.name) || clean(species.name) || `test_pet_${dexId}`,
      element: clean(species.element) || clean(row.element) || "unknown",
      subElement: clean(species.subElement || row.subElement),
      level: 100,
      exp: 0,
      totalExp: 0,
      talent: maxTalent(),
      study: zeroStats(),
      equippedSkills,
      createdAt: now + idx,
      fixedStageIndex: Math.max(0, Number(stageInfo.stageIndex) || 0),
      keepEquippedSkillsAboveLevel: true
    };
  });
  const activatedDexIds = rows.map((row) => Number(row.dexId)).filter((id) => id > 0);
  const bagPetIds = activePets.slice(0, 6).map((pet) => pet.id);
  while (bagPetIds.length < 6) bagPetIds.push("");
  const guardianWinCounts = progressionMeta.guardianNames.reduce((acc, name) => {
    if (name) acc[name] = 100;
    return acc;
  }, {});
  const bossDifficultyFirstWinRewards = {};
  progressionMeta.bossNames.forEach((bossName, bossIndex) => {
    progressionMeta.bossDifficulties.forEach((difficulty, difficultyIndex) => {
      if (!bossName || !difficulty) return;
      bossDifficultyFirstWinRewards[`${bossName}::${difficulty}`] = {
        bossName,
        difficulty,
        claimedAt: now + bossIndex * 10 + difficultyIndex
      };
    });
  });
  const weeklyBossHonorRewards = progressionMeta.weeklyConfigs.reduce((acc, row, index) => {
    if (!row || !row.key || !row.name || !row.badgeId || !row.badgeName) return acc;
    acc[row.key] = {
      name: row.badgeName,
      bossName: row.name,
      badgeId: row.badgeId,
      claimedAt: now + index
    };
    return acc;
  }, {});
  const weeklyClearedDifficulties = progressionMeta.bossDifficulties.reduce((acc, difficulty) => {
    if (difficulty) acc[difficulty] = true;
    return acc;
  }, {});
  const items = { level_40_fruit: 1, divine_pet_key: 10000 };
  if (progressionMeta.weeklyMedalItemId) items[progressionMeta.weeklyMedalItemId] = 50;
  return {
    activatedDexIds,
    defeatedDexIds: activatedDexIds.slice(),
    obtainedEggDexIds: [],
    activePets,
    bagPetIds,
    eggs: [],
    selectedDexId: null,
    challengeFormIndex: 0,
    selectedAttackerId: bagPetIds[0] || "",
    selectedPetId: activePets[0] ? activePets[0].id : "",
    items,
    hCoins: 100000,
    guardianWinCounts,
    bossFirstWinRewardV1: progressionMeta.bossNames[0] ? { bossName: progressionMeta.bossNames[0] } : null,
    bossDifficultyFirstWinRewards,
    weeklyBossAttempts: { bossKey: progressionMeta.currentWeeklyBossKey, date: "", used: 0 },
    weeklyBossHonorRewards,
    weeklyBossRewardState: {
      bossKey: progressionMeta.currentWeeklyBossKey,
      rewardStateVersion: progressionMeta.weeklyRewardStateVersion,
      divinePetKeyClaimed: false,
      exchangedEgg: false,
      lastRewardDate: "",
      clearedDifficulties: weeklyClearedDifficulties
    },
    equippedBadgeId: "guardian_all_nightmare",
    targetLevel: 10,
    battleLog: [],
    showDexPanel: false
  };
};

const normalizeFullTestSavePayload = (payload) => {
  const fullSeed = createFullTestSaveState();
  const save = payload && typeof payload.save === "object" && !Array.isArray(payload.save) ? payload.save : null;
  if (!save) return fullSeed;
  const savedPetById = new Map((Array.isArray(save.activePets) ? save.activePets : []).map((pet) => [String(pet && pet.id || ""), pet]));
  const activePets = fullSeed.activePets.map((pet) => ({
    ...pet,
    ...(savedPetById.get(pet.id) || {}),
    id: pet.id,
    dexId: pet.dexId,
    baseDexId: pet.baseDexId,
    speciesName: pet.speciesName,
    element: pet.element,
    subElement: pet.subElement,
    fixedStageIndex: pet.fixedStageIndex,
    keepEquippedSkillsAboveLevel: true
  }));
  const bagPetIds = activePets.slice(0, 6).map((pet) => pet.id);
  while (bagPetIds.length < 6) bagPetIds.push("");
  return {
    ...fullSeed,
    ...save,
    activatedDexIds: fullSeed.activatedDexIds,
    defeatedDexIds: fullSeed.defeatedDexIds,
    activePets,
    bagPetIds,
    selectedAttackerId: bagPetIds[0] || "",
    selectedPetId: activePets[0] ? activePets[0].id : "",
    guardianWinCounts: fullSeed.guardianWinCounts,
    bossFirstWinRewardV1: fullSeed.bossFirstWinRewardV1,
    bossDifficultyFirstWinRewards: fullSeed.bossDifficultyFirstWinRewards,
    weeklyBossAttempts: fullSeed.weeklyBossAttempts,
    weeklyBossHonorRewards: fullSeed.weeklyBossHonorRewards,
    weeklyBossRewardState: fullSeed.weeklyBossRewardState,
    equippedBadgeId: fullSeed.equippedBadgeId,
    items: {
      ...(save.items && typeof save.items === "object" ? save.items : {}),
      ...(fullSeed.items && typeof fullSeed.items === "object" ? fullSeed.items : {})
    }
  };
};

const normalizeTestSavePayload = (payload) => {
  const seed = createTestSaveState();
  const save = payload && typeof payload.save === "object" && !Array.isArray(payload.save) ? payload.save : null;
  if (!save) return seed;
  if (!seed.items || typeof seed.items !== "object") seed.items = {};
  seed.items.divine_pet_key = 10000;
  if (!save.items || typeof save.items !== "object") save.items = {};
  save.items.divine_pet_key = 10000;
  const activePets = Array.isArray(save.activePets) ? save.activePets : [];
  const seedPetIds = new Set(seed.activePets.map((pet) => pet.id));
  const activePetIds = new Set(activePets.map((pet) => String(pet && pet.id || "")));
  const looksLikeOldFullFormSeed = activePets.length >= TEST_MAX_DEX_ID - 10;
  const looksLikeTestSeedPets = activePets.length > 0 && activePets.every((pet) => /^test_pet_\d{4}$/.test(String(pet && pet.id || "")));
  const seedPetSetChanged = looksLikeTestSeedPets
    && (activePets.length !== seed.activePets.length || seed.activePets.some((pet) => !activePetIds.has(pet.id)));
  if (!looksLikeOldFullFormSeed && !seedPetSetChanged) return save;
  const savedPetById = new Map(activePets.map((pet) => [String(pet && pet.id || ""), pet]));
  const mergedPets = seed.activePets.map((pet) => ({
    ...pet,
    ...(savedPetById.get(pet.id) || {}),
    dexId: pet.dexId,
    baseDexId: pet.baseDexId,
    speciesName: pet.speciesName,
    element: pet.element,
    subElement: pet.subElement,
    fixedStageIndex: pet.fixedStageIndex,
    keepEquippedSkillsAboveLevel: pet.keepEquippedSkillsAboveLevel
  }));
  activePets.forEach((pet) => {
    const id = String(pet && pet.id || "");
    if (!id || seedPetIds.has(id)) return;
    if (mergedPets.some((row) => String(row && row.id || "") === id)) return;
    mergedPets.push(pet);
  });
  const validPetIds = new Set(mergedPets.map((pet) => String(pet && pet.id || "")).filter(Boolean));
  const bagPetIds = Array.isArray(save.bagPetIds)
    ? save.bagPetIds.filter((id) => validPetIds.has(String(id || ""))).slice(0, 6)
    : [];
  seed.bagPetIds.forEach((id) => {
    if (bagPetIds.length < 6 && id && !bagPetIds.includes(id)) bagPetIds.push(id);
  });
  while (bagPetIds.length < 6) bagPetIds.push("");
  const selectedPetId = validPetIds.has(String(save.selectedPetId || "")) ? save.selectedPetId : (bagPetIds.find(Boolean) || seed.selectedPetId);
  return {
    ...seed,
    ...save,
    activatedDexIds: seed.activatedDexIds,
    activePets: mergedPets,
    bagPetIds,
    selectedAttackerId: bagPetIds[0] || "",
    selectedPetId
  };
};

const backfillAlhub666MistDragonEgg = (payload) => {
  const save = payload && typeof payload.save === "object" && !Array.isArray(payload.save) ? payload.save : null;
  if (!save) return payload;
  const redeemedCodes = Array.isArray(save.redeemedCodes)
    ? save.redeemedCodes.map((code) => cleanText(code).toUpperCase()).filter(Boolean)
    : [];
  if (!redeemedCodes.includes(SHOP_REDEEM_CODE_ALHUB666)) return payload;
  const migrations = save.migrations && typeof save.migrations === "object" ? { ...save.migrations } : {};
  if (migrations[SHOP_REDEEM_CODE_ALHUB666_BACKFILL_MIGRATION_KEY]) return payload;
  const activePets = Array.isArray(save.activePets) ? save.activePets : [];
  const eggs = Array.isArray(save.eggs) ? save.eggs.slice() : [];
  if (!activePets.some(isAlhub666CurrentRewardRow) && !eggs.some(isAlhub666CurrentRewardRow)) {
    const now = Date.now();
    eggs.unshift({
      id: createSaveUid(),
      dexId: SHOP_REDEEM_CODE_ALHUB666_DEX_ID,
      speciesName: SHOP_REDEEM_CODE_ALHUB666_PET_NAME,
      source: SHOP_REDEEM_CODE_ALHUB666_SOURCE,
      startAt: now,
      hatchAt: now + HATCH_MS
    });
  }
  migrations[SHOP_REDEEM_CODE_ALHUB666_BACKFILL_MIGRATION_KEY] = true;
  return {
    ...(payload && typeof payload === "object" ? payload : {}),
    save: {
      ...save,
      redeemedCodes: Array.from(new Set(redeemedCodes)),
      eggs,
      migrations
    }
  };
};

const normalizeSaveForUser = (user, payload) => {
  const save = payload && typeof payload.save === "object" && !Array.isArray(payload.save) ? payload.save : null;
  if (!save) return payload;
  const backfilledPayload = backfillAlhub666MistDragonEgg(payload);
  const backfilledSave = backfilledPayload && backfilledPayload.save && typeof backfilledPayload.save === "object" && !Array.isArray(backfilledPayload.save)
    ? backfilledPayload.save
    : save;
  if (!user || user.id !== TEST_USER_ID) return backfilledPayload;
  const normalizedSave = normalizeFullTestSavePayload(backfilledPayload);
  if (normalizedSave === backfilledSave) return backfilledPayload;
  return {
    ...(payload && typeof payload === "object" ? payload : {}),
    userId: user.id,
    username: user.username,
    savedAt: new Date().toISOString(),
    save: normalizedSave
  };
};

const ensureTestAccount = () => {
  const db = usersDb();
  const { salt, hash } = hashPassword(TEST_PASSWORD);
  let user = db.users.find((u) => String(u.username || "").toLowerCase() === TEST_USERNAME);
  if (user) {
    user.id = TEST_USER_ID;
    user.salt = salt;
    user.passwordHash = hash;
    user.updatedAt = new Date().toISOString();
  } else {
    user = { id: TEST_USER_ID, username: TEST_USERNAME, salt, passwordHash: hash, createdAt: new Date().toISOString() };
    db.users.push(user);
  }
  saveUsersDb(db);
  const currentSaveFile = userSaveFile(user.id);
  if (fs.existsSync(currentSaveFile)) {
    const current = readJsonFile(currentSaveFile, null);
    const normalizedSave = normalizeFullTestSavePayload(current);
    if (normalizedSave !== (current && current.save)) {
      writeJsonFile(currentSaveFile, {
        userId: user.id,
        username: user.username,
        savedAt: new Date().toISOString(),
        save: normalizedSave
      });
    }
    return;
  }
  const legacySaveFile = LEGACY_TEST_USER_IDS.map((id) => userSaveFile(id)).find((file) => fs.existsSync(file));
  if (legacySaveFile) {
    const legacy = readJsonFile(legacySaveFile, null);
    if (legacy && typeof legacy === "object") {
      writeJsonFile(currentSaveFile, {
        ...legacy,
        userId: user.id,
        username: user.username,
        savedAt: new Date().toISOString(),
        save: normalizeFullTestSavePayload(legacy)
      });
      return;
    }
  }
  writeJsonFile(currentSaveFile, {
    userId: user.id,
    username: user.username,
    savedAt: new Date().toISOString(),
    save: createFullTestSaveState()
  });
};

const parseCookies = (req) => {
  const raw = String(req.headers.cookie || "");
  return raw.split(";").reduce((acc, part) => {
    const idx = part.indexOf("=");
    if (idx < 0) return acc;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) acc[key] = decodeURIComponent(val);
    return acc;
  }, {});
};

const currentUser = (req) => {
  const auth = String(req.headers.authorization || "");
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  let queryToken = "";
  try {
    queryToken = String(new URL(req.url, `http://${req.headers.host || "localhost"}`).searchParams.get("token") || "");
  } catch {}
  const token = parseCookies(req).aola_session || bearer || String(req.headers["x-aola-session"] || "") || queryToken;
  const session = sessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (token) sessions.delete(token);
    return null;
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  const db = usersDb();
  return db.users.find((u) => u.id === session.userId) || null;
};

const readBody = (req) => new Promise((resolve, reject) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 25 * 1024 * 1024) {
      reject(new Error("Request body too large"));
      req.destroy();
    }
  });
  req.on("end", () => {
    if (!body) return resolve({});
    try { resolve(JSON.parse(body)); } catch { reject(new Error("Invalid JSON")); }
  });
  req.on("error", reject);
});

const sendJson = (res, status, data, headers = {}) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "null",
    "Access-Control-Allow-Credentials": "true",
    ...headers
  });
  res.end(JSON.stringify(data));
};

const staticCacheHeaders = (ext) => {
  if (ext === ".html") {
    return {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    };
  }
  if ([".js", ".css", ".json"].includes(ext)) {
    return {
      "Cache-Control": "no-cache"
    };
  }
  if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ogg"].includes(ext)) {
    return {
      "Cache-Control": "public, max-age=2592000"
    };
  }
  return {
    "Cache-Control": "no-cache"
  };
};

const safeNonNegInt = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
};

const normalizeStats = (stats) => ({
  hp: safeNonNegInt(stats && stats.hp),
  atk: safeNonNegInt(stats && stats.atk),
  def: safeNonNegInt(stats && stats.def),
  spAtk: safeNonNegInt(stats && stats.spAtk),
  spDef: safeNonNegInt(stats && stats.spDef),
  speed: safeNonNegInt(stats && stats.speed)
});

const calcAbilityStat = (base, talent, study, level) => {
  const b = safeNonNegInt(base);
  const t = Math.min(62, safeNonNegInt(talent));
  const ev = Math.min(255, safeNonNegInt(study));
  const lv = Math.max(1, Math.min(100, safeNonNegInt(level, 1)));
  return Math.floor(((2 * b + t + Math.floor(ev / 4)) * lv) / 100 + 5);
};

const calcAbilityHp = (base, talent, study, level) => {
  const b = safeNonNegInt(base);
  const t = Math.min(62, safeNonNegInt(talent));
  const ev = Math.min(255, safeNonNegInt(study));
  const lv = Math.max(1, Math.min(100, safeNonNegInt(level, 1)));
  return Math.floor(((2 * b + t + Math.floor(ev / 4)) * lv) / 100 + lv + 10);
};

const calcPetBattlePowerForSave = (pet, speciesByDex) => {
  const dexId = Number((pet && pet.dexId) || (pet && pet.baseDexId)) || 0;
  const species = speciesByDex[String(dexId)] || speciesByDex[dexId] || null;
  const race = species && species.raceStats && typeof species.raceStats === "object" ? species.raceStats : null;
  if (!race) return 0;
  const talent = normalizeStats(pet && pet.talent);
  const study = normalizeStats(pet && pet.study);
  const level = Math.max(1, Math.min(100, safeNonNegInt(pet && pet.level, 1)));
  const total =
    calcAbilityHp(race.hp, talent.hp, study.hp, level) +
    calcAbilityStat(race.atk, talent.atk, study.atk, level) +
    calcAbilityStat(race.def, talent.def, study.def, level) +
    calcAbilityStat(race.spAtk, talent.spAtk, study.spAtk, level) +
    calcAbilityStat(race.spDef, talent.spDef, study.spDef, level) +
    calcAbilityStat(race.speed, talent.speed, study.speed, level);
  return Math.floor(Math.max(0, total) * 3.6);
};

const extractGameSaveState = (payload) => {
  let cur = payload;
  for (let i = 0; i < 4; i += 1) {
    if (!cur || typeof cur !== "object" || Array.isArray(cur)) return {};
    if (cur.save && typeof cur.save === "object" && !Array.isArray(cur.save)) {
      cur = cur.save.save && typeof cur.save.save === "object" && !Array.isArray(cur.save.save)
        ? cur.save.save
        : cur.save;
      continue;
    }
    if (cur.state && typeof cur.state === "object" && !Array.isArray(cur.state)) { cur = cur.state; continue; }
    if (cur.data && typeof cur.data === "object" && !Array.isArray(cur.data)) { cur = cur.data; continue; }
    if (cur.payload && typeof cur.payload === "object" && !Array.isArray(cur.payload)) { cur = cur.payload; continue; }
    return cur;
  }
  return cur && typeof cur === "object" && !Array.isArray(cur) ? cur : {};
};

const readLeaderboardTimeTunnelFloor = (save) => {
  const direct = [
    save && save.timeTunnelMaxClearedFloor,
    save && save.timeTunnelHighestClearedFloor,
    save && save.timeTunnelClearedFloor,
    save && save.timeTunnelMaxFloor
  ].map((value) => safeNonNegInt(value, 0));
  const claimedFloors = Array.isArray(save && save.timeTunnelRewardClaimedFloors)
    ? save.timeTunnelRewardClaimedFloors.map((floor) => safeNonNegInt(floor, 0))
    : [];
  return Math.max(0, ...direct, ...claimedFloors);
};

const readLeaderboardEquipmentDungeonBestScore = (save) => Math.max(
  0,
  safeNonNegInt(save && save.equipmentDungeonBestScore, 0),
  safeNonNegInt(save && save.equipmentDungeonHighScore, 0),
  safeNonNegInt(save && save.equipmentDungeon && save.equipmentDungeon.score, 0)
);

const buildLeaderboardRows = () => {
  const db = usersDb();
  const speciesByDex = loadWindowDataScript("aola-species-data.js", "AOLA_SPECIES_DATA_BY_DEX") || {};
  return db.users.map((user) => {
    const payload = readJsonFile(userSaveFile(user.id), null);
    const save = extractGameSaveState(payload);
    const activePets = Array.isArray(save.activePets) ? save.activePets : [];
    const petPowerRows = activePets
      .map((pet) => calcPetBattlePowerForSave(pet, speciesByDex))
      .sort((a, b) => b - a);
    const currentMaxBagBattlePower = petPowerRows.slice(0, 6).reduce((sum, n) => sum + n, 0);
    const maxBagBattlePower = Math.max(
      Math.max(0, Math.floor(Number(save.maxBagBattlePower) || 0)),
      currentMaxBagBattlePower
    );
    return {
      userId: user.id,
      username: safeUserName(user.username) || "匿名玩家",
      battlePower: maxBagBattlePower,
      maxBagBattlePower,
      activatedDexCount: new Set(Array.isArray(save.activatedDexIds) ? save.activatedDexIds.map((id) => Number(id) || 0).filter(Boolean) : []).size,
      hCoins: Math.max(0, Math.floor(Number(save.hCoins) || 0)),
      timeTunnelMaxClearedFloor: readLeaderboardTimeTunnelFloor(save),
      equipmentDungeonBestScore: readLeaderboardEquipmentDungeonBestScore(save),
      savedAt: payload && payload.savedAt ? payload.savedAt : ""
    };
  });
};

const isLegalLeaderboardRow = (row) => (
  Math.max(0, Math.floor(Number(row && row.activatedDexCount) || 0)) <= LEADERBOARD_MAX_OPEN_DEX_ID &&
  Math.max(0, Math.floor(Number(row && row.hCoins) || 0)) <= LEADERBOARD_MAX_HCOINS
);

const buildQualifiedLeaderboardRows = () => buildLeaderboardRows().filter(isLegalLeaderboardRow);

const buildRankedLeaderboardRows = (metric) => buildQualifiedLeaderboardRows()
  .sort((a, b) => {
    const delta = Math.max(0, Number(b[metric]) || 0) - Math.max(0, Number(a[metric]) || 0);
    return delta || String(a.username).localeCompare(String(b.username), "zh-Hans-CN");
  })
  .map((row, idx) => ({ ...row, rank: idx + 1 }));

const teamsDb = () => {
  const raw = readJsonFile(TEAMS_FILE, { teams: [] });
  const teams = Array.isArray(raw.teams) ? raw.teams : [];
  return { teams: teams.map(normalizeTeamRow).filter((team) => team.id && team.name) };
};

const saveTeamsDb = (db) => writeJsonFile(TEAMS_FILE, { teams: Array.isArray(db && db.teams) ? db.teams : [] });

const createTeamId = () => `team_${crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex")}`;

const teamLevelHonorThreshold = (level) => {
  const targetLevel = Math.max(1, Math.min(7, safeNonNegInt(level, 1)));
  if (targetLevel <= 1) return 0;
  const prev = TEAM_LEVEL_RULES.find((row) => row.level === targetLevel - 1);
  return safeNonNegInt(prev && prev.nextHonor, 0);
};

const resolveTeamLevelByHonor = (honor) => {
  const totalHonor = safeNonNegInt(honor, 0);
  let level = 1;
  TEAM_LEVEL_RULES.forEach((row) => {
    if (totalHonor >= teamLevelHonorThreshold(row.level)) level = Math.max(level, row.level);
  });
  return Math.max(1, Math.min(7, level));
};

const teamMemberLimitByLevel = (level) => {
  const row = TEAM_LEVEL_RULES.find((item) => item.level === Math.max(1, Math.min(7, safeNonNegInt(level, 1))));
  return row ? row.memberLimit : 20;
};

const normalizeTeamMember = (member) => ({
  userId: String(member && member.userId || ""),
  role: TEAM_ROLE_LABELS[member && member.role] ? member.role : "member",
  contribution: safeNonNegInt(member && member.contribution, 0),
  currentContribution: member && Object.prototype.hasOwnProperty.call(member, "currentContribution")
    ? safeNonNegInt(member.currentContribution, 0)
    : safeNonNegInt(member && member.contribution, 0),
  honor: safeNonNegInt(member && member.honor, 0),
  shopPurchases: member && member.shopPurchases && typeof member.shopPurchases === "object" && !Array.isArray(member.shopPurchases)
    ? Object.fromEntries(Object.entries(member.shopPurchases).map(([key, value]) => [String(key), safeNonNegInt(value, 0)]))
    : {},
  joinedAt: String(member && member.joinedAt || new Date().toISOString())
});

function normalizeTeamRow(team) {
  const members = (Array.isArray(team && team.members) ? team.members : []).map(normalizeTeamMember).filter((member) => member.userId);
  const leaderId = String((team && team.leaderId) || (members.find((member) => member.role === "leader") || {}).userId || "");
  const normalizedMembers = members.map((member) => ({
    ...member,
    role: member.userId === leaderId ? "leader" : member.role
  }));
  if (leaderId && !normalizedMembers.some((member) => member.userId === leaderId)) {
    normalizedMembers.unshift({ userId: leaderId, role: "leader", contribution: 0, currentContribution: 0, honor: 0, shopPurchases: {}, joinedAt: String(team && team.createdAt || new Date().toISOString()) });
  }
  const applications = (Array.isArray(team && team.applications) ? team.applications : [])
    .map((app) => ({ userId: String(app && app.userId || ""), appliedAt: String(app && app.appliedAt || new Date().toISOString()) }))
    .filter((app) => app.userId && !normalizedMembers.some((member) => member.userId === app.userId));
  return {
    id: String(team && team.id || ""),
    name: safeTeamText(team && team.name, 24),
    slogan: safeTeamText(team && team.slogan, 80),
    leaderId,
    createdAt: String(team && team.createdAt || new Date().toISOString()),
    updatedAt: String(team && team.updatedAt || new Date().toISOString()),
    members: normalizedMembers,
    applications
  };
}

const teamTotalHonor = (team) => (Array.isArray(team && team.members) ? team.members : [])
  .reduce((sum, member) => sum + safeNonNegInt(member && member.honor, 0), 0);

const findUserTeam = (db, userId) => (Array.isArray(db && db.teams) ? db.teams : [])
  .find((team) => Array.isArray(team.members) && team.members.some((member) => member.userId === userId));

const findTeamById = (db, teamId) => (Array.isArray(db && db.teams) ? db.teams : [])
  .find((team) => team.id === teamId);

const userNameByIdMap = () => usersDb().users.reduce((acc, user) => {
  acc.set(user.id, safeUserName(user.username) || "匿名玩家");
  return acc;
}, new Map());

const readUserMaxBattlePower = (() => {
  let speciesByDex = null;
  return (userId) => {
    const payload = readJsonFile(userSaveFile(userId), null);
    const save = extractGameSaveState(payload);
    const savedMax = Math.max(
      safeNonNegInt(save && save.maxBagBattlePower, 0),
      safeNonNegInt(save && save.maxBattlePower, 0),
      safeNonNegInt(save && save.battlePower, 0)
    );
    if (savedMax > 0) return savedMax;
    if (!speciesByDex) speciesByDex = loadWindowDataScript("aola-species-data.js", "AOLA_SPECIES_DATA_BY_DEX") || {};
    const activePets = Array.isArray(save && save.activePets) ? save.activePets : [];
    return activePets
      .map((pet) => calcPetBattlePowerForSave(pet, speciesByDex))
      .sort((a, b) => b - a)
      .slice(0, 6)
      .reduce((sum, value) => sum + safeNonNegInt(value, 0), 0);
  };
})();

const publicTeamMember = (member, names) => ({
  userId: member.userId,
  name: names.get(member.userId) || "匿名玩家",
  role: member.role,
  roleLabel: TEAM_ROLE_LABELS[member.role] || TEAM_ROLE_LABELS.member,
  maxBattlePower: readUserMaxBattlePower(member.userId),
  contribution: safeNonNegInt(member.contribution, 0),
  currentContribution: safeNonNegInt(member.currentContribution, 0),
  honor: safeNonNegInt(member.honor, 0),
  joinedAt: member.joinedAt
});

const publicTeamApplication = (app, names) => ({
  userId: app.userId,
  name: names.get(app.userId) || "匿名玩家",
  maxBattlePower: readUserMaxBattlePower(app.userId),
  appliedAt: app.appliedAt
});

const publicTeam = (team, options = {}) => {
  const names = options.names || userNameByIdMap();
  const honor = teamTotalHonor(team);
  const level = resolveTeamLevelByHonor(honor);
  const leaderName = names.get(team.leaderId) || "匿名玩家";
  const viewerMember = options.viewerUserId
    ? (team.members || []).find((member) => member.userId === options.viewerUserId)
    : null;
  return {
    id: team.id,
    name: team.name,
    slogan: team.slogan,
    leaderId: team.leaderId,
    leader: leaderName,
    leaderName,
    level,
    honor,
    score: honor,
    memberCount: (team.members || []).length,
    memberLimit: teamMemberLimitByLevel(level),
    members: `${(team.members || []).length}/${teamMemberLimitByLevel(level)}`,
    viewerRole: viewerMember ? viewerMember.role : "",
    isMember: Boolean(viewerMember),
    isLeader: Boolean(viewerMember && viewerMember.role === "leader"),
    contribution: viewerMember ? safeNonNegInt(viewerMember.contribution, 0) : 0,
    currentContribution: viewerMember ? safeNonNegInt(viewerMember.currentContribution, 0) : 0,
    shopPurchases: viewerMember && viewerMember.shopPurchases && typeof viewerMember.shopPurchases === "object" ? viewerMember.shopPurchases : {},
    applications: options.includeRecords ? (team.applications || []).map((app) => publicTeamApplication(app, names)) : [],
    memberRows: options.includeRecords ? (team.members || []).map((member) => publicTeamMember(member, names)) : []
  };
};

const rankedPublicTeams = (viewerUserId = "", includeRecords = false) => {
  const db = teamsDb();
  const names = userNameByIdMap();
  return db.teams
    .map((team) => publicTeam(team, { names, viewerUserId, includeRecords }))
    .sort((a, b) => safeNonNegInt(b.honor, 0) - safeNonNegInt(a.honor, 0) || String(a.name).localeCompare(String(b.name), "zh-Hans-CN"))
    .map((team, index) => ({ ...team, rank: index + 1 }));
};

const publicTeamWithRank = (team, viewerUserId = "", includeRecords = false) => {
  const rankedTeam = rankedPublicTeams(viewerUserId, false).find((row) => row.id === team.id);
  return {
    ...publicTeam(team, { viewerUserId, includeRecords }),
    rank: rankedTeam ? rankedTeam.rank : 0
  };
};

const assertTeamManager = (team, userId, allowVice = true) => {
  const member = (team.members || []).find((row) => row.userId === userId);
  if (!member) return false;
  return member.role === "leader" || (allowVice && member.role === "vice");
};

const normalizeLeaderboardPageSize = (value) => {
  const pageSize = Math.max(1, Math.floor(Number(value) || LEADERBOARD_PAGE_SIZE_OPTIONS[0]));
  return LEADERBOARD_PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : LEADERBOARD_PAGE_SIZE_OPTIONS[0];
};

const serveStatic = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/aola-star.html";
  const cleanRel = rel.replace(/^\/+/, "");
  const staticResourceRoot = STATIC_RESOURCE_DIR ? path.resolve(STATIC_RESOURCE_DIR) : "";
  const shouldUseStaticResourceRoot = staticResourceRoot && STATIC_RESOURCE_PREFIXES.some((prefix) => cleanRel.startsWith(prefix));
  const resourceFull = shouldUseStaticResourceRoot ? path.normalize(path.join(staticResourceRoot, cleanRel)) : "";
  const rootFull = path.normalize(path.join(ROOT_DIR, rel));
  const full = resourceFull && resourceFull.startsWith(staticResourceRoot) && fs.existsSync(resourceFull) ? resourceFull : rootFull;
  if (!full.startsWith(ROOT_DIR)) {
    if (!staticResourceRoot || !full.startsWith(staticResourceRoot)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
  }
  fs.stat(full, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(full).toLowerCase();
    const typeMap = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".svg": "image/svg+xml; charset=utf-8",
      ".gif": "image/gif",
      ".ogg": "audio/ogg",
      ".zip": "application/zip"
    };
    res.writeHead(200, {
      "Content-Type": typeMap[ext] || "application/octet-stream",
      ...staticCacheHeaders(ext)
    });
    fs.createReadStream(full).pipe(res);
  });
};

const requireUser = (req, res) => {
  const user = currentUser(req);
  if (!user) {
    sendJson(res, 401, { ok: false, message: "请先登录。" });
    return null;
  }
  return user;
};

const handleApi = async (req, res) => {
  try {
    const apiUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = apiUrl.pathname;
    if (req.method === "POST" && req.url === "/api/auth/register") {
      const body = await readBody(req);
      const username = safeUserName(body.username);
      const password = String(body.password || "");
      if (username.length < 2 || username.length > 32) return sendJson(res, 400, { ok: false, message: "用户名长度需为2-32个字符。" });
      if (password.length < 6) return sendJson(res, 400, { ok: false, message: "密码至少6个字符。" });
      const db = usersDb();
      if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        return sendJson(res, 409, { ok: false, message: "用户名已存在。" });
      }
      const { salt, hash } = hashPassword(password);
      const user = { id: createUserId(), username, salt, passwordHash: hash, createdAt: new Date().toISOString() };
      db.users.push(user);
      saveUsersDb(db);
      ensureDir(userSaveDir(user.id));
      const token = createSession(user);
      return sendJson(res, 200, { ok: true, user: publicUser(user), token }, authHeaders(token));
    }
    if (req.method === "POST" && req.url === "/api/auth/login") {
      const body = await readBody(req);
      const username = safeUserName(body.username);
      const password = String(body.password || "");
      const db = usersDb();
      const user = db.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (!user || !verifyPassword(password, user)) return sendJson(res, 401, { ok: false, message: "用户名或密码不正确。" });
      const token = createSession(user);
      return sendJson(res, 200, { ok: true, user: publicUser(user), token }, authHeaders(token));
    }
    if (req.method === "POST" && req.url === "/api/auth/logout") {
      const token = parseCookies(req).aola_session || "";
      if (token) sessions.delete(token);
      return sendJson(res, 200, { ok: true }, {
        "Set-Cookie": "aola_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
      });
    }
    if (req.method === "GET" && req.url === "/api/auth/me") {
      const user = currentUser(req);
      return sendJson(res, 200, { ok: true, user: user ? publicUser(user) : null });
    }
    if (req.method === "POST" && req.url === "/api/auth/rename") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      const username = safeUserName(body.username);
      if (username.length < 2 || username.length > 32) return sendJson(res, 400, { ok: false, message: "用户名长度需为2-32个字符。" });
      const db = usersDb();
      if (db.users.some((u) => u.id !== user.id && String(u.username || "").toLowerCase() === username.toLowerCase())) {
        return sendJson(res, 409, { ok: false, message: "用户名已存在。" });
      }
      const row = db.users.find((u) => u.id === user.id);
      if (!row) return sendJson(res, 404, { ok: false, message: "用户不存在。" });
      row.username = username;
      row.updatedAt = new Date().toISOString();
      saveUsersDb(db);
      const saveFile = userSaveFile(user.id);
      const save = readJsonFile(saveFile, null);
      if (save && typeof save === "object" && !Array.isArray(save)) {
        save.username = username;
        writeJsonFile(saveFile, save);
      }
      return sendJson(res, 200, { ok: true, user: publicUser(row) });
    }
    if (req.method === "GET" && pathname === "/api/teams") {
      const user = currentUser(req);
      return sendJson(res, 200, { ok: true, teams: rankedPublicTeams(user ? user.id : "") });
    }
    if (req.method === "GET" && pathname === "/api/teams/me") {
      const user = requireUser(req, res);
      if (!user) return;
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const includeRecords = url.searchParams.get("records") === "1" || url.searchParams.get("includeRecords") === "1";
      const db = teamsDb();
      const team = findUserTeam(db, user.id);
      if (!team) return sendJson(res, 200, { ok: true, team: null });
      return sendJson(res, 200, { ok: true, team: publicTeamWithRank(team, user.id, includeRecords) });
    }
    if (req.method === "GET" && pathname.startsWith("/api/teams/")) {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const teamId = decodeURIComponent(pathname.slice("/api/teams/".length));
      const user = currentUser(req);
      const db = teamsDb();
      const team = findTeamById(db, teamId);
      if (!team) return sendJson(res, 404, { ok: false, message: "战队不存在。" });
      const viewerUserId = user ? user.id : "";
      const includeRecords = url.searchParams.get("records") !== "0" && Boolean(user && assertTeamManager(team, user.id, true));
      return sendJson(res, 200, { ok: true, team: publicTeamWithRank(team, viewerUserId, includeRecords) });
    }
    if (req.method === "POST" && pathname === "/api/teams/create") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      const name = safeTeamText(body.name, 24);
      const slogan = safeTeamText(body.slogan, 80);
      if (name.length < 2 || name.length > 24) return sendJson(res, 400, { ok: false, message: "战队名称长度需要 2-24 个字符。" });
      const db = teamsDb();
      if (findUserTeam(db, user.id)) return sendJson(res, 409, { ok: false, message: "当前账号已经加入战队。" });
      if (db.teams.some((team) => String(team.name || "").toLowerCase() === name.toLowerCase())) {
        return sendJson(res, 409, { ok: false, message: "战队名称已存在。" });
      }
      const now = new Date().toISOString();
      const team = normalizeTeamRow({
        id: createTeamId(),
        name,
        slogan: slogan || "欢迎加入我们的战队！",
        leaderId: user.id,
        createdAt: now,
        updatedAt: now,
        members: [{ userId: user.id, role: "leader", contribution: 0, currentContribution: 0, honor: 0, shopPurchases: {}, joinedAt: now }],
        applications: []
      });
      db.teams.push(team);
      saveTeamsDb(db);
      return sendJson(res, 200, { ok: true, team: publicTeamWithRank(team, user.id, false) });
    }
    if (req.method === "POST" && pathname === "/api/teams/apply") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      const teamId = String(body.teamId || "");
      const db = teamsDb();
      if (findUserTeam(db, user.id)) return sendJson(res, 409, { ok: false, message: "当前账号已经加入战队。" });
      const team = findTeamById(db, teamId);
      if (!team) return sendJson(res, 404, { ok: false, message: "战队不存在。" });
      const level = resolveTeamLevelByHonor(teamTotalHonor(team));
      if ((team.members || []).length >= teamMemberLimitByLevel(level)) return sendJson(res, 409, { ok: false, message: "该战队人数已满。" });
      if ((team.applications || []).some((app) => app.userId === user.id)) return sendJson(res, 409, { ok: false, message: "已提交过申请，请等待审核。" });
      team.applications.push({ userId: user.id, appliedAt: new Date().toISOString() });
      team.updatedAt = new Date().toISOString();
      saveTeamsDb(db);
      return sendJson(res, 200, { ok: true });
    }
    if (req.method === "POST" && pathname === "/api/teams/applications/approve") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      const teamId = String(body.teamId || "");
      const applicantUserId = String(body.userId || "");
      const db = teamsDb();
      const team = findTeamById(db, teamId);
      if (!team) return sendJson(res, 404, { ok: false, message: "战队不存在。" });
      if (!assertTeamManager(team, user.id, true)) return sendJson(res, 403, { ok: false, message: "只有队长或副队长可以审核申请。" });
      const appIndex = (team.applications || []).findIndex((app) => app.userId === applicantUserId);
      if (appIndex < 0) return sendJson(res, 404, { ok: false, message: "申请记录不存在。" });
      if (findUserTeam(db, applicantUserId)) {
        team.applications.splice(appIndex, 1);
        saveTeamsDb(db);
        return sendJson(res, 409, { ok: false, message: "该玩家已经加入其他战队。" });
      }
      const level = resolveTeamLevelByHonor(teamTotalHonor(team));
      if ((team.members || []).length >= teamMemberLimitByLevel(level)) return sendJson(res, 409, { ok: false, message: "该战队人数已满。" });
      team.applications.splice(appIndex, 1);
      team.members.push({ userId: applicantUserId, role: "member", contribution: 0, currentContribution: 0, honor: 0, shopPurchases: {}, joinedAt: new Date().toISOString() });
      team.updatedAt = new Date().toISOString();
      saveTeamsDb(db);
      return sendJson(res, 200, { ok: true, team: publicTeamWithRank(team, user.id, true) });
    }
    if (req.method === "POST" && pathname === "/api/teams/applications/reject") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      const teamId = String(body.teamId || "");
      const applicantUserId = String(body.userId || "");
      const db = teamsDb();
      const team = findTeamById(db, teamId);
      if (!team) return sendJson(res, 404, { ok: false, message: "战队不存在。" });
      if (!assertTeamManager(team, user.id, true)) return sendJson(res, 403, { ok: false, message: "只有队长或副队长可以审核申请。" });
      team.applications = (team.applications || []).filter((app) => app.userId !== applicantUserId);
      team.updatedAt = new Date().toISOString();
      saveTeamsDb(db);
      return sendJson(res, 200, { ok: true, team: publicTeamWithRank(team, user.id, true) });
    }
    if (req.method === "POST" && pathname === "/api/teams/member-role") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      const teamId = String(body.teamId || "");
      const targetUserId = String(body.userId || "");
      const role = String(body.role || "");
      const db = teamsDb();
      const team = findTeamById(db, teamId);
      if (!team) return sendJson(res, 404, { ok: false, message: "战队不存在。" });
      const actor = (team.members || []).find((member) => member.userId === user.id);
      const target = (team.members || []).find((member) => member.userId === targetUserId);
      if (!actor || !target) return sendJson(res, 404, { ok: false, message: "成员不存在。" });
      if (target.role === "leader") return sendJson(res, 400, { ok: false, message: "不能调整队长职位。" });
      if (role === "vice") {
        if (actor.role !== "leader") return sendJson(res, 403, { ok: false, message: "只有队长可以设置副队长。" });
        const viceCount = team.members.filter((member) => member.role === "vice" && member.userId !== target.userId).length;
        if (viceCount >= TEAM_MAX_VICE_CAPTAINS) return sendJson(res, 409, { ok: false, message: "副队长最多只能设置 2 名。" });
        target.role = "vice";
      } else if (role === "elder") {
        if (actor.role !== "leader" && actor.role !== "vice") return sendJson(res, 403, { ok: false, message: "只有队长或副队长可以设置元老。" });
        if (target.role === "vice") return sendJson(res, 400, { ok: false, message: "副队长不能同时设置为元老。" });
        const elderCount = team.members.filter((member) => member.role === "elder" && member.userId !== target.userId).length;
        if (elderCount >= TEAM_MAX_ELDERS) return sendJson(res, 409, { ok: false, message: "元老最多只能设置 5 名。" });
        target.role = "elder";
      } else {
        return sendJson(res, 400, { ok: false, message: "职位类型不正确。" });
      }
      team.updatedAt = new Date().toISOString();
      saveTeamsDb(db);
      return sendJson(res, 200, { ok: true, team: publicTeamWithRank(team, user.id, true) });
    }
    if (req.method === "POST" && pathname === "/api/teams/contribution") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      const contribution = Math.min(1000000, safeNonNegInt(body.contribution, 0));
      const honor = Math.min(1000000, safeNonNegInt(body.honor, 0));
      if (contribution <= 0 && honor <= 0) return sendJson(res, 400, { ok: false, message: "贡献或荣誉必须大于 0。" });
      const db = teamsDb();
      const team = findUserTeam(db, user.id);
      if (!team) return sendJson(res, 404, { ok: false, message: "当前账号未加入战队。" });
      const member = team.members.find((row) => row.userId === user.id);
      member.contribution = safeNonNegInt(member.contribution, 0) + contribution;
      member.currentContribution = safeNonNegInt(member.currentContribution, 0) + contribution;
      member.honor = safeNonNegInt(member.honor, 0) + honor;
      team.updatedAt = new Date().toISOString();
      saveTeamsDb(db);
      return sendJson(res, 200, { ok: true, team: publicTeamWithRank(team, user.id, true) });
    }
    if (req.method === "POST" && pathname === "/api/teams/shop/purchase") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      const itemId = String(body.itemId || "");
      const item = TEAM_SHOP_ITEM_BY_ID.get(itemId);
      if (!item) return sendJson(res, 404, { ok: false, message: "战队商店商品不存在。" });
      const db = teamsDb();
      const team = findUserTeam(db, user.id);
      if (!team) return sendJson(res, 404, { ok: false, message: "当前账号未加入战队。" });
      const level = resolveTeamLevelByHonor(teamTotalHonor(team));
      if (level < safeNonNegInt(item.minLevel, 1)) return sendJson(res, 403, { ok: false, message: `战队达到${item.minLevel}级后开放该商品。` });
      const member = team.members.find((row) => row.userId === user.id);
      if (!member) return sendJson(res, 404, { ok: false, message: "战队成员不存在。" });
      if (!member.shopPurchases || typeof member.shopPurchases !== "object" || Array.isArray(member.shopPurchases)) member.shopPurchases = {};
      const limit = safeNonNegInt(item.limit, 0);
      const bought = safeNonNegInt(member.shopPurchases[item.id], 0);
      if (limit > 0 && bought >= limit) return sendJson(res, 409, { ok: false, message: "该商品已达到个人限购次数。" });
      const cost = safeNonNegInt(item.cost, 0);
      if (safeNonNegInt(member.currentContribution, 0) < cost) return sendJson(res, 409, { ok: false, message: `当前贡献值不足，需要${cost}贡献值。` });
      member.currentContribution = safeNonNegInt(member.currentContribution, 0) - cost;
      if (limit > 0) member.shopPurchases[item.id] = bought + 1;
      team.updatedAt = new Date().toISOString();
      saveTeamsDb(db);
      return sendJson(res, 200, { ok: true, item, team: publicTeamWithRank(team, user.id, true) });
    }
    if (req.method === "GET" && new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname === "/api/leaderboard/my-rank") {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const requestedMetric = url.searchParams.get("metric");
      const metric = LEADERBOARD_METRICS.has(requestedMetric)
        ? requestedMetric
        : "battlePower";
      const pageSize = normalizeLeaderboardPageSize(url.searchParams.get("pageSize"));
      const user = currentUser(req);
      const viewerUserId = safeUserName(url.searchParams.get("viewerUserId"));
      const viewerUsername = safeUserName(url.searchParams.get("viewerUsername"));
      const rows = buildRankedLeaderboardRows(metric);
      const myRank = rows.find((row) => (
        (user && row.userId === user.id) ||
        (viewerUserId && row.userId === viewerUserId) ||
        (viewerUsername && String(row.username || "").toLowerCase() === viewerUsername.toLowerCase())
      )) || null;
      return sendJson(res, 200, {
        ok: true,
        metric,
        pageSize,
        myRank,
        myPage: myRank ? Math.max(1, Math.ceil(myRank.rank / pageSize)) : null
      });
    }
    if (req.method === "GET" && new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname === "/api/leaderboard") {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      const requestedMetric = url.searchParams.get("metric");
      const metric = LEADERBOARD_METRICS.has(requestedMetric)
        ? requestedMetric
        : "battlePower";
      const pageSize = normalizeLeaderboardPageSize(url.searchParams.get("pageSize"));
      const page = Math.max(1, Math.floor(Number(url.searchParams.get("page")) || 1));
      const rows = buildRankedLeaderboardRows(metric);
      const total = rows.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(page, totalPages);
      return sendJson(res, 200, {
        ok: true,
        filtered: true,
        metric,
        page: safePage,
        pageSize,
        pageSizeOptions: LEADERBOARD_PAGE_SIZE_OPTIONS,
        total,
        totalPages,
        rows: rows.slice((safePage - 1) * pageSize, safePage * pageSize)
      });
    }
    if (req.method === "GET" && req.url === "/api/save") {
      const user = requireUser(req, res);
      if (!user) return;
      let save = readJsonFile(userSaveFile(user.id), null);
      const normalized = normalizeSaveForUser(user, save);
      if (normalized !== save) {
        save = normalized;
        writeJsonFile(userSaveFile(user.id), save);
      }
      return sendJson(res, 200, { ok: true, save, user: publicUser(user) });
    }
    if (req.method === "POST" && new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname === "/api/save") {
      const user = requireUser(req, res);
      if (!user) return;
      const body = await readBody(req);
      if (!body || typeof body.save !== "object" || Array.isArray(body.save)) {
        return sendJson(res, 400, { ok: false, message: "存档数据格式不正确。" });
      }
      ensureDir(userSaveDir(user.id));
      const payload = {
        userId: user.id,
        username: user.username,
        savedAt: new Date().toISOString(),
        save: body.save
      };
      const normalized = normalizeSaveForUser(user, payload);
      writeJsonFile(userSaveFile(user.id), normalized);
      return sendJson(res, 200, { ok: true, savedAt: normalized.savedAt, saveDir: `server/data/saves/${user.id}` });
    }
    sendJson(res, 404, { ok: false, message: "API不存在。" });
  } catch (err) {
    sendJson(res, 500, { ok: false, message: err && err.message ? err.message : "服务器错误。" });
  }
};

const startServer = (port = PORT, callback = null) => {
  ensureDir(DATA_DIR);
  ensureDir(SAVE_ROOT);
  if (!fs.existsSync(USERS_FILE)) writeJsonFile(USERS_FILE, { users: [] });
  if (!fs.existsSync(TEAMS_FILE)) writeJsonFile(TEAMS_FILE, { teams: [] });
  ensureTestAccount();
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "null",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Aola-Session"
      });
      res.end();
      return;
    }
    if (pathname.startsWith("/api/")) return handleApi(req, res);
    return serveStatic(req, res);
  });
  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(`[server:port-in-use] Port ${port} is already in use.`);
      console.error(`[server:port-in-use] Close the existing process or start another port, for example: $env:PORT=3031; npm run server`);
      return;
    }
    console.error(err);
  });
  server.listen(port, () => {
    console.log(`Aola Star Hub server running at http://localhost:${port}`);
    if (typeof callback === "function") callback(server);
  });
  return server;
};

if (require.main === module) {
  startServer(PORT);
}

module.exports = { startServer };
