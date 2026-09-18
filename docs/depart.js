// Ce que l'app contient le tout premier jour, avant que Samer n'y touche.
//
// Tout est modifiable depuis l'écran Réglages : ces valeurs sont un point de
// départ, pas une règle. Elles viennent des réponses du 18/09/2026 — le corps
// comme colonne vertébrale, les cinq prières une par une, les adhkâr matin et
// soir, et l'argent tourné vers l'objectif plutôt que vers la dépense.

export const REGLAGES_DEPART = {
  identite: 'Je tiens parole, surtout quand personne ne regarde.',
  heureBascule: 17,
  habitudes: [
    // Le corps — c'est lui qui tire les autres. Trois choses, pas dix.
    { id: 'manger', domaine: 'corps', libelle: 'Manger propre', detail: 'pas de sucre ajouté', type: 'oui-non', actif: true },
    { id: 'bouger', domaine: 'corps', libelle: 'Bouger', detail: '20 minutes, même en marchant', type: 'oui-non', actif: true },
    { id: 'eau', domaine: 'corps', libelle: "L'eau", type: 'compteur', objectif: 8, unite: 'verres', actif: true },

    // La religion — les cinq, une par une. C'est le suivi le plus honnête :
    // un relâchement s'y voit en trois jours, là où un total quotidien le cache.
    { id: 'fajr', domaine: 'religion', libelle: 'Fajr', type: 'priere', actif: true },
    { id: 'dohr', domaine: 'religion', libelle: 'Dohr', type: 'priere', actif: true },
    { id: 'asr', domaine: 'religion', libelle: 'Asr', type: 'priere', actif: true },
    { id: 'maghrib', domaine: 'religion', libelle: 'Maghrib', type: 'priere', actif: true },
    { id: 'icha', domaine: 'religion', libelle: 'Icha', type: 'priere', actif: true },
    { id: 'adhkar_matin', domaine: 'religion', libelle: 'Adhkâr du matin', type: 'oui-non', moment: 'matin', actif: true },
    { id: 'adhkar_soir', domaine: 'religion', libelle: 'Adhkâr du soir', type: 'oui-non', moment: 'soir', actif: true },

    // La tête — une seule, et volontairement petite.
    { id: 'lecture', domaine: 'tete', libelle: 'Lire', detail: '10 pages', type: 'oui-non', actif: true },
  ],
  projets: ['Petit Gâteau', 'Merkhet', 'Conduite'],
};

export const DOMAINES = {
  corps: { libelle: 'Le corps', couleur: 'corps' },
  religion: { libelle: 'La religion', couleur: 'religion' },
  tete: { libelle: 'La tête', couleur: 'tete' },
};

export const ARGENT_DEPART = {
  objectif: { montant: 0, echeance: '2027-12-31', libelle: 'Indépendance' },
  placements: [],
  mois: {},
};
