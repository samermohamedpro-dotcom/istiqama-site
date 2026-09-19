// Les tests du calcul. Lancés par `node tests.mjs`.
//
// Ils ne regardent JAMAIS l'écran : ce qu'ils protègent, ce sont les chiffres
// qui n'ont l'air de rien quand ils sont faux — une chaîne qui casse la nuit,
// une part tenue qui reste à 100 % parce qu'on n'a rien noté, une projection
// d'argent qui n'annonce jamais de mauvaise nouvelle.
//
// Chacun a été vu ROUGE avant d'être vu vert (journal du 18/09/2026).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  identifiantDepuis, ajouterHabitude, supprimerHabitude, TYPES_HABITUDE,
  chaineSauveeParUnGel, gelsEnStock, joursAvantProchainGel, joursCorrects, chaineAvecGels, plusLongueChaine,
  prochainPalier, palierAtteint, progressionNiveau, niveau, rang, pointsTotaux,
  votes, grilleSemaine, bilanDuJour, PALIERS, GELS_MAX,
  cleDuJour, cleDecalee, clesRecentes, moisEntre, cleDuMois, cleDuMoisDecale,
  pointsHabitude, tenue, pointsDuJour, jourRenseigne,
  chaineEnCours, meilleureChaine, enDanger,
  courbeCumul, partTenue, tempsParProjet,
  totauxPlacements, rythmeReel, projectionArgent,
  estLeMatin, habitudesDuMoment,
} from './1-SOURCE/logique.js';
import { completer, depuisTexte, lire, ecrire, classeurVide } from './1-SOURCE/donnees.js';
import { REGLAGES_DEPART } from './1-SOURCE/depart.js';

// --- un jeu de réglages minuscule, pour que chaque test dise une seule chose --
const R = {
  heureBascule: 17,
  habitudes: [
    { id: 'bouger', domaine: 'corps', libelle: 'Bouger', type: 'oui-non', actif: true },
    { id: 'eau', domaine: 'corps', libelle: "L'eau", type: 'compteur', objectif: 8, actif: true },
    { id: 'fajr', domaine: 'religion', libelle: 'Fajr', type: 'priere', actif: true },
  ],
  projets: [],
};
const BOUGER = R.habitudes[0];
const EAU = R.habitudes[1];
const FAJR = R.habitudes[2];

// ---------------------------------------------------------------------------
test('la clé du jour est LOCALE, pas UTC', () => {
  // 23 h 30 à Paris en été, c'est encore le 18 — `toISOString()` dirait le 19,
  // et l'Icha cochée à cette heure-là tomberait sur le mauvais jour.
  const tard = new Date(2026, 8, 18, 23, 30);
  assert.equal(cleDuJour(tard), '2026-09-18');
});

test('les décalages de date passent les fins de mois', () => {
  assert.equal(cleDecalee('2026-03-01', -1), '2026-02-28');
  assert.equal(cleDecalee('2026-12-31', 1), '2027-01-01');
  assert.deepEqual(clesRecentes('2026-09-03', 3), ['2026-09-01', '2026-09-02', '2026-09-03']);
});

test('les mois se comptent entre deux dates', () => {
  assert.equal(moisEntre('2026-09-18', '2027-12-31'), 15);
  assert.equal(cleDuMois('2026-09-18'), '2026-09');
  assert.equal(cleDuMoisDecale('2026-11', 3), '2027-02');
});

// ---------------------------------------------------------------------------
test('une prière rattrapée vaut une moitié, jamais zéro', () => {
  assert.equal(pointsHabitude(FAJR, 'heure'), 1);
  assert.equal(pointsHabitude(FAJR, 'rattrapee'), 0.5);
  assert.equal(pointsHabitude(FAJR, 'non'), 0);
  assert.equal(pointsHabitude(FAJR, undefined), 0);
  // et elle COMPTE pour la chaîne : elle a été faite.
  assert.equal(tenue(FAJR, 'rattrapee'), true);
  assert.equal(tenue(FAJR, 'non'), false);
});

test('un compteur donne une part, et ne dépasse jamais 1', () => {
  assert.equal(pointsHabitude(EAU, 4), 0.5);
  assert.equal(pointsHabitude(EAU, 8), 1);
  assert.equal(pointsHabitude(EAU, 20), 1);
  assert.equal(pointsHabitude(EAU, 0), 0);
});

test('les points du jour comptent toutes les habitudes actives', () => {
  const jour = { tenu: { bouger: true, eau: 4, fajr: 'heure' } };
  assert.deepEqual(pointsDuJour(jour, R), { gagnes: 2.5, possibles: 3 });
  assert.deepEqual(pointsDuJour(undefined, R), { gagnes: 0, possibles: 3 });
});

test('une habitude désactivée sort du compte', () => {
  const r = { ...R, habitudes: [{ ...BOUGER }, { ...EAU, actif: false }, { ...FAJR }] };
  assert.equal(pointsDuJour({ tenu: { bouger: true } }, r).possibles, 2);
});

// ---------------------------------------------------------------------------
test("la chaîne ne casse PAS parce qu'aujourd'hui n'est pas encore coché", () => {
  // Le défaut qui tuerait l'app : chaque matin, la chaîne repart à zéro et on
  // arrête d'ouvrir l'application.
  const jours = {
    '2026-09-15': { tenu: { bouger: true } },
    '2026-09-16': { tenu: { bouger: true } },
    '2026-09-17': { tenu: { bouger: true } },
  };
  assert.equal(chaineEnCours(jours, BOUGER, '2026-09-18'), 3);
  jours['2026-09-18'] = { tenu: { bouger: true } };
  assert.equal(chaineEnCours(jours, BOUGER, '2026-09-18'), 4);
});

test('un trou casse la chaîne en cours', () => {
  const jours = {
    '2026-09-14': { tenu: { bouger: true } },
    '2026-09-16': { tenu: { bouger: true } },
    '2026-09-17': { tenu: { bouger: true } },
  };
  assert.equal(chaineEnCours(jours, BOUGER, '2026-09-18'), 2);
});

test('la meilleure chaîne retient le plus long passage, pas le dernier', () => {
  const jours = {
    '2026-09-01': { tenu: { bouger: true } },
    '2026-09-02': { tenu: { bouger: true } },
    '2026-09-03': { tenu: { bouger: true } },
    '2026-09-04': { tenu: { bouger: true } },
    '2026-09-06': { tenu: { bouger: true } },
  };
  assert.equal(meilleureChaine(jours, BOUGER), 4);
});

test('« jamais deux fois de suite » ne parle QUE quand il le faut', () => {
  const hierRate = { '2026-09-17': { tenu: { bouger: false, fajr: 'heure' } } };
  assert.equal(enDanger(hierRate, BOUGER, '2026-09-18'), true);

  // fait aujourd'hui : plus rien à dire
  const rattrape = { ...hierRate, '2026-09-18': { tenu: { bouger: true } } };
  assert.equal(enDanger(rattrape, BOUGER, '2026-09-18'), false);

  // hier tenu : rien à dire
  const hierTenu = { '2026-09-17': { tenu: { bouger: true } } };
  assert.equal(enDanger(hierTenu, BOUGER, '2026-09-18'), false);

  // hier n'a jamais été ouvert (app neuve, ou journée sautée sans rien noter) :
  // l'app ne doit pas crier au premier jour d'utilisation.
  assert.equal(enDanger({}, BOUGER, '2026-09-18'), false);
});

test('une journée vide ne compte pas comme renseignée', () => {
  assert.equal(jourRenseigne(undefined), false);
  assert.equal(jourRenseigne({ tenu: {}, chose: '', projets: {} }), false);
  assert.equal(jourRenseigne({ tenu: { bouger: false }, chose: '', projets: {} }), false);
  assert.equal(jourRenseigne({ tenu: { bouger: true } }), true);
  assert.equal(jourRenseigne({ tenu: {}, chose: 'appeler le comptable' }), true);
});

// ---------------------------------------------------------------------------
test('la part tenue compte les jours passés NON renseignés comme ratés', () => {
  // Sinon il suffirait de ne rien noter pour rester à 100 %, et le chiffre le
  // plus important de l'app deviendrait un mensonge poli.
  const jours = { '2026-09-18': { tenu: { bouger: true, eau: 8, fajr: 'heure' } } };
  assert.equal(partTenue(jours, R, '2026-09-18', 1), 1);
  assert.equal(partTenue(jours, R, '2026-09-18', 2), 0.5);
});

test('la part tenue se lit par domaine', () => {
  const jours = { '2026-09-18': { tenu: { bouger: true, eau: 0, fajr: 'non' } } };
  assert.equal(partTenue(jours, R, '2026-09-18', 1, 'corps'), 0.5);
  assert.equal(partTenue(jours, R, '2026-09-18', 1, 'religion'), 0);
  assert.equal(partTenue(jours, R, '2026-09-18', 1, 'inconnu'), null);
});

test("la courbe du cumul montre l'écart avec ce qu'on aurait fait en tenant tout", () => {
  const jours = {
    '2026-09-17': { tenu: { bouger: true, eau: 8, fajr: 'heure' } },
    '2026-09-18': { tenu: { bouger: true } },
  };
  const c = courbeCumul(jours, R, '2026-09-18', 2);
  assert.deepEqual(c.map((p) => p.reel), [3, 4]);
  assert.deepEqual(c.map((p) => p.plein), [3, 6]);
});

test('le temps par projet se totalise et se classe', () => {
  const jours = {
    '2026-09-17': { projets: { Merkhet: { minutes: 30 }, 'Petit Gâteau': { minutes: 90 } } },
    '2026-09-18': { projets: { Merkhet: { minutes: 120 } } },
  };
  assert.deepEqual(tempsParProjet(jours, '2026-09-18', 7), [
    { nom: 'Merkhet', minutes: 150 },
    { nom: 'Petit Gâteau', minutes: 90 },
  ]);
});

// ---------------------------------------------------------------------------
test("un placement sans valeur relevée vaut ce qu'il a coûté", () => {
  const t = totauxPlacements([
    { nom: 'ETF Monde', investi: 1000, valeur: 1150 },
    { nom: 'Livret', investi: 500 },
  ]);
  assert.deepEqual(t, { investi: 1500, valeur: 1650, plusValue: 150 });
});

test('le rythme réel écarte le mois en cours', () => {
  // Le 2 du mois, le mois courant vaut presque zéro : le compter ferait
  // décrocher la projection tous les débuts de mois, sans raison.
  const mois = { '2026-06': 300, '2026-07': 300, '2026-08': 600, '2026-09': 10 };
  assert.equal(rythmeReel(mois, '2026-09'), 400);
  assert.equal(rythmeReel({}, '2026-09'), null);
});

test("la projection sait dire qu'on est en retard", () => {
  const p = projectionArgent({
    objectif: { montant: 60000, echeance: '2027-12-31' },
    placements: [{ investi: 5000, valeur: 6000 }],
    mois: { '2026-07': 1000, '2026-08': 1000 },
  }, '2026-09-18');
  assert.equal(p.valeur, 6000);
  assert.equal(p.restant, 54000);
  assert.equal(p.moisRestants, 15);
  assert.equal(p.rythmeReel, 1000);
  assert.equal(p.rythmeNecessaire, 3600);
  assert.equal(p.moisProjetes, 54);
  assert.equal(p.dateProjetee, '2031-03');
  assert.equal(p.verdict, 'en retard');
});

test("la projection sait dire qu'on est en avance, et qu'on y est déjà", () => {
  const avance = projectionArgent({
    objectif: { montant: 10000, echeance: '2027-12-31' },
    placements: [{ investi: 5000 }],
    mois: { '2026-07': 2000, '2026-08': 2000 },
  }, '2026-09-18');
  assert.equal(avance.verdict, 'en avance');

  const atteint = projectionArgent({
    objectif: { montant: 10000, echeance: '2027-12-31' },
    placements: [{ investi: 12000 }],
    mois: { '2026-08': 500 },
  }, '2026-09-18');
  assert.equal(atteint.verdict, 'atteint');
});

test('la projection a le droit de répondre « jamais »', () => {
  // Un outil qui ne peut pas annoncer une mauvaise nouvelle ne sert à rien.
  const p = projectionArgent({
    objectif: { montant: 60000, echeance: '2027-12-31' },
    placements: [{ investi: 1000 }],
    mois: { '2026-07': 0, '2026-08': 0 },
  }, '2026-09-18');
  assert.equal(p.verdict, 'jamais');
  assert.equal(p.dateProjetee, null);
});

test('sans objectif ni historique, la projection ne raconte rien', () => {
  const p = projectionArgent({ objectif: {}, placements: [], mois: {} }, '2026-09-18');
  assert.equal(p.verdict, null);
  assert.equal(p.partObjectif, null);
});

// ---------------------------------------------------------------------------
test("l'app bascule du matin au soir à l'heure réglée", () => {
  assert.equal(estLeMatin(R, new Date(2026, 8, 18, 9, 0)), true);
  assert.equal(estLeMatin(R, new Date(2026, 8, 18, 17, 0)), false);
});

test('rien ne disparaît selon le moment : ce qui n’est pas du moment passe dessous', () => {
  const r = {
    ...R,
    habitudes: [
      { id: 'a', domaine: 'religion', type: 'oui-non', moment: 'matin', actif: true },
      { id: 'b', domaine: 'religion', type: 'oui-non', moment: 'soir', actif: true },
      { id: 'c', domaine: 'corps', type: 'oui-non', actif: true },
    ],
  };
  const matin = habitudesDuMoment(r, true);
  assert.deepEqual(matin.maintenant.map((h) => h.id), ['a', 'c']);
  assert.deepEqual(matin.plusTard.map((h) => h.id), ['b']);
  // total conservé : aucune habitude n'est perdue en route
  assert.equal(matin.maintenant.length + matin.plusTard.length, 3);
});

// ---------------------------------------------------------------------------
test('une sauvegarde qui n’est pas une sauvegarde Istiqama est REFUSÉE', () => {
  assert.throws(() => depuisTexte('{"autre":1}'), /sauvegarde Istiqama/);
  assert.throws(() => depuisTexte('pas du json'));
  const bon = depuisTexte(JSON.stringify({ jours: { '2026-09-18': { tenu: { bouger: true } } } }));
  assert.equal(bon.jours['2026-09-18'].tenu.bouger, true);
  // et elle repart avec les réglages de départ plutôt qu'avec rien
  assert.equal(bon.reglages.habitudes.length, REGLAGES_DEPART.habitudes.length);
});

test('compléter ajoute ce qui manque sans écraser ce qui existe', () => {
  const ancien = { jours: { '2026-01-01': { tenu: {} } }, reglages: { identite: 'à moi' } };
  const c = completer(ancien);
  assert.equal(c.reglages.identite, 'à moi');
  assert.equal(c.reglages.habitudes.length, REGLAGES_DEPART.habitudes.length);
  assert.deepEqual(Object.keys(c.jours), ['2026-01-01']);
});

test('un stockage refusé ne fait pas planter l’app', () => {
  const casse = {
    getItem() { throw new Error('bloqué'); },
    setItem() { throw new Error('bloqué'); },
  };
  assert.deepEqual(lire(casse).jours, {});
  assert.equal(ecrire(classeurVide(), casse), false);
});

test('ce qui est écrit se relit à l’identique', () => {
  const faux = new Map();
  const stockage = { getItem: (k) => faux.get(k) ?? null, setItem: (k, v) => faux.set(k, v) };
  const c = classeurVide();
  c.jours['2026-09-18'] = { tenu: { bouger: true }, chose: 'appeler le comptable', projets: {}, note: '' };
  assert.equal(ecrire(c, stockage), true);
  assert.deepEqual(lire(stockage).jours['2026-09-18'].tenu, { bouger: true });
});

// ---------------------------------------------------------------------------
// Les marges de sécurité de l'iPhone
// ---------------------------------------------------------------------------
// Ces tests lisent la feuille de style à sa source. Ils ne remplacent pas un
// vrai iPhone — ils empêchent la RÉGRESSION d'un défaut déjà payé.
//
// Le défaut, vu par Samer le 18/09/2026 sur son téléphone : la date du jour
// était invisible, cachée sous la barre d'état. Cause : `viewport-fit=cover`
// dans la page fait passer le contenu SOUS la barre d'état et sous l'encoche,
// et la marge du haut n'avait pas été réservée — seule celle du bas l'était.
//
// Aucun navigateur de bureau ne peut le reproduire : `env(safe-area-inset-top)`
// y vaut zéro. C'est pourquoi les quatre écrans étaient « vérifiés » et le
// défaut présent quand même.

test("la page réserve les marges de sécurité EN HAUT comme en bas", async () => {
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(new URL('./1-SOURCE/style.css', import.meta.url), 'utf8');
  const bloc = css.match(/#ecran\s*\{[^}]*\}/)?.[0];
  assert.ok(bloc, '#ecran introuvable dans la feuille de style');
  assert.match(bloc, /env\(safe-area-inset-top\)/,
    "le haut de #ecran ne réserve pas env(safe-area-inset-top) : la date passera sous la barre d'état");
  assert.match(bloc, /env\(safe-area-inset-bottom\)/,
    'le bas de #ecran ne réserve pas la place de la barre des onglets');
});

test("la barre des onglets reste au-dessus de la barre de gestes", async () => {
  const { readFile } = await import('node:fs/promises');
  const css = await readFile(new URL('./1-SOURCE/style.css', import.meta.url), 'utf8');
  const bloc = css.match(/\.onglets\s*\{[^}]*\}/)?.[0];
  assert.ok(bloc, '.onglets introuvable dans la feuille de style');
  assert.match(bloc, /env\(safe-area-inset-bottom\)/);
});

test("viewport-fit=cover et les marges vont TOUJOURS ensemble", async () => {
  // L'un sans l'autre est le défaut. Si un jour viewport-fit disparaît de la
  // page, ce test le dit — parce qu'alors les marges deviennent inutiles, et
  // qu'on doit le décider, pas le subir.
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(new URL('./construire.mjs', import.meta.url), 'utf8');
  assert.match(page, /viewport-fit=cover/,
    'viewport-fit=cover a disparu de la page : les env(safe-area-*) ne servent plus à rien');
});

// ═══════════════════════════════════════════════════════════════════════════
//  Ce qui fait qu'on revient
// ═══════════════════════════════════════════════════════════════════════════

// Une suite de journées tenues, du plus ancien au plus récent.
function joursTenus(finCle, nb, tenu = { bouger: true, eau: 8, fajr: 'heure' }) {
  const jours = {};
  for (const cle of clesRecentes(finCle, nb)) jours[cle] = { tenu: { ...tenu } };
  return jours;
}

test('un gel se GAGNE tous les sept jours corrects, et le stock est plafonné', () => {
  assert.equal(gelsEnStock(joursTenus('2026-09-18', 6), R), 0);
  assert.equal(gelsEnStock(joursTenus('2026-09-18', 7), R), 1);
  assert.equal(gelsEnStock(joursTenus('2026-09-18', 20), R), 2);
  // le plafond : sans lui, un gros stock ne protège plus rien
  assert.equal(gelsEnStock(joursTenus('2026-09-18', 200), R), GELS_MAX);
});

test('un gel dépensé sort du stock', () => {
  const j = joursTenus('2026-09-18', 21);
  assert.equal(gelsEnStock(j, R), 3);
  assert.equal(gelsEnStock(j, R, ['2026-08-01']), 2);
  assert.equal(gelsEnStock(j, R, ['2026-08-01', '2026-08-02', '2026-08-03']), 0);
});

test("une journée à moitié tenue ne compte pas comme correcte", () => {
  // Le seuil est à 60 % : sinon on gagnerait des gels en ne faisant presque rien,
  // et la protection perdrait tout son sens.
  const jours = {
    '2026-09-17': { tenu: { bouger: true, eau: 8, fajr: 'heure' } },   // 3/3
    '2026-09-18': { tenu: { bouger: true } },                            // 1/3
  };
  assert.equal(joursCorrects(jours, R), 1);
});

test('un gel sauve la chaîne le jour où elle allait casser', () => {
  // C'est le mécanisme entier : sans gel la chaîne tombe à 1, avec elle continue.
  const jours = joursTenus('2026-09-16', 12);
  jours['2026-09-17'] = { tenu: { bouger: false }, chose: 'journée ratée' };
  jours['2026-09-18'] = { tenu: { bouger: true } };
  assert.equal(chaineAvecGels(jours, BOUGER, '2026-09-18', []), 1);
  assert.equal(chaineAvecGels(jours, BOUGER, '2026-09-18', ['2026-09-17']), 14);
});

test('un jour gelé protège TOUTES les habitudes, pas une seule', () => {
  const jours = joursTenus('2026-09-16', 5);
  jours['2026-09-17'] = { tenu: {}, chose: 'rien fait' };
  jours['2026-09-18'] = { tenu: { bouger: true, fajr: 'heure', eau: 8 } };
  for (const h of R.habitudes) {
    assert.equal(chaineAvecGels(jours, h, '2026-09-18', ['2026-09-17']), 7, h.id);
  }
});

test('la plus longue chaîne est celle qu’on montre en grand', () => {
  const jours = joursTenus('2026-09-18', 10, { fajr: 'heure' });
  jours['2026-09-18'].tenu.bouger = true;
  const longue = plusLongueChaine(jours, R, '2026-09-18');
  assert.equal(longue.habitude.id, 'fajr');
  assert.equal(longue.jours, 10);
});

test('le prochain palier est toujours nommé, et le dernier ne ment pas', () => {
  assert.deepEqual(prochainPalier(0), { palier: 7, reste: 7 });
  assert.deepEqual(prochainPalier(5), { palier: 7, reste: 2 });
  assert.deepEqual(prochainPalier(7), { palier: 14, reste: 7 });
  assert.equal(prochainPalier(365), null);       // plus rien à promettre : on ne promet rien
  assert.equal(palierAtteint(7), true);
  assert.equal(palierAtteint(8), false);
  assert.equal(PALIERS[0], 7);                   // le 7ᵉ jour est la bascule mesurée
});

test('le niveau monte vite au début, puis s’espace', () => {
  assert.equal(niveau(0), 1);
  assert.equal(niveau(10), 2);     // ~1 journée
  assert.equal(niveau(40), 3);
  assert.equal(niveau(1000), 11);  // ~3 mois
  assert.equal(rang(1), 'Premier pas');
  assert.equal(rang(7), 'Constant');
  assert.equal(rang(22), 'Istiqama');
  assert.equal(rang(100), 'Istiqama');
});

test('la progression de niveau donne tout ce qu’il faut pour la barre', () => {
  const jours = joursTenus('2026-09-18', 10);   // 3 pts/j = 30
  const p = progressionNiveau(jours, R);
  assert.equal(p.total, 30);
  assert.equal(p.niveau, 2);
  assert.equal(p.dansLeNiveau, 20);   // niveau 2 commence à 10
  assert.equal(p.pourLeNiveau, 30);   // niveau 3 commence à 40
  assert.equal(p.manque, 10);
  assert.ok(p.part > 0.66 && p.part < 0.67);
});

test('le niveau ne se perd JAMAIS, même après une semaine ratée', () => {
  // C'est sa raison d'être : la chaîne punit, le niveau garde. Sans lui, une
  // mauvaise semaine efface tout et on ferme l'app.
  const jours = joursTenus('2026-09-11', 20);
  const avant = progressionNiveau(jours, R);
  for (const cle of clesRecentes('2026-09-18', 7)) jours[cle] = { tenu: {}, chose: 'rien' };
  const apres = progressionNiveau(jours, R);
  assert.equal(apres.total, avant.total);
  assert.equal(apres.niveau, avant.niveau);
});

test('les votes se comptent, un par habitude tenue', () => {
  const jours = {
    '2026-09-17': { tenu: { bouger: true, eau: 8, fajr: 'heure' } },
    '2026-09-18': { tenu: { bouger: true, eau: 0, fajr: 'non' } },
  };
  assert.equal(votes(jours, R, '2026-09-18', 2), 4);
  // une prière rattrapée reste un vote : elle a été faite
  jours['2026-09-18'].tenu.fajr = 'rattrapee';
  assert.equal(votes(jours, R, '2026-09-18', 2), 5);
});

test('la grille de la semaine distingue quatre états, dont le gel', () => {
  const jours = {
    '2026-09-16': { tenu: { fajr: 'heure' } },
    '2026-09-17': { tenu: { fajr: 'rattrapee' } },
    '2026-09-18': { tenu: { fajr: 'non' }, chose: 'journée ouverte' },
  };
  const g = grilleSemaine(jours, FAJR, '2026-09-18', ['2026-09-15'], 4);
  assert.deepEqual(g.map((c) => c.etat), ['gele', 'tenu', 'partiel', 'rate']);
  // un jour jamais ouvert n'est pas un raté : il n'a pas eu lieu
  assert.equal(grilleSemaine({}, FAJR, '2026-09-18', [], 1)[0].etat, 'vide');
});

test('le bilan du soir dit ce qui a bougé, et signale un palier franchi', () => {
  const jours = joursTenus('2026-09-18', 7);
  const b = bilanDuJour(jours, R, '2026-09-18');
  assert.equal(b.complet, true);
  assert.equal(b.gagnes, 3);
  assert.equal(b.plusLongueChaine.jours, 7);
  assert.equal(b.paliersFranchis.length, 3);          // les trois habitudes à 7 jours
  assert.equal(b.niveau.rang, 'Premier pas');

  // au 8ᵉ jour, plus aucun palier : on ne fête pas ce qui n'a pas eu lieu
  const huit = joursTenus('2026-09-19', 8);
  assert.equal(bilanDuJour(huit, R, '2026-09-19').paliersFranchis.length, 0);
});

test("le gel annonce la chaîne RÉELLEMENT en jeu, pas la plus longue de l'app", () => {
  // Défaut trouvé à l'écran le 18/09/2026 : l'offre annonçait « ta chaîne de
  // 39 jours » alors que l'habitude manquée en avait 3. Le chiffre était vrai,
  // et il répondait à une autre question.
  const jours = joursTenus('2026-09-16', 39, { fajr: 'heure' });
  for (const cle of clesRecentes('2026-09-16', 3)) jours[cle].tenu.bouger = true;
  jours['2026-09-17'] = { tenu: { fajr: 'heure' }, chose: 'journée ouverte' };  // bouger manqué
  jours['2026-09-18'] = { tenu: {}, chose: 'aujourd’hui' };

  const enJeu = chaineSauveeParUnGel(jours, R, '2026-09-18');
  assert.equal(enJeu.habitude.id, 'bouger', "c'est Bouger qui est menacé, pas Fajr");
  assert.equal(enJeu.jours, 3);

  // et la plus longue chaîne de l'app, elle, est bien plus grande : c'est ce
  // chiffre-là qu'on affichait à tort.
  assert.ok(plusLongueChaine(jours, R, '2026-09-17').jours > 30);
});

test("rien à sauver quand rien n'est menacé", () => {
  const jours = joursTenus('2026-09-18', 10);
  assert.equal(chaineSauveeParUnGel(jours, R, '2026-09-18').jours, 0);
});

// ═══════════════════════════════════════════════════════════════════════════
//  Le service ouvrier — ce qu'on PEUT vérifier ici, et ce qu'on ne peut pas
// ═══════════════════════════════════════════════════════════════════════════
//
// Ce qu'on NE PEUT PAS : le voir s'enregistrer et servir hors connexion. Le
// 18/09/2026, même un service ouvrier VIDE a été refusé par le navigateur
// d'aperçu — l'enregistrement est désactivé dans cette fenêtre. Le seul vrai
// test est celui de Samer, sur son iPhone (`A-FAIRE.md`).
//
// Ce qu'on PEUT : vérifier que les trois parades contre la panne la plus chère
// de ce genre de fichier — servir une VIEILLE version pour toujours, sans une
// erreur nulle part — sont bien déclarées dans le fichier produit.

test('le service ouvrier porte ses trois parades anti-version-figée', async () => {
  const { readFile } = await import('node:fs/promises');
  const sw = await readFile(new URL('./docs/service-ouvrier.js', import.meta.url), 'utf8');

  // 1. un cache neuf à chaque construction, sinon l'ancien survit
  const nom = sw.match(/const CACHE = '([^']+)'/)?.[1];
  assert.ok(nom, 'aucun nom de cache');
  assert.match(nom, /^istiqama-\d{10,}$/, 'le nom du cache ne porte pas la version');

  // 2. la nouvelle version prend la main sans attendre la fermeture des onglets
  assert.match(sw, /skipWaiting\(\)/);
  assert.match(sw, /clients\.claim\(\)/);

  // 3. les vieux caches sont supprimés, sinon ils s'empilent indéfiniment
  assert.match(sw, /caches\.delete\(nom\)/);

  // 4. la PAGE passe par le réseau d'abord : servie depuis le cache, elle
  //    figerait tout le reste
  assert.match(sw, /estLaPage[\s\S]{0,200}await fetch\(e\.request\)/);
});

test('la porte de sortie existe dans l’app, et elle ne touche pas aux données', async () => {
  // Un composant qu'on n'a pas pu vérifier doit avoir un interrupteur.
  const { readFile } = await import('node:fs/promises');
  const app = await readFile(new URL('./1-SOURCE/app.js', import.meta.url), 'utf8');
  assert.match(app, /vider-le-cache/, "pas de bouton pour vider le cache");
  const fn = app.match(/async function viderLeCache\(\)[\s\S]*?\n\}/)?.[0];
  assert.ok(fn, 'viderLeCache introuvable');
  assert.match(fn, /unregister\(\)/);
  assert.match(fn, /caches\.delete/);
  assert.doesNotMatch(fn, /localStorage|classeur/, "vider le cache ne doit JAMAIS toucher aux données");
});


// ═══════════════════════════════════════════════════════════════════════════
//  Ajouter et retirer une habitude
// ═══════════════════════════════════════════════════════════════════════════

test("l'identifiant se fabrique sans accent ni espace, et ne se répète jamais", () => {
  // Il devient une CLÉ dans chaque journée enregistrée : une clé avec un accent
  // ou un espace se retrouve un jour dans un fichier qui la refuse.
  assert.equal(identifiantDepuis('Méditer le matin'), 'mediter_le_matin');
  assert.equal(identifiantDepuis("L'eau"), 'l_eau');
  assert.equal(identifiantDepuis('  '), 'habitude');
  assert.equal(identifiantDepuis('!!! ???'), 'habitude');

  // deux habitudes du même nom ne doivent JAMAIS partager une clé : la seconde
  // écraserait l'historique de la première, en silence
  const prises = [{ id: 'sport' }, { id: 'sport_2' }];
  assert.equal(identifiantDepuis('Sport', prises), 'sport_3');
});

test('ajouter une habitude ne modifie pas la liste existante', () => {
  const avant = [{ id: 'bouger', domaine: 'corps', libelle: 'Bouger', type: 'oui-non', actif: true }];
  const apres = ajouterHabitude(avant, { libelle: 'Méditer', domaine: 'tete', type: 'oui-non' });
  assert.equal(avant.length, 1, 'la liste de départ ne doit pas bouger');
  assert.equal(apres.length, 2);
  assert.deepEqual(apres[1], { id: 'mediter', domaine: 'tete', libelle: 'Méditer', type: 'oui-non', actif: true });
});

test('un compteur ajouté a toujours un objectif utilisable', () => {
  // Sans objectif, `pointsHabitude` diviserait par zéro et la journée entière
  // deviendrait fausse — sans rien signaler.
  const [h] = ajouterHabitude([], { libelle: 'Pas', type: 'compteur', objectif: 0 });
  assert.equal(h.objectif, 1);
  assert.equal(h.unite, 'fois');
  const [g] = ajouterHabitude([], { libelle: 'Pas', type: 'compteur', objectif: '8000', unite: 'pas' });
  assert.equal(g.objectif, 8000);
});

test('une habitude sans nom est REFUSÉE', () => {
  assert.throws(() => ajouterHabitude([], { libelle: '   ' }), /besoin d’un nom/);
});

test('un type ou un domaine inconnu retombe sur une valeur sûre', () => {
  const [h] = ajouterHabitude([], { libelle: 'X', type: 'n’importe quoi', domaine: 'inventé' });
  assert.equal(h.type, 'oui-non');
  assert.equal(h.domaine, 'corps');
  assert.ok(TYPES_HABITUDE.some((t) => t.type === h.type));
});

test('supprimer retire de la liste et ne touche à AUCUNE journée', () => {
  // Les journées passées restent vraies telles qu'elles ont été vécues ; et si
  // l'habitude est recréée du même nom, son historique revient.
  const habitudes = [{ id: 'a', type: 'oui-non' }, { id: 'b', type: 'oui-non' }];
  const jours = { '2026-09-18': { tenu: { a: true, b: true } } };
  const apres = supprimerHabitude(habitudes, 'a');
  assert.deepEqual(apres.map((h) => h.id), ['b']);
  assert.deepEqual(jours['2026-09-18'].tenu, { a: true, b: true }, 'les journées sont intactes');

  // et la recréation retrouve la même clé, donc le même passé
  assert.equal(identifiantDepuis('a', apres), 'a');
});

test("supprimer la dernière habitude ne casse rien", () => {
  // Cas limite réel : il a le droit de tout enlever. Aucune division par zéro.
  const r = { heureBascule: 17, habitudes: [], projets: [] };
  assert.deepEqual(pointsDuJour({ tenu: {} }, r), { gagnes: 0, possibles: 0 });
  assert.equal(partTenue({}, r, '2026-09-18', 7), null);
  assert.equal(gelsEnStock({}, r), 0);
  assert.equal(plusLongueChaine({}, r, '2026-09-18').jours, 0);
  assert.equal(progressionNiveau({}, r).niveau, 1);
});

// ═══════════════════════════════════════════════════════════════════════════
//  Les adhkâr — et le pont entre les deux copies
// ═══════════════════════════════════════════════════════════════════════════

test('les adhkâr de l’app et ceux de RAPPELS.md sont les MÊMES', async () => {
  // Deux copies d'une même liste finissent toujours par diverger, et c'est la
  // seconde qui devient fausse en silence. Ici la seconde est un tableau que
  // Samer lira sur son téléphone en installant les raccourcis : s'il ne dit pas
  // la même chose que ce qu'il colle, il collera autre chose que ce qu'il croit.
  const { readFile } = await import('node:fs/promises');
  const { ADHKAR } = await import('./1-SOURCE/adhkar.js');
  const md = await readFile(new URL('./RAPPELS.md', import.meta.url), 'utf8');

  // on ne lit que les lignes du tableau numérotées 1..N
  const lignes = md.split('\n').filter((l) => /^\| \d+ \|/.test(l));
  assert.equal(lignes.length, ADHKAR.length,
    `RAPPELS.md montre ${lignes.length} adhkâr, l'app en porte ${ADHKAR.length}`);

  lignes.forEach((ligne, i) => {
    const colonnes = ligne.split('|').map((c) => c.trim());
    // la cellule porte le texte, puis <br> et la traduction en italique
    const [texte, trad] = colonnes[2].split('<br>');
    const dansLeDoc = texte
      .replace(/\*([^*]+)\*/g, '$1')         // les italiques du markdown
      .replace(/^Sayyid al-istighfâr — /, '');
    assert.equal(dansLeDoc, ADHKAR[i].texte,
      `le dhikr n° ${i + 1} n'est pas le même dans RAPPELS.md et dans l'app`);
    assert.ok(trad, `le dhikr n° ${i + 1} n'a pas de traduction dans RAPPELS.md`);
    assert.equal(trad.replace(/^\*|\*$/g, ''), ADHKAR[i].traduction,
      `la traduction n° ${i + 1} diffère entre RAPPELS.md et l'app`);
  });
});


test('aucun dhikr n’est écrit en alphabet arabe', async () => {
  // Demandé par Samer le 18/09/2026 : « je les veux en franco-arabe pas l'arabe
  // écriture ». Un seul caractère arabe qui repasse casserait la demande sans
  // que personne ne le voie.
  const { ADHKAR } = await import('./1-SOURCE/adhkar.js');
  for (const d of ADHKAR) {
    assert.doesNotMatch(d.texte, /[؀-ۿ]/, `« ${d.texte.slice(0, 30)}… » contient de l'arabe`);
  }
});

test('ce qui n’est pas vérifié est MARQUÉ comme tel', async () => {
  // Deux seulement ont été vérifiés à la source, et un a une authenticité
  // discutée. Le prétendre autrement serait pire que de ne rien dire.
  const { ADHKAR } = await import('./1-SOURCE/adhkar.js');
  assert.equal(ADHKAR.filter((d) => d.verifie).length, 2);
  assert.equal(ADHKAR.filter((d) => d.discute).length, 1);
  assert.equal(ADHKAR.findIndex((d) => d.discute), 12, 'le n° 13 est celui dont l’authenticité est discutée');
});


// ═══════════════════════════════════════════════════════════════════════════
//  La notification : un dhikr différent, et pas trop souvent
// ═══════════════════════════════════════════════════════════════════════════







test('une journée neuve porte un compte de dhikr à zéro', async () => {
  const { jourVide } = await import('./1-SOURCE/logique.js');
  assert.equal(jourVide().dhikrs, 0);
});

// ═══════════════════════════════════════════════════════════════════════════
//  L'app et le raccourci doivent montrer le MÊME dhikr
// ═══════════════════════════════════════════════════════════════════════════

test('à chaque heure, le raccourci et l’app tombent sur le même dhikr', async () => {
  // C'est LE test de cette conception. Les deux programmes ne se parlent pas :
  // le raccourci vit dans iOS, l'app dans le navigateur. Rien ne les
  // synchronise — sauf le fait qu'ils calculent tous les deux depuis l'heure.
  // Si cette concordance casse, on reçoit une bannière et on trouve autre chose
  // en ouvrant l'app, sans qu'aucune erreur n'apparaisse nulle part.
  const { dhikrDeLHeure, listePourRaccourci } = await import('./1-SOURCE/adhkar.js');
  const lignes = listePourRaccourci().split('\n');
  assert.equal(lignes.length, 24, 'une ligne par heure de la journée');
  for (let h = 0; h < 24; h++) {
    const dansLApp = dhikrDeLHeure(new Date(2026, 8, 19, h, 30)).dhikr.texte;
    // Raccourcis compte à partir de 1 : l'heure h se lit à la ligne h+1
    assert.equal(lignes[h], dansLApp, `désaccord à ${h} h`);
  }
});

test('sur ses heures de rappel, treize adhkâr différents passent chaque jour', async () => {
  // Samer a demandé « toujours différent ». Ses créneaux vont de 11 h à 23 h.
  const { ADHKAR, dhikrDeLHeure } = await import('./1-SOURCE/adhkar.js');
  const vus = [];
  for (let h = 11; h <= 23; h++) vus.push(dhikrDeLHeure(new Date(2026, 8, 19, h)).index);
  assert.equal(new Set(vus).size, vus.length, 'aucun ne doit revenir dans la journée');
  assert.equal(vus.length, 13);
  // le quatorzième n'apparaît qu'à 10 h : c'est le prix de la simplicité du
  // raccourci, et c'est écrit dans RAPPELS.md plutôt que caché.
  assert.equal(new Set(vus).size, ADHKAR.length - 1);
  assert.equal(dhikrDeLHeure(new Date(2026, 8, 19, 10)).index, 10);
});

test('le dhikr de l’heure ne dépend QUE de l’heure', async () => {
  // Pas du jour, pas des données, pas de l'ordre des ouvertures : sinon les
  // deux programmes divergeraient dès le lendemain.
  const { dhikrDeLHeure } = await import('./1-SOURCE/adhkar.js');
  const a = dhikrDeLHeure(new Date(2026, 0, 1, 15, 0));
  const b = dhikrDeLHeure(new Date(2027, 11, 31, 15, 59));
  assert.equal(a.index, b.index);
  assert.notEqual(a.index, dhikrDeLHeure(new Date(2026, 0, 1, 16, 0)).index);
});

// ═══════════════════════════════════════════════════════════════════════════
//  L'app ne notifie plus — et ce que ça remplace
// ═══════════════════════════════════════════════════════════════════════════
//
// NEUF TESTS ONT ÉTÉ RETIRÉS ICI le 19/09/2026, et il faut savoir lesquels :
// ils décrivaient la notification que l'app envoyait elle-même — la rotation
// séquentielle (`dhikrSuivant`), le débit limité (`peutNotifier`), le corps du
// message (`corpsDuRappel`), l'ordre entre l'avance du tour et l'affichage.
//
// Ils ne sont pas tombés parce qu'ils gênaient : ils sont tombés parce que la
// RÈGLE a changé. L'app n'envoie plus de notification du tout. Ce qu'ils
// protégeaient est maintenant protégé autrement, et mieux : le dhikr est une
// fonction de l'heure, donc le raccourci et l'app tombent d'accord par
// construction (test « à chaque heure, le raccourci et l'app tombent sur le
// même dhikr »), et il n'y a plus de débit à limiter puisqu'il n'y a plus de
// notification à envoyer.

// LA RÈGLE A CHANGÉ DEUX FOIS DANS LA MÊME JOURNÉE, et les deux tests qui
// étaient ici le disaient : « l'app n'envoie AUCUNE notification » et « le
// crochet du service ouvrier est gardé exprès ».
//
// Le 19/09/2026 à 12 h 59, l'app avait cessé de notifier pour supprimer une
// double bannière. Samer a tranché autrement en fin de journée : « je préfère
// quand c'était l'app qui me disait verre d'eau ou dhikr avec le dhikr écrit
// directement dans le centre de notification ». C'est lui qui s'en sert.
//
// Ce qui reste de ces deux tests est plus bas, sous une autre forme : le débit
// limité, et le fait que le contenu vienne de `dhikrDeLHeure` — donc que l'app
// et le raccourci ne PUISSENT pas se contredire.

test('c’est l’app qui notifie, et son contenu vient de l’HEURE', async () => {
  // Si le contenu venait d'ailleurs, l'app et le raccourci — qui ne se parlent
  // pas — finiraient par dire deux choses différentes.
  const { readFile } = await import('node:fs/promises');
  const app = await readFile(new URL('./1-SOURCE/app.js', import.meta.url), 'utf8');
  const fn = app.match(/async function rappelDuMoment\(\)[\s\S]*?\n\}/)?.[0];
  assert.ok(fn, 'rappelDuMoment introuvable');
  assert.match(fn, /dhikrDeLHeure\(\)/, 'le contenu doit venir de l’heure');
  assert.match(fn, /peutNotifier\(classeur\.derniereNotification\)/, 'le débit n’est pas limité');
  assert.match(fn, /Promise\.race/, 'serviceWorker.ready peut ne jamais se résoudre');
  assert.match(fn, /estUnMomentDEau/, 'le titre doit distinguer l’eau du dhikr');
});

test('la carte du dhikr lit l’HEURE, pas un compteur enregistré', async () => {
  // Un compteur enregistré se désynchroniserait du raccourci dès la première
  // ouverture manquée. L'heure, elle, est la même pour les deux programmes.
  const { readFile } = await import('node:fs/promises');
  const app = await readFile(new URL('./1-SOURCE/app.js', import.meta.url), 'utf8');
  assert.match(app, /function dhikrAffiche\(\)[\s\S]{0,400}dhikrDeLHeure\(maintenant\)/);
  assert.match(app, /function carteDhikr[\s\S]{0,160}dhikrAffiche\(\)/);
  assert.doesNotMatch(app, /classeur\.dhikrIndex/, 'plus aucun index enregistré');
});

test('feuilleter se referme tout seul quand l’heure tourne', async () => {
  // Sinon l'app resterait sur un dhikr choisi à la main et cesserait d'être
  // d'accord avec la notification, sans que personne ne comprenne pourquoi.
  const { readFile } = await import('node:fs/promises');
  const app = await readFile(new URL('./1-SOURCE/app.js', import.meta.url), 'utf8');
  const fn = app.match(/function dhikrAffiche\(\)[\s\S]*?\n\}/)?.[0];
  assert.ok(fn, 'dhikrAffiche introuvable');
  assert.match(fn, /heureDuDecalage !== maintenant\.getHours\(\)/);
  assert.match(fn, /decalageDhikr = 0/);
});

test('les 24 lignes du raccourci ne portent QUE des adhkâr', async () => {
  // Elles partent telles quelles dans une notification : un numéro, une source
  // ou une ligne vide s'y retrouveraient.
  const { listePourRaccourci } = await import('./1-SOURCE/adhkar.js');
  const lignes = listePourRaccourci().split('\n');
  assert.equal(lignes.length, 24);
  for (const l of lignes) {
    assert.ok(l.trim().length > 0, 'une ligne vide donnerait une notification vide');
    assert.doesNotMatch(l, /Bukhârî|Muslim|Abû Dâwûd|Tirmidhî|Nasâ/, 'une source a fui');
    assert.doesNotMatch(l, /^\d+[.)]/, 'un numéro a fui');
  }
});

test('la zone à coller de l’app porte EXACTEMENT les 24 lignes', async () => {
  // C'est le chemin sûr : le bouton de copie peut échouer en silence.
  const { readFile } = await import('node:fs/promises');
  const app = await readFile(new URL('./1-SOURCE/app.js', import.meta.url), 'utf8');
  assert.match(app, /id="texte-a-coller"[^>]*readonly/);
  assert.match(app, /<textarea id="texte-a-coller"[\s\S]{0,140}\$\{txt\(listePourRaccourci\(\)\)\}/,
    'la zone doit être remplie depuis listePourRaccourci(), pas à la main');
});

test('un index abîmé ne casse pas l’affichage du dhikr', async () => {
  // Un décalage manuel répété, un nombre négatif : rien ne doit planter.
  const { ADHKAR, dhikrCourant } = await import('./1-SOURCE/adhkar.js');
  assert.equal(dhikrCourant(-1).index, ADHKAR.length - 1);
  assert.equal(dhikrCourant(999).index, 999 % ADHKAR.length);
  assert.equal(dhikrCourant('bonjour').index, 0);
  assert.equal(dhikrCourant(undefined).index, 0);
  assert.equal(dhikrCourant(0, []), null);
});

test('le classeur ne garde plus de tour ni de date de notification', async () => {
  // Ils ne servent plus depuis que le dhikr est une fonction de l'heure. Un
  // champ mort dans les données se relit un jour comme vivant — et quelqu'un
  // bâtira dessus.
  const { classeurVide } = await import('./1-SOURCE/donnees.js');
  const c = classeurVide();
  assert.equal('dhikrIndex' in c, false);
  assert.equal('derniereNotification' in c, false);
  // et une vieille sauvegarde qui les porte encore ne doit pas faire planter
  const { completer } = await import('./1-SOURCE/donnees.js');
  const repris = completer({ jours: {}, dhikrIndex: 7, derniereNotification: '2026-09-19T10:00:00Z' });
  assert.deepEqual(Object.keys(repris.jours), []);
  assert.ok(repris.reglages.habitudes.length > 0);
});

test('le rappel dit « un verre d’eau » aux heures d’eau, « Dhikr » sinon', async () => {
  const { ADHKAR, rappel, estUnMomentDEau } = await import('./1-SOURCE/adhkar.js');
  const { REGLAGES_DEPART } = await import('./1-SOURCE/depart.js');
  const h = REGLAGES_DEPART.heuresEau;

  assert.equal(rappel(ADHKAR[0], true).titre, "Un verre d'eau");
  assert.equal(rappel(ADHKAR[0], false).titre, 'Dhikr');

  assert.equal(estUnMomentDEau(new Date(2026, 8, 19, 10, 30), h), true);
  assert.equal(estUnMomentDEau(new Date(2026, 8, 19, 14, 0), h), false);
  assert.equal(estUnMomentDEau(new Date(2026, 8, 19, 6, 0), h), true, 'le Fajr est une heure d’eau');
});

test('la marge d’eau absorbe le retard d’une automatisation', async () => {
  // Une automatisation iOS ne part pas à la seconde : elle peut avoir plusieurs
  // minutes de retard. Sans marge, le rappel de 10 h 30 arriverait sous le
  // mauvais titre — et l'app dirait « Dhikr » au moment de boire.
  const { estUnMomentDEau, MARGE_EAU_MINUTES } = await import('./1-SOURCE/adhkar.js');
  const h = ['10:30'];
  assert.equal(estUnMomentDEau(new Date(2026, 8, 19, 10, 40), h), true, '10 min de retard : encore l’eau');
  assert.equal(estUnMomentDEau(new Date(2026, 8, 19, 10, 50), h), false, '20 min : c’est autre chose');
  assert.equal(estUnMomentDEau(new Date(2026, 8, 19, 10, 20), h), true, 'un peu en avance aussi');
  assert.ok(MARGE_EAU_MINUTES > 0 && MARGE_EAU_MINUTES < 30, 'une marge trop large avalerait le créneau suivant');
  // une heure mal écrite ne doit pas faire planter le rappel
  assert.equal(estUnMomentDEau(new Date(2026, 8, 19, 10, 30), ['n’importe quoi']), false);
  assert.equal(estUnMomentDEau(new Date(2026, 8, 19, 10, 30), []), false);
});

test('le corps du rappel porte le texte PUIS la traduction', async () => {
  // La traduction va en dessous. Dans une notification iOS on ne peut pas lui
  // donner une taille plus petite — c'est dans l'app qu'elle l'est.
  const { ADHKAR, rappel } = await import('./1-SOURCE/adhkar.js');
  const d = ADHKAR[3];
  assert.equal(rappel(d, false).corps, `${d.texte}\n${d.traduction}`);
  // un dhikr sans traduction ne doit pas produire une ligne vide
  assert.equal(rappel({ texte: 'X' }, false).corps, 'X');
});

test('les quatorze portent une traduction, et aucune n’est vide', async () => {
  const { ADHKAR } = await import('./1-SOURCE/adhkar.js');
  for (const d of ADHKAR) {
    assert.ok(d.traduction && d.traduction.trim().length > 10, `pas de traduction : ${d.texte.slice(0, 30)}`);
    assert.doesNotMatch(d.traduction, /[؀-ۿ]/, 'la traduction doit être en français');
  }
});

test('la carte montre la traduction sous le texte', async () => {
  const { readFile } = await import('node:fs/promises');
  const app = await readFile(new URL('./1-SOURCE/app.js', import.meta.url), 'utf8');
  const fn = app.match(/function carteDhikr\([\s\S]*?\n\}/)?.[0];
  assert.ok(fn, 'carteDhikr introuvable');
  assert.ok(fn.indexOf('dhikr-texte') < fn.indexOf('dhikr-traduction'), 'la traduction vient APRÈS le texte');
  const css = await readFile(new URL('./1-SOURCE/style.css', import.meta.url), 'utf8');
  const regle = css.match(/\.dhikr-traduction \{[^}]*\}/)?.[0];
  assert.ok(regle, 'aucun style pour la traduction');
  const taille = Number(regle.match(/font-size:\s*(\d+)px/)?.[1]);
  const tailleTexte = Number(css.match(/\.dhikr-texte \{[\s\S]*?font-size:\s*(\d+)px/)?.[1]);
  assert.ok(taille < tailleTexte, `la traduction (${taille}px) doit être plus petite que le texte (${tailleTexte}px)`);
});

test('les heures d’eau sont les mêmes dans l’app et dans RAPPELS.md', async () => {
  // L'app en a besoin pour choisir le titre de la notification, le document
  // pour que Samer crée les bonnes automatisations. Si les deux divergent, il
  // recevra « Dhikr » au moment de boire, sans qu'aucune erreur n'apparaisse.
  const { readFile } = await import('node:fs/promises');
  const { REGLAGES_DEPART } = await import('./1-SOURCE/depart.js');
  const md = await readFile(new URL('./RAPPELS.md', import.meta.url), 'utf8');

  const bloc = md.split("### L'eau")[1];
  assert.ok(bloc, 'la section de l’eau est introuvable dans RAPPELS.md');
  const heures = (bloc.match(/```\n([\s\S]*?)```/)?.[1] || '').match(/\d{2}:\d{2}/g) || [];
  assert.deepEqual(heures.sort(), [...REGLAGES_DEPART.heuresEau].sort(),
    'les heures d’eau du document et celles de l’app ne concordent pas');
  assert.equal(heures.length, 8, 'huit verres, huit rappels');
});
