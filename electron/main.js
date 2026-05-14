const { app, BrowserWindow } = require("electron");
const path = require("path");

let localServer = null;

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
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
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
  if (localServer) localServer.close();
});
