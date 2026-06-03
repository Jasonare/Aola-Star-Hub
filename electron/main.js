const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let localServer = null;
let isQuitting = false;

const startLocalBackend = () => {
  process.env.AOLA_DATA_DIR = path.join(app.getPath("userData"), "data");
  const { startServer } = require("../server/index");
  localServer = startServer(Number(process.env.PORT) || 3030);
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 640,
    icon: path.join(__dirname, "../build/Aola-Star-Hub-icon.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });
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
  win.loadURL(`http://localhost:${process.env.PORT || 3030}/aola-star.html`);
};

app.whenReady().then(() => {
  startLocalBackend();
  setTimeout(createWindow, 600);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  isQuitting = true;
  if (localServer) localServer.close();
});
