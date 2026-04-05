// app.js — Version 2 (avec IPC)
// Le renderer ne contient AUCUNE logique de jeu.
// Tout passe par window.guessService (exposé via contextBridge).

let partieTerminee = false;

// Éléments du DOM
const inputNombre = document.getElementById("inputNombre");
const btnDeviner = document.getElementById("btnDeviner");
const btnNouvelle = document.getElementById("btnNouvelle");
const message = document.getElementById("message");
const compteurEssais = document.getElementById("compteurEssais");
const historique = document.getElementById("historique");
const sectionVictoire = document.getElementById("sectionVictoire");
const inputNom = document.getElementById("inputNom");
const btnSaveScore = document.getElementById("btnSaveScore");
const tableauScores = document.getElementById("tableauScores");

// --- Démarrer une partie au lancement ---
async function demarrerPartie() {
  await window.guessService.start();
  partieTerminee = false;

  compteurEssais.textContent = "0";
  message.textContent = "";
  message.className = "";
  historique.innerHTML = "";
  sectionVictoire.style.display = "none";
  inputNom.value = "";

  inputNombre.value = "";
  inputNombre.disabled = false;
  btnDeviner.disabled = false;
  inputNombre.focus();

  await afficherScores();
}

// --- Deviner ---
async function deviner() {
  if (partieTerminee) return;

  const valeur = parseInt(inputNombre.value);

  if (isNaN(valeur) || valeur < 1 || valeur > 100) {
    message.textContent = "Entre un nombre entre 1 et 100 !";
    message.className = "trop";
    return;
  }

  // Envoyer au main process via IPC
  const reponse = await window.guessService.check(valeur);

  if (reponse.erreur) {
    message.textContent = reponse.erreur;
    message.className = "trop";
    return;
  }

  compteurEssais.textContent = reponse.essais;

  let indice = "";
  let classeIndice = "";

  if (reponse.resultat === "trop_grand") {
    indice = "Trop grand";
    classeIndice = "haut";
    message.textContent = "📈 Trop grand !";
    message.className = "trop";
  } else if (reponse.resultat === "trop_petit") {
    indice = "Trop petit";
    classeIndice = "bas";
    message.textContent = "📉 Trop petit !";
    message.className = "trop";
  } else if (reponse.resultat === "gagne") {
    indice = "Trouvé !";
    classeIndice = "ok";
    message.textContent = `🎉 Bravo ! Trouvé en ${reponse.essais} essai${reponse.essais > 1 ? "s" : ""} !`;
    message.className = "gagne";
    partieTerminee = true;
    inputNombre.disabled = true;
    btnDeviner.disabled = true;

    // Afficher la section pour sauver le score
    sectionVictoire.style.display = "block";
    inputNom.focus();
  }

  ajouterTentative(reponse.essais, valeur, indice, classeIndice);

  inputNombre.value = "";
  if (!partieTerminee) inputNombre.focus();
}

// --- Ajouter un élément dans l'historique ---
function ajouterTentative(numero, valeur, indice, classeIndice) {
  const div = document.createElement("div");
  div.classList.add("tentative");

  const spanNumero = document.createElement("span");
  spanNumero.classList.add("numero");
  spanNumero.textContent = `#${numero}`;

  const spanValeur = document.createElement("span");
  spanValeur.classList.add("valeur");
  spanValeur.textContent = valeur;

  const spanIndice = document.createElement("span");
  spanIndice.classList.add("indice", classeIndice);
  spanIndice.textContent = indice;

  div.appendChild(spanNumero);
  div.appendChild(spanValeur);
  div.appendChild(spanIndice);

  historique.prepend(div);
}

// --- Sauvegarder le score ---
async function sauverScore() {
  const nom = inputNom.value.trim();
  if (!nom) {
    inputNom.style.borderColor = "#e94560";
    return;
  }

  const nbEssais = parseInt(compteurEssais.textContent);
  await window.guessService.saveScore(nom, nbEssais);

  sectionVictoire.style.display = "none";
  await afficherScores();
}

// --- Afficher le tableau des scores ---
async function afficherScores() {
  const scores = await window.guessService.getScores();
  tableauScores.innerHTML = "";

  if (scores.length === 0) {
    const p = document.createElement("p");
    p.classList.add("vide");
    p.textContent = "Aucun score enregistré";
    tableauScores.appendChild(p);
    return;
  }

  const medailles = ["🥇", "🥈", "🥉", "4.", "5."];

  scores.forEach((score, i) => {
    const div = document.createElement("div");
    div.classList.add("score-row");

    const rang = document.createElement("span");
    rang.classList.add("rang");
    rang.textContent = medailles[i] || `${i + 1}.`;

    const nom = document.createElement("span");
    nom.classList.add("nom");
    nom.textContent = score.nom;

    const essais = document.createElement("span");
    essais.classList.add("essais-score");
    essais.textContent = `${score.essais} essai${score.essais > 1 ? "s" : ""}`;

    div.appendChild(rang);
    div.appendChild(nom);
    div.appendChild(essais);
    tableauScores.appendChild(div);
  });
}

// --- Événements ---
btnDeviner.addEventListener("click", deviner);

inputNombre.addEventListener("keydown", (e) => {
  if (e.key === "Enter") deviner();
});

btnNouvelle.addEventListener("click", demarrerPartie);

btnSaveScore.addEventListener("click", sauverScore);

inputNom.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sauverScore();
  inputNom.style.borderColor = "#ddd";
});

// --- Lancement initial ---
demarrerPartie();