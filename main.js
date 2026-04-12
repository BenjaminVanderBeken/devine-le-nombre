const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// --- État du jeu (dans le main process → inaccessible au renderer) ---
let secret = null;
let essais = 0;

// --- Chemin du fichier de scores ---
const scoresPath = path.join(app.getPath("userData"), "scores.json");

// --- Fonctions utilitaires pour les scores ---
function lireScores() {
  try {
    if (fs.existsSync(scoresPath)) {
      const data = fs.readFileSync(scoresPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Erreur lecture scores :", err);
  }
  return [];
}

function sauverScores(scores) {
  try {
    fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2), "utf-8");
  } catch (err) {
    console.error("Erreur sauvegarde scores :", err);
  }
}

// --- Handlers IPC ---

// guess:start → Démarre une nouvelle partie
ipcMain.handle("guess:start", () => {
  secret = Math.floor(Math.random() * 100) + 1;
  essais = 0;
  return { ok: true };
});

// guess:check → Vérifie un nombre proposé
ipcMain.handle("guess:check", (_event, nombre) => {
  if (secret === null) {
    return { erreur: "Aucune partie en cours. Lance une nouvelle partie." };
  }

  essais++;

  if (nombre > secret) {
    return { resultat: "trop_grand", essais };
  } else if (nombre < secret) {
    return { resultat: "trop_petit", essais };
  } else {
    const resultat = { resultat: "gagne", essais };
    secret = null; // Partie terminée
    return resultat;
  }
});

// score:save → Sauvegarde un score
ipcMain.handle("score:save", (_event, { nom, essais }) => {
  const scores = lireScores();
  scores.push({ nom, essais, date: new Date().toISOString() });
  // Trier par nombre d'essais (croissant) et garder les 5 meilleurs
  scores.sort((a, b) => a.essais - b.essais);
  const top5 = scores.slice(0, 5);
  sauverScores(top5);
  return { ok: true };
});

// score:getAll → Récupère les 5 meilleurs scores
ipcMain.handle("score:getAll", () => {
  const scores = lireScores();
  return scores.slice(0, 5);
});

// --- Création de la fenêtre ---
function createWindow() {
  const win = new BrowserWindow({
    width: 500,
    height: 750,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});