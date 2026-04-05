// app.js — Version 1 (sans IPC)
// Toute la logique est ici, dans le renderer.
// Le nombre secret est accessible via la console (F12) → problème de sécurité !

let secret = Math.floor(Math.random() * 100) + 1;
let essais = 0;
let partieTerminee = false;

// Éléments du DOM
const inputNombre = document.getElementById("inputNombre");
const btnDeviner = document.getElementById("btnDeviner");
const btnNouvelle = document.getElementById("btnNouvelle");
const message = document.getElementById("message");
const compteurEssais = document.getElementById("compteurEssais");
const historique = document.getElementById("historique");

// --- Fonction principale : deviner ---
function deviner() {
  if (partieTerminee) return;

  const valeur = parseInt(inputNombre.value);

  if (isNaN(valeur) || valeur < 1 || valeur > 100) {
    message.textContent = "Entre un nombre entre 1 et 100 !";
    message.className = "trop";
    return;
  }

  essais++;
  compteurEssais.textContent = essais;

  let indice = "";
  let classeIndice = "";

  if (valeur > secret) {
    indice = "Trop grand";
    classeIndice = "haut";
    message.textContent = "📈 Trop grand !";
    message.className = "trop";
  } else if (valeur < secret) {
    indice = "Trop petit";
    classeIndice = "bas";
    message.textContent = "📉 Trop petit !";
    message.className = "trop";
  } else {
    indice = "Trouvé !";
    classeIndice = "ok";
    message.textContent = `🎉 Bravo ! Trouvé en ${essais} essai${essais > 1 ? "s" : ""} !`;
    message.className = "gagne";
    partieTerminee = true;
    inputNombre.disabled = true;
    btnDeviner.disabled = true;
  }

  // Ajouter la tentative dans l'historique (DOM dynamique)
  ajouterTentative(essais, valeur, indice, classeIndice);

  // Vider le champ et redonner le focus
  inputNombre.value = "";
  inputNombre.focus();
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

  // Insérer en haut de l'historique
  historique.prepend(div);
}

// --- Nouvelle partie ---
function nouvellePartie() {
  secret = Math.floor(Math.random() * 100) + 1;
  essais = 0;
  partieTerminee = false;

  compteurEssais.textContent = "0";
  message.textContent = "";
  message.className = "";
  historique.innerHTML = "";

  inputNombre.value = "";
  inputNombre.disabled = false;
  btnDeviner.disabled = false;
  inputNombre.focus();
}

// --- Événements ---
btnDeviner.addEventListener("click", deviner);

inputNombre.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    deviner();
  }
});

btnNouvelle.addEventListener("click", nouvellePartie);