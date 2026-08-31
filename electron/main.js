const { app, BrowserWindow, ipcMain, desktopCapturer, dialog } = require("electron");
const net = require("net");
const path = require("path");

let localServer = null;

const DEFAULT_BACKEND_PORT = 3030;
const MAX_PORT_ATTEMPTS = 50;
const DESKTOP_SAVE_MAX_ATTEMPTS = 5;

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
  win.__closeSavePending = false;
  win.on("close", (event) => {
    if (win.__allowCloseAfterSave || win.isDestroyed()) return;
    event.preventDefault();
    if (win.__closeSavePending) return;
    win.__closeSavePending = true;
    let finished = false;
    const doneChannel = `aola:auto-save-done:${win.id}`;
    const cancelChannel = `aola:auto-save-cancel:${win.id}`;
    const cleanup = () => {
      ipcMain.removeListener(doneChannel, handleSaveResult);
      ipcMain.removeListener(cancelChannel, cancelClose);
    };
    const finishClose = () => {
      if (finished || win.isDestroyed()) return;
      finished = true;
      cleanup();
      win.__allowCloseAfterSave = true;
      win.close();
    };
    const cancelClose = () => {
      if (finished || win.isDestroyed()) return;
      cleanup();
      win.__closeSavePending = false;
      win.focus();
    };
    const handleSaveResult = async (_event, result = {}) => {
      if (result && result.ok === true) {
        finishClose();
        return;
      }
      const attempts = Math.min(DESKTOP_SAVE_MAX_ATTEMPTS, Math.max(1, Number(result && result.attempts) || DESKTOP_SAVE_MAX_ATTEMPTS));
      const detail = result && result.error ? `\n\n错误信息：${result.error}` : "";
      const confirmation = await dialog.showMessageBox(win, {
        type: "warning",
        buttons: ["取消", "确认退出"],
        defaultId: 0,
        cancelId: 0,
        title: "存档异常",
        message: `存档已连续失败 ${attempts} 次，是否仍要退出应用？`,
        detail: `选择“取消”将返回应用，您可以检查网络或手动存档后再退出。${detail}`
      });
      if (confirmation.response === 1) finishClose();
      else cancelClose();
    };
    ipcMain.once(doneChannel, handleSaveResult);
    ipcMain.once(cancelChannel, cancelClose);
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
    const localAppUrl = `http://127.0.0.1:${backendPort}/aola-star.html`;
    console.log(`[main:local-app] mode=production ${localAppUrl}`);
    createWindow(localAppUrl);
  } catch (err) {
    console.error("[main:backend-start-failed]", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  if (localServer) localServer.close();
});
