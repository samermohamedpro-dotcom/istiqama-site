// Le stockage. Tout reste dans le téléphone : aucun compte, aucun serveur,
// aucune requête réseau. Une application qui porte des prières et de l'argent
// n'a aucune raison d'envoyer quoi que ce soit quelque part.
//
// La contrepartie est écrite en toutes lettres dans le README : effacer les
// données de Safari efface l'application. D'où la sauvegarde, ci-dessous, et
// le rappel que l'écran affiche quand elle date trop.

import { REGLAGES_DEPART, ARGENT_DEPART } from './depart.js';

const CLE = 'istiqama.v1';

// La forme complète d'un classeur vide. Toute lecture passe par ici, donc
// toute donnée absente prend sa valeur de départ — y compris chez quelqu'un
// qui a ouvert l'app avant qu'une habitude n'existe.
export function classeurVide() {
  return {
    version: 1,
    jours: {},
    reglages: structuredClone(REGLAGES_DEPART),
    argent: structuredClone(ARGENT_DEPART),
    derniereSauvegarde: null,
  };
}

// Fusion volontairement peu maligne : on complète ce qui manque, on n'écrase
// jamais ce qui existe. Le jour où une habitude est ajoutée au départ, elle
// apparaît chez Samer sans effacer les siennes.
export function completer(brut) {
  const vide = classeurVide();
  if (!brut || typeof brut !== 'object') return vide;
  const classeur = {
    ...vide,
    ...brut,
    jours: brut.jours || {},
    reglages: { ...vide.reglages, ...(brut.reglages || {}) },
    argent: { ...vide.argent, ...(brut.argent || {}) },
  };
  if (!Array.isArray(classeur.reglages.habitudes) || classeur.reglages.habitudes.length === 0) {
    classeur.reglages.habitudes = vide.reglages.habitudes;
  }
  if (!Array.isArray(classeur.reglages.projets)) classeur.reglages.projets = vide.reglages.projets;
  if (!Array.isArray(classeur.argent.placements)) classeur.argent.placements = [];
  if (!classeur.argent.mois || typeof classeur.argent.mois !== 'object') classeur.argent.mois = {};
  return classeur;
}

export function lire(stockage = globalThis.localStorage) {
  try {
    const brut = stockage?.getItem(CLE);
    if (!brut) return classeurVide();
    return completer(JSON.parse(brut));
  } catch {
    // Un stockage refusé (navigation privée, réglages bloqués) ne doit pas
    // faire un écran blanc : l'app tourne, elle ne retiendra simplement rien.
    return classeurVide();
  }
}

export function ecrire(classeur, stockage = globalThis.localStorage) {
  try {
    stockage?.setItem(CLE, JSON.stringify(classeur));
    return true;
  } catch {
    return false;
  }
}

// La sauvegarde est un simple fichier JSON, lisible à l'œil nu. Pas d'archive,
// pas de format à nous : dans trois ans, un fichier JSON s'ouvre encore.
export function nomDeSauvegarde(cleJour) {
  return `istiqama-${cleJour}.json`;
}

export function versTexte(classeur) {
  return JSON.stringify(classeur, null, 2);
}

// Une restauration qui n'est pas un classeur Istiqama doit être REFUSÉE, pas
// devinée. Charger un fichier quelconque écraserait tout en silence.
export function depuisTexte(texte) {
  const brut = JSON.parse(texte);
  if (!brut || typeof brut !== 'object' || typeof brut.jours !== 'object' || brut.jours === null) {
    throw new Error("Ce fichier n'est pas une sauvegarde Istiqama.");
  }
  return completer(brut);
}
