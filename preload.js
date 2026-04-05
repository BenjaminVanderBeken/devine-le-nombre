const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("guessService", {
  // Démarre une nouvelle partie
  start: () => ipcRenderer.invoke("guess:start"),

  // Vérifie un nombre proposé
  check: (nombre) => ipcRenderer.invoke("guess:check", nombre),

  // Sauvegarde un score (nom + essais)
  saveScore: (nom, essais) =>
    ipcRenderer.invoke("score:save", { nom, essais }),

  // Récupère les 5 meilleurs scores
  getScores: () => ipcRenderer.invoke("score:getAll"),
});