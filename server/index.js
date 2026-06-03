const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = process.env.AOLA_DATA_DIR || path.join(__dirname, "data");
const SAVE_ROOT = path.join(DATA_DIR, "saves");
const USERS_FILE = path.join(DATA_DIR, "users.json");
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
    return fallback;
  }
};

const writeJsonFile = (file, data) => {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
};

const usersDb = () => {
  const raw = readJsonFile(USERS_FILE, { users: [] });
  return { users: Array.isArray(raw.users) ? raw.users : [] };
};

const saveUsersDb = (db) => writeJsonFile(USERS_FILE, db);

const safeUserName = (name) => String(name || "").trim();

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
const TEST_MAX_DEX_ID = 1960;

const publicUser = (user) => ({
  id: user.id,
  username: user.username,
  saveDir: `server/data/saves/${user.id}`
});

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
  const bagPetIds = Array.isArray(save.bagPetIds)
    ? save.bagPetIds.filter((id) => seedPetIds.has(String(id || ""))).slice(0, 6)
    : [];
  seed.bagPetIds.forEach((id) => {
    if (bagPetIds.length < 6 && id && !bagPetIds.includes(id)) bagPetIds.push(id);
  });
  while (bagPetIds.length < 6) bagPetIds.push("");
  const selectedPetId = seedPetIds.has(String(save.selectedPetId || "")) ? save.selectedPetId : (bagPetIds.find(Boolean) || seed.selectedPetId);
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

const normalizeSaveForUser = (user, payload) => {
  const save = payload && typeof payload.save === "object" && !Array.isArray(payload.save) ? payload.save : null;
  if (!user || user.id !== TEST_USER_ID || !save) return payload;
  const normalizedSave = normalizeTestSavePayload(payload);
  if (normalizedSave === save) return payload;
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
    const normalizedSave = normalizeTestSavePayload(current);
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
        save: normalizeTestSavePayload(legacy)
      });
      return;
    }
  }
  writeJsonFile(currentSaveFile, {
    userId: user.id,
    username: user.username,
    savedAt: new Date().toISOString(),
    save: createTestSaveState()
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

const serveStatic = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/aola-star.html";
  const full = path.normalize(path.join(ROOT_DIR, rel));
  if (!full.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
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
      ".gif": "image/gif",
      ".ogg": "audio/ogg"
    };
    res.writeHead(200, {
      "Content-Type": typeMap[ext] || "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
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
      writeJsonFile(userSaveFile(user.id), payload);
      return sendJson(res, 200, { ok: true, savedAt: payload.savedAt, saveDir: `server/data/saves/${user.id}` });
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
      console.error(`端口 ${port} 已被占用。`);
      console.error(`如果已打开桌面版，请直接访问 http://localhost:${port}/aola-star.html，或关闭桌面版后重新启动服务。`);
      console.error("也可以使用其他端口启动，例如：$env:PORT=3031; npm run server");
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
