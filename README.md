# devine-le-nombre
Devine le Nombre — Version 1 (sans IPC)
Description
Application desktop Electron dans laquelle l'utilisateur doit deviner un nombre mystère entre 1 et 100.
Dans cette version, toute la logique du jeu se trouve dans le renderer (renderer/app.js).
Le fichier main.js ne fait que créer la fenêtre Electron. Le fichier preload.js est vide.
Fonctionnalités

Saisie d'un nombre via un champ <input> avec gestion de la touche Enter (keydown)
Affichage dynamique des tentatives (ajout d'éléments dans le DOM avec createElement / appendChild)
Compteur d'essais affiché en temps réel
Feedback visuel : message en rouge (trop grand / trop petit) ou vert (gagné) avec classList
Bouton "Nouvelle partie" qui remet tout à zéro

Structure du projet
v1-renderer/
├── package.json        # Configuration npm + script de démarrage
├── main.js             # Crée la fenêtre BrowserWindow uniquement
├── preload.js          # Vide (rien exposé via contextBridge)
├── /         
└── renderer/
    ├── index.html      # Interface utilisateur (HTML + CSS)
    └── app.js          # Toute la logique du jeu (génération, comparaison, DOM)
Installation et lancement
bashnpm install
npm start
Problème de sécurité
Ouvrez les DevTools avec F12 et tapez dans la console :
jssecret
Le nombre mystère s'affiche directement. La variable secret est déclarée dans le scope global du renderer, donc n'importe qui peut tricher.
C'est ce problème que la Version 2 (avec IPC) résout en déplaçant la logique dans le Main Process.
Technologies utilisées

Electron — Framework pour applications desktop
JavaScript — Logique du jeu (Math.random, addEventListener, DOM manipulation)
HTML / CSS — Interface utilisateur
