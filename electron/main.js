const { app, BrowserWindow, ipcMain, desktopCapturer } = require("electron");
const net = require("net");
const path = require("path");

let localServer = null;
let isQuitting = false;

const DEFAULT_BACKEND_PORT = 3030;
const MAX_PORT_ATTEMPTS = 50;

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
  process.env.AOLA_DATA_DIR = app.isPackaged
    ? path.join(app.getPath("userData"), "data")
    : path.join(__dirname, "..", "server", "data");
  delete process.env.AOLA_STATIC_RESOURCE_DIR;
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
  win.loadURL(targetUrl);
};

app.whenReady().then(async () => {
  try {
    const backendPort = await startLocalBackend();
    const localAppUrl = `http://127.0.0.1:${backendPort}/aola-star-dev.html`;
    console.log(`[main:local-app] ${localAppUrl}`);
    createWindow(localAppUrl);
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
