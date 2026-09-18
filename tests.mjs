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
