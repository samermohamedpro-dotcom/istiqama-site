// Le calcul, et RIEN d'autre : aucun accès à l'écran, aucun accès au stockage.
// C'est ce qui rend ce fichier testable en entier par `node tests.mjs`.
//
// Pourquoi tout le calcul est ici plutôt que dans l'écran : un chiffre faux
// dans une courbe de cumul ne se voit pas. Il a l'air d'un chiffre. La seule
// parade est de pouvoir l'éprouver hors de l'écran, sur des journées inventées.

// ---------------------------------------------------------------------------
// Les dates
// ---------------------------------------------------------------------------

// On travaille en date LOCALE, jamais en UTC : `toISOString()` renverrait la
// veille pour tout ce qui est saisi avant 2 h du matin en France l'été. Une
// prière d'Icha cochée à 23 h tomberait sur le mauvais jour, et la chaîne
// casserait sans que rien ne le dise.
export function cleDuJour(date = new Date()) {
  const a = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const j = String(date.getDate()).padStart(2, '0');
  return `${a}-${m}-${j}`;
}

export function dateDepuisCle(cle) {
  const [a, m, j] = cle.split('-').map(Number);
  return new Date(a, m - 1, j);
}

export function cleDecalee(cle, jours) {
  const d = dateDepuisCle(cle);
  d.setDate(d.getDate() + jours);
  return cleDuJour(d);
}

// Les `nb` dernières clés, la plus ancienne d'abord, en finissant par `fin`.
export function clesRecentes(fin, nb) {
  const cles = [];
  for (let i = nb - 1; i >= 0; i--) cles.push(cleDecalee(fin, -i));
  return cles;
}

const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
  'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function moisEnClair(cle) {
  const [a, m] = cle.split('-').map(Number);
  return `${MOIS_FR[m - 1]} ${a}`;
}

export function cleDuMois(cle) {
  return cle.slice(0, 7);
}

// Nombre de mois pleins entre deux clés de jour. Sert à la projection d'argent.
export function moisEntre(depuis, jusqua) {
  const a = dateDepuisCle(depuis);
  const b = dateDepuisCle(jusqua);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

// ---------------------------------------------------------------------------
// Une journée
// ---------------------------------------------------------------------------

export function jourVide() {
  return { tenu: {}, chose: '', choseFaite: false, projets: {}, note: '' };
}

export function habitudesActives(reglages) {
  return reglages.habitudes.filter((h) => h.actif !== false);
}

// Les points d'UNE habitude sur UNE journée, entre 0 et 1.
//
// Une prière rattrapée vaut une moitié, pas zéro : elle a été faite. La mettre
// à zéro rendrait la courbe fausse dans l'autre sens, et surtout ferait mentir
// la chaîne — or c'est la chaîne qui fait tenir.
export function pointsHabitude(habitude, valeur) {
  if (valeur === undefined || valeur === null) return 0;
  switch (habitude.type) {
    case 'oui-non':
      return valeur ? 1 : 0;
    case 'compteur': {
      const objectif = habitude.objectif || 1;
      return Math.max(0, Math.min(1, Number(valeur) / objectif));
    }
    case 'priere':
      if (valeur === 'heure') return 1;
      if (valeur === 'rattrapee') return 0.5;
      return 0;
    default:
      return 0;
  }
}

// Une habitude compte-t-elle pour la chaîne ce jour-là ? Le seuil est bas
// exprès : la chaîne récompense d'avoir fait, pas d'avoir fait parfaitement.
// C'est la règle des deux minutes — le jour où « tenir » devient exigeant, on
// arrête de tenir.
export function tenue(habitude, valeur) {
  return pointsHabitude(habitude, valeur) > 0;
}

export function pointsDuJour(jour, reglages) {
  const actives = habitudesActives(reglages);
  let gagnes = 0;
  for (const h of actives) gagnes += pointsHabitude(h, jour?.tenu?.[h.id]);
  return { gagnes, possibles: actives.length };
}

// Une journée n'a été ouverte que si quelque chose y a été inscrit. Sert à ne
// pas compter comme « raté » un jour qui n'est simplement pas encore arrivé.
export function jourRenseigne(jour) {
  if (!jour) return false;
  if (jour.chose || jour.note) return true;
  if (Object.keys(jour.projets || {}).length > 0) return true;
  return Object.values(jour.tenu || {}).some((v) => v !== undefined && v !== null && v !== false && v !== 'non' && v !== 0);
}

// ---------------------------------------------------------------------------
// Les chaînes — le cœur du mécanisme
// ---------------------------------------------------------------------------

// La chaîne en cours pour une habitude.
//
// Piège réglé ici : tant que la journée d'aujourd'hui n'est pas cochée, elle ne
// casse RIEN. On repart d'hier. Sinon la chaîne afficherait zéro chaque matin
// au réveil, et le seul mécanisme qui fait tenir serait détruit chaque nuit.
export function chaineEnCours(jours, habitude, aujourdhui) {
  let cle = aujourdhui;
  if (!tenue(habitude, jours[cle]?.tenu?.[habitude.id])) cle = cleDecalee(aujourdhui, -1);
  let n = 0;
  while (tenue(habitude, jours[cle]?.tenu?.[habitude.id])) {
    n++;
    cle = cleDecalee(cle, -1);
  }
  return n;
}

export function meilleureChaine(jours, habitude) {
  const cles = Object.keys(jours).sort();
  let meilleure = 0;
  let courante = 0;
  let precedente = null;
  for (const cle of cles) {
    if (!tenue(habitude, jours[cle]?.tenu?.[habitude.id])) { courante = 0; precedente = cle; continue; }
    courante = (precedente !== null && cleDecalee(precedente, 1) === cle) ? courante + 1 : 1;
    if (courante > meilleure) meilleure = courante;
    precedente = cle;
  }
  return meilleure;
}

// « Jamais deux fois de suite » (James Clear). La règle la plus utile du lot :
// manquer un jour est un accident, manquer deux jours est le début d'une
// nouvelle habitude. L'app ne le dit qu'à ce moment-là — une alerte qui parle
// tous les jours n'est plus lue.
export function enDanger(jours, habitude, aujourdhui) {
  const hier = cleDecalee(aujourdhui, -1);
  if (!jourRenseigne(jours[hier])) return false;          // hier n'existe pas encore : rien à dire
  if (tenue(habitude, jours[hier]?.tenu?.[habitude.id])) return false;
  return !tenue(habitude, jours[aujourdhui]?.tenu?.[habitude.id]);
}

// ---------------------------------------------------------------------------
// Le cumul — ce que le livre appelle rendre visible l'invisible
// ---------------------------------------------------------------------------

// Deux courbes : ce que tu as réellement accumulé, et ce que ça aurait fait en
// tenant tout. L'écart entre les deux EST le sujet du livre. Un score du jour
// ne montre rien ; deux droites qui s'écartent, si.
export function courbeCumul(jours, reglages, finCle, nbJours) {
  const cles = clesRecentes(finCle, nbJours);
  const possibles = habitudesActives(reglages).length;
  let reel = 0;
  let plein = 0;
  return cles.map((cle) => {
    reel += pointsDuJour(jours[cle], reglages).gagnes;
    plein += possibles;
    return { cle, reel, plein };
  });
}

// La part tenue sur une fenêtre, par domaine. C'est le chiffre honnête de
// Hardy : pas « bravo », mais « voilà ce que tu as réellement fait ».
// Les jours non renseignés comptent comme ratés dès lors qu'ils sont passés —
// sinon il suffirait de ne rien noter pour rester à 100 %.
export function partTenue(jours, reglages, finCle, nbJours, domaine = null) {
  const actives = habitudesActives(reglages).filter((h) => !domaine || h.domaine === domaine);
  if (actives.length === 0) return null;
  const cles = clesRecentes(finCle, nbJours);
  let gagnes = 0;
  let possibles = 0;
  for (const cle of cles) {
    for (const h of actives) {
      gagnes += pointsHabitude(h, jours[cle]?.tenu?.[h.id]);
      possibles += 1;
    }
  }
  return possibles === 0 ? null : gagnes / possibles;
}

export function tempsParProjet(jours, finCle, nbJours) {
  const cles = clesRecentes(finCle, nbJours);
  const total = {};
  for (const cle of cles) {
    const projets = jours[cle]?.projets || {};
    for (const [nom, p] of Object.entries(projets)) {
      const minutes = Number(p?.minutes) || 0;
      if (minutes > 0) total[nom] = (total[nom] || 0) + minutes;
    }
  }
  return Object.entries(total)
    .map(([nom, minutes]) => ({ nom, minutes }))
    .sort((a, b) => b.minutes - a.minutes);
}

// ---------------------------------------------------------------------------
// L'argent
// ---------------------------------------------------------------------------

export function totauxPlacements(placements = []) {
  let investi = 0;
  let valeur = 0;
  for (const p of placements) {
    investi += Number(p.investi) || 0;
    // Un placement dont la valeur n'a jamais été relevée vaut ce qu'il a coûté.
    // Inventer une performance serait pire que de n'en montrer aucune.
    valeur += p.valeur === undefined || p.valeur === null || p.valeur === '' ? (Number(p.investi) || 0) : Number(p.valeur);
  }
  return { investi, valeur, plusValue: valeur - investi };
}

// Ce qui a été mis de côté par mois, du plus ancien au plus récent.
export function moisTries(mois = {}) {
  return Object.keys(mois).sort().map((m) => ({ mois: m, misDeCote: Number(mois[m]) || 0 }));
}

// Le rythme réel : moyenne des `nb` derniers mois RENSEIGNÉS. Le mois en cours
// est écarté — il n'est pas fini, et le compter tirerait la moyenne vers le bas
// tous les débuts de mois, en donnant l'impression fausse d'un décrochage.
export function rythmeReel(mois, moisCourant, nb = 3) {
  const passes = moisTries(mois).filter((m) => m.mois < moisCourant);
  if (passes.length === 0) return null;
  const derniers = passes.slice(-nb);
  return derniers.reduce((s, m) => s + m.misDeCote, 0) / derniers.length;
}

// La projection : factuelle, jamais motivante.
//
// Elle répond à une seule question — « à ce rythme-là, j'y suis quand ? » — et
// elle a le droit de répondre « jamais ». Une projection qui ne peut pas
// annoncer une mauvaise nouvelle ne sert à rien.
export function projectionArgent(argent, aujourdhui) {
  const { investi, valeur, plusValue } = totauxPlacements(argent.placements);
  const objectif = Number(argent.objectif?.montant) || 0;
  const echeance = argent.objectif?.echeance || null;
  const moisCourant = cleDuMois(aujourdhui);
  const rythme = rythmeReel(argent.mois, moisCourant);

  const resultat = {
    investi, valeur, plusValue, objectif, echeance,
    rythmeReel: rythme,
    partObjectif: objectif > 0 ? valeur / objectif : null,
    restant: objectif > 0 ? Math.max(0, objectif - valeur) : null,
    moisRestants: null, rythmeNecessaire: null, moisProjetes: null, dateProjetee: null, verdict: null,
  };

  if (echeance) {
    resultat.moisRestants = Math.max(0, moisEntre(aujourdhui, echeance));
    if (resultat.restant !== null) {
      resultat.rythmeNecessaire = resultat.moisRestants > 0
        ? resultat.restant / resultat.moisRestants
        : resultat.restant;
    }
  }

  if (resultat.restant !== null && rythme !== null) {
    if (resultat.restant === 0) {
      resultat.moisProjetes = 0;
      resultat.verdict = 'atteint';
    } else if (rythme <= 0) {
      resultat.verdict = 'jamais';
    } else {
      resultat.moisProjetes = Math.ceil(resultat.restant / rythme);
      resultat.dateProjetee = cleDuMoisDecale(moisCourant, resultat.moisProjetes);
      if (resultat.moisRestants === null) resultat.verdict = 'sans echeance';
      else resultat.verdict = resultat.moisProjetes <= resultat.moisRestants ? 'en avance' : 'en retard';
    }
  }
  return resultat;
}

export function cleDuMoisDecale(cleMois, nbMois) {
  const [a, m] = cleMois.split('-').map(Number);
  const d = new Date(a, m - 1 + nbMois, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Ce que l'app dit en haut de l'écran
// ---------------------------------------------------------------------------

export function estLeMatin(reglages, maintenant = new Date()) {
  return maintenant.getHours() < (reglages.heureBascule ?? 17);
}

// Les habitudes à montrer en premier selon le moment. Rien n'est caché : ce
// qui n'est pas du moment passe en dessous, repliable. Une habitude qu'on ne
// voit plus est une habitude qu'on ne tient plus.
export function habitudesDuMoment(reglages, matin) {
  const actives = habitudesActives(reglages);
  const moment = matin ? 'matin' : 'soir';
  return {
    maintenant: actives.filter((h) => !h.moment || h.moment === moment),
    plusTard: actives.filter((h) => h.moment && h.moment !== moment),
  };
}
