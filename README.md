# devine-le-nombre
# Devine le Nombre — Version 2 (avec IPC)

## Description

Application desktop Electron dans laquelle l'utilisateur doit deviner un nombre mystère entre 1 et 100.

Dans cette version, **toute la logique du jeu est dans le Main Process** (`main.js`).
Le renderer (`renderer/app.js`) ne fait qu'afficher l'interface et communiquer via **IPC** (Inter-Process Communication).
Le `preload.js` expose un objet `guessService` au renderer grâce à `contextBridge`.

## Fonctionnalités

- Saisie d'un nombre via un champ `<input>` avec gestion de la touche **Enter** (`keydown`)
- Affichage dynamique des tentatives (ajout d'éléments dans le DOM avec `createElement` / `appendChild`)
- Compteur d'essais affiché en temps réel
- Feedback visuel : message en **rouge** (trop grand / trop petit) ou **vert** (gagné) avec `classList`
- Bouton **"Nouvelle partie"** qui remet tout à zéro
- **Sauvegarde des scores** dans un fichier JSON (persistance via Node.js)
- **Tableau des 5 meilleurs scores** affiché en temps réel

## Structure du projet

```
v2-ipc/
├── package.json        # Configuration npm + script de démarrage
├── main.js             # Logique du jeu + handlers IPC + gestion des scores
├── preload.js          # contextBridge → expose guessService au renderer
├── .gitignore          # Exclut node_modules/
└── renderer/
    ├── index.html      # Interface utilisateur (HTML + CSS)
    └── app.js          # Affichage uniquement, appels via window.guessService
```

## Canaux IPC

| Canal          | Direction         | Description                                       |
|----------------|-------------------|---------------------------------------------------|
| `guess:start`  | renderer → main   | Démarre une nouvelle partie (génère un nombre secret) |
| `guess:check`  | renderer → main   | Envoie un nombre, reçoit `trop_grand`, `trop_petit` ou `gagne` + nombre d'essais |
| `score:save`   | renderer → main   | Envoie le nom du joueur + nombre d'essais, sauvegarde dans un fichier JSON |
| `score:getAll` | renderer → main   | Récupère les 5 meilleurs scores depuis le fichier JSON |

## Installation et lancement

```bash
npm install
npm start
```

## Sécurité — Ce que ça prouve

Ouvrez les DevTools avec **F12** et tapez dans la console :

```js
window.guessService         // → vous voyez l'objet exposé (start, check, saveScore, getScores)
window.guessService.secret  // → undefined
```

Le nombre mystère est une variable locale dans `main.js`. Le renderer **n'y a aucun accès**.
C'est le principe du **Main Process comme backend sécurisé**.

## Différences avec la Version 1

| Aspect                  | V1 (sans IPC)                     | V2 (avec IPC)                        |
|-------------------------|-----------------------------------|--------------------------------------|
| Logique du jeu          | Dans le renderer (`app.js`)       | Dans le main process (`main.js`)     |
| Nombre secret           | Accessible via la console (F12)   | Inaccessible (`undefined`)           |
| `preload.js`            | Vide                              | Expose `guessService` via `contextBridge` |
| Communication           | Aucune (tout local)               | IPC avec `ipcMain.handle` / `ipcRenderer.invoke` |
| Persistance des scores  | Non                               | Oui (fichier JSON via `fs`)          |

## Technologies utilisées

- **Electron** — Framework pour applications desktop
- **IPC** — Communication inter-processus (`ipcMain.handle` / `ipcRenderer.invoke`)
- **contextBridge** — Exposition sécurisée d'une API au renderer
- **Node.js (fs)** — Lecture/écriture de fichiers JSON pour la persistance
- **JavaScript** — Manipulation du DOM (addEventListener, createElement, classList)
- **HTML / CSS** — Interface utilisateur
