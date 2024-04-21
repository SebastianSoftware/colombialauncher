const { contextBridge, ipcRenderer } = require('electron')

const API = {
  sendMsg: (msg) => ipcRenderer.send("message", msg),
  setName: (str) => ipcRenderer.send("namemc", str),
}

contextBridge.exposeInMainWorld("api", API);
