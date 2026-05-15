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
  const token = parseCookies(req).aola_session || bearer || String(req.headers["x-aola-session"] || "");
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
      const save = readJsonFile(userSaveFile(user.id), null);
      return sendJson(res, 200, { ok: true, save, user: publicUser(user) });
    }
    if (req.method === "POST" && req.url === "/api/save") {
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
