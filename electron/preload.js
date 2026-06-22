const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aolaDesktop", {
  useLocalResources: true,
  onAutoSaveBeforeClose(handler) {
    if (typeof handler !== "function") return () => {};
    const listener = (_event, payload) => handler(payload || {});
    ipcRenderer.on("aola:auto-save-before-close", listener);
    return () => ipcRenderer.removeListener("aola:auto-save-before-close", listener);
  },
  autoSaveDone(windowId) {
    ipcRenderer.send(`aola:auto-save-done:${windowId}`);
  }
});
