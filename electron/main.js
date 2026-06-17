const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
const fs = require("fs");
const http = require("http");
const https = require("https");
const net = require("net");
const path = require("path");
const { pathToFileURL } = require("url");

let localServer = null;
let isQuitting = false;
let resourceBootstrapStatus = {
  ready: false,
  percent: 0,
  message: "正在准备本机资源...",
  error: ""
};

const DEFAULT_BACKEND_PORT = 3030;
const MAX_PORT_ATTEMPTS = 50;
const RESOURCE_BOOTSTRAP_CONFIG = path.join(__dirname, "../resource-bootstrap.config.json");
const RESOURCE_PATH_PREFIXES = [
  "BGM/",
  "boss-level/",
  "fight-ui/",
  "hub 守护者联盟勋章/",
  "pet-action/",
  "pet-img/",
  "pet-state/",
  "skill-effect/",
  "skill-effect-fullscreen/",
  "time-tunnel-environments/",
  "type/",
  "type-transparent/",
  "ui/",
  "vendor/",
  "地台boss/",
  "小图标/"
];

const readJsonFile = (file, fallback) => {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const desktopAppUrl = () => {
  const config = readJsonFile(RESOURCE_BOOTSTRAP_CONFIG, {});
  return String(process.env.AOLA_DESKTOP_APP_URL || config.desktopAppUrl || "").trim();
};

const defaultResourceZipUrl = (appUrl) => {
  try {
    return appUrl ? new URL("/resource.zip", appUrl).href : "";
  } catch {
    return "";
  }
};

const desktopResourceConfig = (appUrl = "") => {
  const config = readJsonFile(RESOURCE_BOOTSTRAP_CONFIG, {});
  const resourceZipUrl = String(process.env.AOLA_RESOURCE_ZIP_URL || config.resourceZipUrl || defaultResourceZipUrl(appUrl)).trim();
  const resourceDir = process.env.AOLA_DESKTOP_RESOURCE_DIR || path.join(app.getPath("userData"), "resources");
  return {
    enabled: String(process.env.AOLA_DESKTOP_RESOURCE_BOOTSTRAP || config.desktopEnabled || config.enabled || (resourceZipUrl ? "true" : "false")) !== "false",
    resourceZipUrl,
    resourceDir,
    zipFile: path.join(app.getPath("userData"), "resource.zip"),
    readyFile: path.join(resourceDir, ".resource-ready.json")
  };
};

const installLocalResourceInterceptor = (win, resourceDir) => {
  const ses = win && win.webContents && win.webContents.session;
  if (!ses || !resourceDir) return;
  const root = path.resolve(resourceDir);
  ses.webRequest.onBeforeRequest({ urls: ["http://*/*", "https://*/*"] }, (details, callback) => {
    try {
      const parsed = new URL(details.url);
      const rel = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
      if (!RESOURCE_PATH_PREFIXES.some((prefix) => rel.startsWith(prefix))) {
        callback({});
        return;
      }
      const localFile = path.resolve(root, rel);
      if (!localFile.startsWith(`${root}${path.sep}`) || !fs.existsSync(localFile)) {
        callback({});
        return;
      }
      callback({ redirectURL: pathToFileURL(localFile).href });
    } catch {
      callback({});
    }
  });
};

const emitResourceProgress = (win, payload) => {
  resourceBootstrapStatus = {
    ...resourceBootstrapStatus,
    ...(payload || {})
  };
  if (!win || win.isDestroyed()) return;
  win.webContents.send("aola:resource-bootstrap-progress", resourceBootstrapStatus);
};

const downloadFile = (url, outFile, onProgress, redirectCount = 0) => new Promise((resolve, reject) => {
  if (redirectCount > 5) return reject(new Error("Too many redirects while downloading resource.zip."));
  const parsed = new URL(url);
  const client = parsed.protocol === "http:" ? http : https;
  ensureDir(path.dirname(outFile));
  const tempFile = `${outFile}.download`;
  const req = client.get(parsed, (res) => {
    if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
      res.resume();
      const nextUrl = new URL(res.headers.location, parsed).href;
      downloadFile(nextUrl, outFile, onProgress, redirectCount + 1).then(resolve, reject);
      return;
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => reject(new Error(`Download failed with ${res.statusCode}: ${Buffer.concat(chunks).toString("utf8").slice(0, 300)}`)));
      return;
    }
    const total = Number(res.headers["content-length"]) || 0;
    let downloaded = 0;
    const stream = fs.createWriteStream(tempFile);
    res.on("data", (chunk) => {
      downloaded += chunk.length;
      if (typeof onProgress === "function") onProgress(downloaded, total);
    });
    stream.on("error", reject);
    res.on("error", reject);
    stream.on("finish", () => {
      fs.renameSync(tempFile, outFile);
      resolve({ downloadedBytes: downloaded, totalBytes: total });
    });
    res.pipe(stream);
  });
  req.on("error", reject);
});

const ensureDesktopResources = async (win, appUrl = "") => {
  const config = desktopResourceConfig(appUrl);
  if (!config.enabled) {
    emitResourceProgress(win, { ready: true, percent: 100, message: "资源引导未启用。" });
    return config;
  }
  process.env.AOLA_STATIC_RESOURCE_DIR = config.resourceDir;
  if (fs.existsSync(config.readyFile)) {
    emitResourceProgress(win, { ready: true, percent: 100, message: "本机资源已准备完成。" });
    return config;
  }
  if (!config.resourceZipUrl) {
    throw new Error("请在 resource-bootstrap.config.json 中配置 resourceZipUrl。");
  }
  ensureDir(config.resourceDir);
  emitResourceProgress(win, { ready: false, percent: 1, message: "正在下载资源包..." });
  await downloadFile(config.resourceZipUrl, config.zipFile, (downloaded, total) => {
    const percent = total > 0 ? Math.max(1, Math.min(82, Math.floor((downloaded / total) * 82))) : 8;
    emitResourceProgress(win, {
      ready: false,
      percent,
      message: total > 0
        ? `正在下载资源包 ${Math.floor(downloaded / 1024 / 1024)}MB / ${Math.floor(total / 1024 / 1024)}MB`
        : "正在下载资源包..."
    });
  });
  emitResourceProgress(win, { ready: false, percent: 88, message: "正在解压资源包..." });
  const extract = require("extract-zip");
  await extract(config.zipFile, { dir: config.resourceDir });
  fs.writeFileSync(config.readyFile, JSON.stringify({
    ok: true,
    resourceZipUrl: config.resourceZipUrl,
    resourceDir: config.resourceDir,
    finishedAt: new Date().toISOString()
  }, null, 2), "utf8");
  emitResourceProgress(win, { ready: true, percent: 100, message: "本机资源已准备完成。" });
  return config;
};

const normalizePort = (value) => {
  const port = Number(value) || DEFAULT_BACKEND_PORT;
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : DEFAULT_BACKEND_PORT;
};

const isPortAvailable = (port) => new Promise((resolve) => {
  const probe = net.createServer();
  probe.once("error", () => resolve(false));
  probe.once("listening", () => {
    probe.close(() => resolve(true));
  });
  probe.listen(port);
});

const findAvailableBackendPort = async (preferredPort) => {
  const startPort = normalizePort(preferredPort);
  const endPort = Math.min(startPort + MAX_PORT_ATTEMPTS - 1, 65535);
  for (let port = startPort; port <= endPort; port += 1) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available local backend port in range ${startPort}-${endPort}.`);
};

const startLocalBackend = async () => {
  process.env.AOLA_DATA_DIR = path.join(app.getPath("userData"), "data");
  process.env.AOLA_STATIC_RESOURCE_DIR = process.env.AOLA_STATIC_RESOURCE_DIR || path.join(app.getPath("userData"), "resources");
  const port = await findAvailableBackendPort(process.env.PORT);
  process.env.PORT = String(port);
  const { startServer } = require("../server/index");
  return new Promise((resolve, reject) => {
    try {
      localServer = startServer(port, () => resolve(port));
      localServer.once("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

const configureDisplayMediaCapture = (win) => {
  const ses = win && win.webContents && win.webContents.session;
  if (!ses || typeof ses.setDisplayMediaRequestHandler !== "function") return;
  ses.setDisplayMediaRequestHandler(async (_request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ["screen", "window"],
        thumbnailSize: { width: 0, height: 0 }
      });
      const source = sources.find((item) => item && String(item.id || "").startsWith("screen:")) || sources[0];
      callback(source ? { video: source } : {});
    } catch (err) {
      console.error("[display-media:capture-failed]", err);
      callback({});
    }
  });
};

const createWindow = (targetUrl) => {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 640,
    icon: path.join(__dirname, "../build/Aola-Star-Hub-icon.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js")
    }
  });
  configureDisplayMediaCapture(win);
  win.__allowCloseAfterSave = false;
  win.on("close", (event) => {
    if (isQuitting || win.__allowCloseAfterSave || win.isDestroyed()) return;
    event.preventDefault();
    let finished = false;
    const finishClose = () => {
      if (finished || win.isDestroyed()) return;
      finished = true;
      win.__allowCloseAfterSave = true;
      win.close();
    };
    const timeout = setTimeout(finishClose, 5000);
    ipcMain.once(`aola:auto-save-done:${win.id}`, () => {
      clearTimeout(timeout);
      finishClose();
    });
    win.webContents.send("aola:auto-save-before-close", { windowId: win.id });
  });
  win.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`);
  });
  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[renderer:load-failed] ${errorCode} ${errorDescription} ${validatedURL}`);
  });
  win.webContents.on("render-process-gone", (_event, details) => {
    console.error(`[renderer:gone] ${JSON.stringify(details)}`);
  });
  win.on("unresponsive", () => {
    console.error("[window:unresponsive]");
  });
  const resourceConfig = desktopResourceConfig(targetUrl);
  installLocalResourceInterceptor(win, resourceConfig.resourceDir);
  win.loadURL(targetUrl);
  ensureDesktopResources(win, targetUrl).catch((err) => {
    console.error("[resource-bootstrap:failed]", err);
    emitResourceProgress(win, {
      ready: false,
      error: err && err.message ? err.message : String(err || "Unknown error"),
      percent: 0,
      message: "资源准备失败。"
    });
  });
};

app.whenReady().then(async () => {
  try {
    ipcMain.handle("aola:resource-bootstrap-status", () => resourceBootstrapStatus);
    const remoteAppUrl = desktopAppUrl();
    if (remoteAppUrl) {
      createWindow(remoteAppUrl);
      return;
    }
    const backendPort = await startLocalBackend();
    createWindow(`http://127.0.0.1:${backendPort}/aola-star.html`);
  } catch (err) {
    console.error("[main:backend-start-failed]", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  isQuitting = true;
  if (localServer) localServer.close();
});
