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

// ═══════════════════════════════════════════════════════════════════════════
//  Ce qui fait qu'on revient — ajouté le 18/09/2026
// ═══════════════════════════════════════════════════════════════════════════
//
// Chaque mécanisme ci-dessous vient d'une mesure publiée, pas d'une intuition.
// Les sources sont dans README.md, § « Ce qui fait qu'on revient ».

// --- Le gel de chaîne ------------------------------------------------------
//
// LE mécanisme le plus rentable du domaine : chez Duolingo, il a réduit
// l'abandon de 21 % chez les gens sur le point de casser leur chaîne, et les
// apps qui en ont gardent leurs utilisateurs 17,2 jours après le 7ᵉ contre
// 11,6 sans.
//
// Pourquoi ça marche : il supprime l'ÉCHEC CATASTROPHIQUE — le jour où la
// chaîne de 40 tombe à zéro, on ferme l'app pour de bon — sans supprimer la
// pression quotidienne, qui est ce qui fait tenir.
//
// Ici : un gel se GAGNE (7 jours corrects), il ne s'achète pas, et il couvre
// la journée entière. Le stock est plafonné à trois, sinon il ne protège plus
// rien.

export const SEUIL_JOUR_CORRECT = 0.6;   // part des points du jour
export const JOURS_PAR_GEL = 7;
export const GELS_MAX = 3;

export function joursCorrects(jours, reglages) {
  const possibles = habitudesActives(reglages).length;
  if (possibles === 0) return 0;
  return Object.keys(jours).filter((cle) =>
    pointsDuJour(jours[cle], reglages).gagnes / possibles >= SEUIL_JOUR_CORRECT).length;
}

export function gelsEnStock(jours, reglages, gelsUtilises = []) {
  const gagnes = Math.floor(joursCorrects(jours, reglages) / JOURS_PAR_GEL);
  return Math.max(0, Math.min(GELS_MAX, gagnes - gelsUtilises.length));
}

// Combien de jours reste-t-il avant d'en gagner un de plus ? Affiché, parce
// qu'un compteur qui approche fait revenir — c'est le même ressort que la
// chaîne, appliqué à la protection de la chaîne.
export function joursAvantProchainGel(jours, reglages) {
  const reste = joursCorrects(jours, reglages) % JOURS_PAR_GEL;
  return JOURS_PAR_GEL - reste;
}

// --- Les chaînes, avec les gels -------------------------------------------
//
// Un jour gelé compte comme tenu pour TOUTES les habitudes. Un gel par
// habitude serait plus juste et illisible : personne ne saurait plus ce qui
// est protégé.

function jourCompte(jours, habitude, cle, gelsUtilises) {
  if (gelsUtilises.includes(cle)) return true;
  return tenue(habitude, jours[cle]?.tenu?.[habitude.id]);
}

export function chaineAvecGels(jours, habitude, aujourdhui, gelsUtilises = []) {
  let cle = aujourdhui;
  if (!jourCompte(jours, habitude, cle, gelsUtilises)) cle = cleDecalee(aujourdhui, -1);
  let n = 0;
  while (jourCompte(jours, habitude, cle, gelsUtilises)) {
    n++;
    cle = cleDecalee(cle, -1);
  }
  return n;
}

// La chaîne la plus longue en cours, toutes habitudes confondues. C'est elle
// qu'on montre en grand : c'est celle qu'on a peur de perdre.
export function plusLongueChaine(jours, reglages, aujourdhui, gelsUtilises = []) {
  let meilleure = { habitude: null, jours: 0 };
  for (const h of habitudesActives(reglages)) {
    const n = chaineAvecGels(jours, h, aujourdhui, gelsUtilises);
    if (n > meilleure.jours) meilleure = { habitude: h, jours: n };
  }
  return meilleure;
}

// Ce qu'un gel sauverait VRAIMENT, s'il était dépensé sur hier.
//
// Le piège, trouvé le 18/09/2026 en regardant l'écran : annoncer « ta chaîne de
// 39 jours » alors que l'habitude manquée était une autre, dont la chaîne
// n'était que de 3. Le chiffre était vrai — c'était bien la plus longue chaîne —
// mais il ne répondait pas à la question posée. Un chiffre juste à la mauvaise
// question est un mensonge poli, et c'est exactement ce qu'on refuse ici.
export function chaineSauveeParUnGel(jours, reglages, aujourdhui, gelsUtilises = []) {
  const hier = cleDecalee(aujourdhui, -1);
  const menacees = habitudesActives(reglages).filter((h) => enDanger(jours, h, aujourdhui));
  let meilleure = { habitude: null, jours: 0 };
  for (const h of menacees) {
    // La chaîne telle qu'elle était AVANT-HIER : c'est elle que le trou casse.
    const n = chaineAvecGels(jours, h, cleDecalee(hier, -1), gelsUtilises);
    if (n > meilleure.jours) meilleure = { habitude: h, jours: n };
  }
  return meilleure;
}

// --- Les paliers ----------------------------------------------------------
//
// Le 7ᵉ jour est la bascule mesurée du domaine : au-delà, les gens restent
// 2,4 fois plus longtemps. Il doit donc être NOMMÉ et visible, pas seulement
// atteint. Les suivants espacent la récompense sans jamais la rendre lointaine.

export const PALIERS = [7, 14, 21, 30, 60, 100, 180, 365];

export function prochainPalier(nbJours) {
  const suivant = PALIERS.find((p) => p > nbJours);
  if (suivant === undefined) return null;
  return { palier: suivant, reste: suivant - nbJours };
}

export function palierAtteint(nbJours) {
  return PALIERS.includes(nbJours);
}

// --- Le niveau ------------------------------------------------------------
//
// La chaîne se casse ; le niveau, jamais. C'est ce qui reste quand une
// mauvaise semaine efface tout le reste — et c'est la traduction littérale de
// L'Effet cumulé : ce qui est acquis ne se reperd pas.
//
// La courbe est en racine carrée : les premiers niveaux tombent vite (il faut
// que quelque chose arrive dans les trois premiers jours), les suivants
// s'espacent sans jamais devenir hors d'atteinte.

export const RANGS = [
  { niveau: 1, nom: 'Premier pas' },
  { niveau: 3, nom: 'Élan' },
  { niveau: 5, nom: 'Régulier' },
  { niveau: 7, nom: 'Constant' },
  { niveau: 10, nom: 'Ancré' },
  { niveau: 13, nom: 'Solide' },
  { niveau: 17, nom: 'Inébranlable' },
  { niveau: 22, nom: 'Istiqama' },
];

export function pointsTotaux(jours, reglages) {
  return Object.keys(jours).reduce((s, cle) => s + pointsDuJour(jours[cle], reglages).gagnes, 0);
}

export function pointsPourNiveau(niveau) {
  return 10 * (niveau - 1) ** 2;
}

export function niveau(total) {
  return Math.floor(Math.sqrt(Math.max(0, total) / 10)) + 1;
}

export function rang(niveauCourant) {
  let nom = RANGS[0].nom;
  for (const r of RANGS) if (niveauCourant >= r.niveau) nom = r.nom;
  return nom;
}

// Tout ce qu'il faut pour dessiner la barre de niveau, calculé une seule fois.
export function progressionNiveau(jours, reglages) {
  const total = pointsTotaux(jours, reglages);
  const n = niveau(total);
  const bas = pointsPourNiveau(n);
  const haut = pointsPourNiveau(n + 1);
  return {
    total, niveau: n, rang: rang(n),
    dansLeNiveau: total - bas,
    pourLeNiveau: haut - bas,
    part: (total - bas) / (haut - bas),
    manque: haut - total,
  };
}

// --- Les votes d'identité -------------------------------------------------
//
// « Chaque action est un vote pour la personne que tu veux devenir »
// (James Clear). Les apps qui présentent la régularité comme QUI TU ES font
// mieux que celles qui la présentent comme CE QUE TU AS FAIT — et un vote se
// compte, là où une intention ne se compte pas.

export function votes(jours, reglages, finCle, nbJours) {
  const cles = clesRecentes(finCle, nbJours);
  const actives = habitudesActives(reglages);
  let n = 0;
  for (const cle of cles) {
    for (const h of actives) if (tenue(h, jours[cle]?.tenu?.[h.id])) n++;
  }
  return n;
}

// --- La semaine en grille -------------------------------------------------
//
// Sept cases par habitude, du plus ancien au plus récent. Un trou se voit sans
// lire un chiffre : c'est la forme la plus dense qui reste lisible au pouce.

export function grilleSemaine(jours, habitude, finCle, gelsUtilises = [], nbJours = 7) {
  return clesRecentes(finCle, nbJours).map((cle) => {
    if (gelsUtilises.includes(cle)) return { cle, etat: 'gele' };
    const valeur = jours[cle]?.tenu?.[habitude.id];
    if (tenue(habitude, valeur)) return { cle, etat: valeur === 'rattrapee' ? 'partiel' : 'tenu' };
    if (jourRenseigne(jours[cle])) return { cle, etat: 'rate' };
    return { cle, etat: 'vide' };
  });
}

// --- Le bilan du soir -----------------------------------------------------
//
// Ce qu'on lit quand la journée est finie. Factuel : il a demandé un outil,
// pas un entraîneur. Mais il dit ce qui a bougé — sans ça, une journée tenue
// ne laisse aucune trace, et c'est exactement le problème que le livre décrit.

export function bilanDuJour(jours, reglages, cle, gelsUtilises = []) {
  const { gagnes, possibles } = pointsDuJour(jours[cle], reglages);
  const longue = plusLongueChaine(jours, reglages, cle, gelsUtilises);
  const prog = progressionNiveau(jours, reglages);
  const paliers = habitudesActives(reglages)
    .map((h) => ({ h, n: chaineAvecGels(jours, h, cle, gelsUtilises) }))
    .filter((x) => palierAtteint(x.n));
  return {
    gagnes, possibles,
    part: possibles === 0 ? 0 : gagnes / possibles,
    complet: possibles > 0 && gagnes >= possibles,
    plusLongueChaine: longue,
    niveau: prog,
    paliersFranchis: paliers,
  };
}
