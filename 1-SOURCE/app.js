// L'écran. Tout le calcul est dans logique.js — ici on ne fait qu'afficher et
// enregistrer. Si une règle de calcul apparaît dans ce fichier, elle est au
// mauvais endroit : elle deviendra impossible à tester.

import * as L from './logique.js';
import * as D from './donnees.js';
import { DOMAINES } from './depart.js';
import { ADHKAR, texteACollerDansRaccourcis, dhikrSuivant, peutNotifier, corpsDuRappel } from './adhkar.js';

let classeur = D.lire();
let onglet = 'aujourdhui';
let fenetre = 30;
let toutVoir = false;
let bilanOuvert = false;
// Le formulaire d'ajout d'habitude, tant qu'il n'est pas validé. Hors du
// classeur exprès : une habitude à moitié tapée n'a rien à faire dans les
// données enregistrées.
let nouvelleHabitude = null;
let voirAdhkar = false;

const ecran = document.getElementById('ecran');
const piedOnglets = document.getElementById('onglets');

// ---------------------------------------------------------------------------
// Outils d'affichage
// ---------------------------------------------------------------------------

function txt(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const pourcent = (x) => `${Math.round(x * 100)} %`;
const nombre = (x) => (x % 1 === 0 ? String(x) : x.toFixed(1).replace('.', ','));

function dateEnClair(cle) {
  return L.dateDepuisCle(cle).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function dureeEnClair(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

// --- Le retour au doigt ----------------------------------------------------
//
// Apple n'a jamais implémenté l'API Vibration dans Safari : `navigator.vibrate`
// n'existe pas sur iPhone. Le seul chemin qui marche passe par un effet de bord
// de `<input type="checkbox" switch>` (Safari 17.4+) : basculer cet élément
// DEPUIS SON LABEL déclenche le moteur haptique du téléphone.
//
// C'est un détournement, donc il peut disparaître à une mise à jour d'iOS — il
// est enveloppé pour que rien ne casse le jour où ça arrive. Un retour au doigt
// est un confort, jamais une fonction.
let leviersHaptiques = null;
function preparerHaptique() {
  if (leviersHaptiques) return leviersHaptiques;
  const label = document.createElement('label');
  label.setAttribute('aria-hidden', 'true');
  label.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none';
  const boite = document.createElement('input');
  boite.type = 'checkbox';
  boite.setAttribute('switch', '');
  label.appendChild(boite);
  document.body.appendChild(label);
  leviersHaptiques = { label, boite };
  return leviersHaptiques;
}

function vibrer(force = 1) {
  try {
    if (navigator.vibrate) { navigator.vibrate(force > 1 ? [12, 40, 12] : 10); return; }
    const { label } = preparerHaptique();
    for (let i = 0; i < force; i++) setTimeout(() => label.click(), i * 70);
  } catch { /* un retour au doigt absent ne doit jamais empêcher de cocher */ }
}

// ---------------------------------------------------------------------------
// L'état
// ---------------------------------------------------------------------------

function aujourdhui() { return L.cleDuJour(); }
function gels() { return classeur.gels?.utilises || []; }

function jourCourant() {
  const cle = aujourdhui();
  if (!classeur.jours[cle]) classeur.jours[cle] = L.jourVide();
  return classeur.jours[cle];
}

let minuteurEnregistrement = null;
function enregistrer(differe = false) {
  if (!differe) { D.ecrire(classeur); return; }
  clearTimeout(minuteurEnregistrement);
  minuteurEnregistrement = setTimeout(() => D.ecrire(classeur), 400);
}

// ---------------------------------------------------------------------------
// Aujourd'hui
// ---------------------------------------------------------------------------

function vueAujourdhui() {
  const cle = aujourdhui();
  const jour = jourCourant();
  const matin = L.estLeMatin(classeur.reglages);
  const { maintenant, plusTard } = L.habitudesDuMoment(classeur.reglages, matin);
  const aMontrer = toutVoir ? [...maintenant, ...plusTard] : maintenant;
  const prog = L.progressionNiveau(classeur.jours, classeur.reglages);
  const { gagnes, possibles } = L.pointsDuJour(jour, classeur.reglages);
  const longue = L.plusLongueChaine(classeur.jours, classeur.reglages, cle, gels());

  let html = `
    <div class="entete">
      <div class="haut-ligne">
        <div class="date">${txt(dateEnClair(cle))}</div>
        <button class="rang" data-onglet="cumul">
          <b>${prog.niveau}</b> · ${txt(prog.rang)}
        </button>
      </div>
      <div class="moment">${matin ? 'Ce matin' : 'Ce soir'}</div>
    </div>`;

  html += blocGelOuAlerte(cle);

  // L'anneau : le retour immédiat. Sans lui, cocher une case ne produit rien de
  // visible, et rien de visible veut dire rien de ressenti.
  const part = possibles === 0 ? 0 : gagnes / possibles;
  const reste = Math.max(0, possibles - Math.ceil(gagnes));
  html += `
    <div class="carte anneau-carte">
      <div class="anneau-ligne">
        ${anneauSVG(part)}
        <div class="anneau-texte">
          <div class="anneau-chiffre">${nombre(gagnes)}<span>/${possibles}</span></div>
          <div class="anneau-quoi">${reste === 0
    ? 'La journée est pleine.'
    : `il reste ${reste} chose${reste > 1 ? 's' : ''}`}</div>
          ${longue.jours > 0 ? ligneChaineEnTete(longue) : ''}
        </div>
      </div>
      ${barreNiveau(prog)}
    </div>`;

  html += `
    <div class="carte chose ${jour.choseFaite ? 'faite' : ''}">
      <h2>La chose du jour</h2>
      <div class="sous">Celle qui, faite seule, rendrait la journée utile.</div>
      <div class="chose-ligne">
        <input type="text" id="chose" placeholder="Une seule." value="${txt(jour.chose)}" />
        <button class="case" data-action="chose-faite" aria-pressed="${jour.choseFaite}" aria-label="C'est fait">✓</button>
      </div>
    </div>`;

  for (const [idDomaine, domaine] of Object.entries(DOMAINES)) {
    const duDomaine = aMontrer.filter((h) => h.domaine === idDomaine);
    if (duDomaine.length === 0) continue;
    html += `<div class="carte ${idDomaine}"><h2>${txt(domaine.libelle)}</h2>`;
    for (const h of duDomaine) html += ligneHabitude(h, jour, cle);
    html += `</div>`;
  }

  if (plusTard.length > 0) {
    html += `<button class="replier" data-action="tout-voir">${
      toutVoir ? '— Ne montrer que ce moment-ci' : `+ Voir aussi ${plusTard.map((h) => h.libelle).join(', ')}`
    }</button>`;
  }

  html += `<div class="carte"><h2>Les projets</h2>`;
  if (classeur.reglages.projets.length === 0) {
    html += `<div class="vide">Aucun projet. Ajoute-les dans les réglages.</div>`;
  }
  for (const nom of classeur.reglages.projets) {
    const p = jour.projets[nom] || {};
    html += `
      <div class="ligne" style="display:block">
        <div class="libelle" style="margin-bottom:8px">${txt(nom)}</div>
        <div class="trio" style="grid-template-columns: 1fr 96px">
          <input type="text" data-projet-ligne="${txt(nom)}" placeholder="Sur quoi j'ai avancé" value="${txt(p.ligne || '')}" />
          <input type="number" inputmode="numeric" data-projet-minutes="${txt(nom)}" placeholder="min" value="${p.minutes ?? ''}" />
        </div>
      </div>`;
  }
  html += `</div>`;

  html += `
    <div class="carte">
      <h2>La journée, en une ligne</h2>
      <textarea id="note" placeholder="Ce qui s'est vraiment passé. Sans arranger.">${txt(jour.note)}</textarea>
      <div class="boutons" style="margin-top:12px">
        <button class="bouton or" data-action="fermer-journee">Fermer la journée</button>
      </div>
    </div>`;

  if (bilanOuvert) html += vueBilan(cle);
  return html;
}

// Le gel, ou l'alerte — jamais les deux. Le gel passe devant : s'il y a une
// porte de sortie, on la montre AVANT de parler d'échec.
function blocGelOuAlerte(cle) {
  const enDanger = L.habitudesActives(classeur.reglages).filter((h) => L.enDanger(classeur.jours, h, cle));
  if (enDanger.length === 0) return '';
  const hier = L.cleDecalee(cle, -1);
  if (gels().includes(hier)) return '';
  // Un refus vaut pour ce jour-là : une proposition qu'on ne peut pas écarter
  // revient à chaque ouverture, et devient du harcèlement.
  const refuse = classeur.gelRefuse === hier;

  const stock = L.gelsEnStock(classeur.jours, classeur.reglages, gels());
  const enJeu = L.chaineSauveeParUnGel(classeur.jours, classeur.reglages, cle, gels());

  if (!refuse && stock > 0 && enJeu.jours > 1) {
    return `
      <div class="gel">
        <div class="titre">◆ Un gel peut sauver hier</div>
        <div class="quoi">Hier, <b>${txt(enJeu.habitude.libelle)}</b> n'a pas été tenu. Tu as
        <b>${stock} gel${stock > 1 ? 's' : ''}</b> : en dépenser un efface le trou et garde ta chaîne de
        <b>${enJeu.jours} jours</b>.</div>
        <div class="boutons" style="margin-top:11px">
          <button class="bouton or" data-action="depenser-gel">Dépenser un gel</button>
          <button class="bouton" data-action="refuser-gel">Non, j'assume</button>
        </div>
      </div>`;
  }

  return `
    <div class="alerte">
      <div class="titre">Jamais deux fois de suite</div>
      <div class="quoi">Hier, tu as manqué : ${txt(enDanger.map((h) => h.libelle).join(', '))}.</div>
      <div class="regle">Manquer une fois est un accident. Manquer deux fois, c'est la nouvelle habitude qui commence.</div>
    </div>`;
}

function ligneChaineEnTete(longue) {
  const p = L.prochainPalier(longue.jours);
  return `<div class="anneau-chaine">🔥 ${longue.jours} jours — ${txt(longue.habitude.libelle)}${
    p ? ` · palier ${p.palier} dans ${p.reste} j` : ''}</div>`;
}

// L'anneau est dessiné à la main : pas de bibliothèque, net à toutes les
// tailles, et il s'anime tout seul par une transition CSS sur le tracé.
function anneauSVG(part) {
  const r = 46;
  const tour = 2 * Math.PI * r;
  return `
    <svg class="anneau" viewBox="0 0 110 110" aria-hidden="true">
      <circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--encre)" stroke-width="9" />
      <circle class="anneau-trace" cx="55" cy="55" r="${r}" fill="none"
        stroke="${part >= 1 ? 'var(--tenu)' : 'var(--or)'}" stroke-width="9" stroke-linecap="round"
        stroke-dasharray="${tour.toFixed(1)}"
        stroke-dashoffset="${(tour * (1 - Math.min(1, part))).toFixed(1)}"
        transform="rotate(-90 55 55)" />
    </svg>`;
}

// Le niveau : ce qui ne se perd jamais. La chaîne punit, le niveau garde — sans
// lui, une mauvaise semaine efface tout et on ferme l'app pour de bon.
function barreNiveau(prog) {
  return `
    <div class="niveau">
      <div class="niveau-haut">
        <span>Niveau ${prog.niveau} · ${txt(prog.rang)}</span>
        <b>${nombre(prog.manque)} pts pour le ${prog.niveau + 1}</b>
      </div>
      <div class="barre"><i style="width:${Math.round(prog.part * 100)}%;background:var(--or)"></i></div>
    </div>`;
}

function ligneHabitude(h, jour, cle) {
  const valeur = jour.tenu[h.id];
  const chaine = L.chaineAvecGels(classeur.jours, h, cle, gels());
  const grille = L.grilleSemaine(classeur.jours, h, cle, gels())
    .map((c) => `<i class="j-${c.etat}"></i>`).join('');

  const nom = `
    <div class="nom">
      <div class="libelle">${txt(h.libelle)}</div>
      ${h.detail ? `<div class="detail">${txt(h.detail)}</div>` : ''}
    </div>`;
  // La semaine occupe sa PROPRE ligne, sur toute la largeur.
  // Trouvé à l'écran le 18/09/2026 : glissée à côté du nom, elle passait sous
  // les boutons des prières, qui sont la commande la plus large de l'app.
  const semaine = `<div class="semaine">${grille}${
    chaine > 0 ? `<span class="chaine">${chaine >= 7 ? '🔥 ' : ''}${chaine} j</span>` : ''}</div>`;

  if (h.type === 'priere') {
    return `
      <div class="ligne ${L.tenue(h, valeur) ? '' : 'rate'}">
        ${nom}
        <div class="priere-choix">
          <button data-priere="${txt(h.id)}" data-valeur="heure" aria-pressed="${valeur === 'heure'}">à l'heure</button>
          <button class="rattrape" data-priere="${txt(h.id)}" data-valeur="rattrapee" aria-pressed="${valeur === 'rattrapee'}">rattrapée</button>
        </div>
        ${semaine}
      </div>`;
  }

  if (h.type === 'compteur') {
    const n = Number(valeur) || 0;
    const plein = n >= (h.objectif || 1);
    return `
      <div class="ligne">
        ${nom}
        <div class="compteur">
          <button data-compteur="${txt(h.id)}" data-pas="-1" aria-label="Moins">−</button>
          <div class="valeur ${plein ? 'plein' : ''}">${n} / ${h.objectif || 1}</div>
          <button data-compteur="${txt(h.id)}" data-pas="1" aria-label="Plus">+</button>
        </div>
        ${semaine}
      </div>`;
  }

  return `
    <div class="ligne ${valeur ? '' : 'rate'}">
      ${nom}
      <button class="case" data-bascule="${txt(h.id)}" aria-pressed="${!!valeur}" aria-label="${txt(h.libelle)}">✓</button>
      ${semaine}
    </div>`;
}

// Le bilan : ce qu'on lit quand la journée est finie. Sans lui, une journée
// tenue ne laisse aucune trace — et c'est exactement le problème que décrit
// L'Effet cumulé : l'effort ne renvoie aucun signal.
function vueBilan(cle) {
  const b = L.bilanDuJour(classeur.jours, classeur.reglages, cle, gels());
  const v = L.votes(classeur.jours, classeur.reglages, cle, 30);
  const prochainGel = L.joursAvantProchainGel(classeur.jours, classeur.reglages);

  let paliers = '';
  for (const p of b.paliersFranchis) {
    paliers += `<div class="palier">◆ <b>${p.n} jours</b> de ${txt(p.h.libelle)}${
      p.n === 7 ? ' — le palier qui compte le plus : au-delà, on tient trois fois plus souvent.' : ''}</div>`;
  }

  return `
    <div class="voile" data-action="fermer-bilan">
      <div class="bilan" role="dialog" aria-label="Bilan de la journée">
        <div class="bilan-titre">${b.complet ? 'Journée pleine.' : 'Journée fermée.'}</div>
        <div class="bilan-score">${nombre(b.gagnes)} <span>sur ${b.possibles}</span></div>
        ${paliers}
        <div class="bilan-lignes">
          <div><span>Ta plus longue chaîne</span><b>${b.plusLongueChaine.jours} j${
  b.plusLongueChaine.habitude ? ` · ${txt(b.plusLongueChaine.habitude.libelle)}` : ''}</b></div>
          <div><span>Niveau</span><b>${b.niveau.niveau} · ${txt(b.niveau.rang)}</b></div>
          <div><span>Votes ce mois-ci pour « ${txt(classeur.reglages.identite)} »</span><b>${v}</b></div>
          <div><span>Prochain gel</span><b>dans ${prochainGel} jour${prochainGel > 1 ? 's' : ''}</b></div>
        </div>
        <div class="boutons" style="margin-top:16px">
          <button class="bouton or" data-action="fermer-bilan">Fermer</button>
        </div>
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Le cumul
// ---------------------------------------------------------------------------

function vueCumul() {
  const cle = aujourdhui();
  const points = L.courbeCumul(classeur.jours, classeur.reglages, cle, fenetre);
  const actives = L.habitudesActives(classeur.reglages);
  const prog = L.progressionNiveau(classeur.jours, classeur.reglages);
  const stock = L.gelsEnStock(classeur.jours, classeur.reglages, gels());

  let html = `
    <div class="entete">
      <div class="date">Le cumul</div>
      <div class="moment">Ce qui s'additionne</div>
      <div class="identite">Une journée ne se voit pas. Trente, si.</div>
    </div>

    <div class="carte">
      <h2>Ton niveau — il ne se perd jamais</h2>
      <div class="grand-rang">${prog.niveau} <span>${txt(prog.rang)}</span></div>
      ${barreNiveau(prog)}
      <div class="note-bas">${nombre(prog.total)} points depuis le début. Une chaîne se casse ; un niveau, non — c'est ce qui reste après une mauvaise semaine.</div>
    </div>

    <div class="carte">
      <h2>Tes gels de chaîne</h2>
      <div class="gels-rangee">${
  Array.from({ length: L.GELS_MAX }, (_, i) => `<i class="${i < stock ? 'plein' : ''}"></i>`).join('')
}<span>${stock} sur ${L.GELS_MAX}</span></div>
      <div class="note-bas">Un gel efface un jour manqué et garde ta chaîne. Il s'en gagne un tous les ${L.JOURS_PAR_GEL} jours tenus —
      prochain dans <b>${L.joursAvantProchainGel(classeur.jours, classeur.reglages)} jour${L.joursAvantProchainGel(classeur.jours, classeur.reglages) > 1 ? 's' : ''}</b>.
      Ils ne s'achètent pas.</div>
    </div>

    <div class="carte">
      <h2>Ta courbe, et celle du sans-faute</h2>
      ${courbeSVG(points)}
      <div class="legende">
        <span><i style="background:var(--or)"></i>toi</span>
        <span><i style="background:var(--texte-faible)"></i>en tenant tout</span>
      </div>
      <div class="boutons" style="margin-top:12px">
        ${[7, 30, 90].map((n) => `<button class="bouton ${fenetre === n ? 'or' : ''}" data-fenetre="${n}">${n} jours</button>`).join('')}
      </div>
    </div>

    <div class="carte">
      <h2>Tes votes — ${fenetre} jours</h2>
      <div class="grand-rang">${L.votes(classeur.jours, classeur.reglages, cle, fenetre)} <span>votes</span></div>
      <div class="note-bas">« Chaque action est un vote pour la personne que tu veux devenir. »
      Ici, la personne est : <b>${txt(classeur.reglages.identite)}</b></div>
    </div>`;

  html += `<div class="carte"><h2>Ce que tu as réellement tenu — ${fenetre} jours</h2><div class="parts">`;
  for (const [id, d] of Object.entries(DOMAINES)) {
    const part = L.partTenue(classeur.jours, classeur.reglages, cle, fenetre, id);
    if (part === null) continue;
    html += `
      <div class="part">
        <div class="haut"><span>${txt(d.libelle)}</span><b>${pourcent(part)}</b></div>
        <div class="barre"><i style="width:${Math.round(part * 100)}%;background:var(--${d.couleur})"></i></div>
      </div>`;
  }
  const total = L.partTenue(classeur.jours, classeur.reglages, cle, fenetre);
  html += `
      <div class="part">
        <div class="haut"><span>Tout</span><b>${total === null ? '—' : pourcent(total)}</b></div>
        <div class="barre"><i style="width:${total === null ? 0 : Math.round(total * 100)}%;background:var(--texte-doux)"></i></div>
      </div>
    </div></div>`;

  html += `<div class="carte"><h2>Les chaînes</h2>`;
  const chaines = actives
    .map((h) => ({
      h,
      en: L.chaineAvecGels(classeur.jours, h, cle, gels()),
      record: L.meilleureChaine(classeur.jours, h),
    }))
    .sort((a, b) => b.en - a.en);
  for (const c of chaines) {
    const p = L.prochainPalier(c.en);
    html += `
      <div class="ligne">
        <div class="nom">
          <div class="libelle">${txt(c.h.libelle)}</div>
          <div class="detail">record : ${c.record} j${p ? ` · palier ${p.palier} dans ${p.reste} j` : ' · tous les paliers franchis'}</div>
        </div>
        <div class="chaine" style="font-size:17px">${c.en >= 7 ? '🔥 ' : ''}${c.en} j</div>
        <div class="semaine">${L.grilleSemaine(classeur.jours, c.h, cle, gels()).map((x) => `<i class="j-${x.etat}"></i>`).join('')}</div>
      </div>`;
  }
  html += `</div>`;

  const projets = L.tempsParProjet(classeur.jours, cle, fenetre);
  html += `<div class="carte"><h2>Le temps sur tes projets — ${fenetre} jours</h2>`;
  if (projets.length === 0) {
    html += `<div class="vide">Rien de noté pour l'instant.</div>`;
  } else {
    const max = projets[0].minutes;
    for (const p of projets) {
      html += `
        <div class="part" style="margin-bottom:12px">
          <div class="haut"><span>${txt(p.nom)}</span><b>${txt(dureeEnClair(p.minutes))}</b></div>
          <div class="barre"><i style="width:${Math.round((p.minutes / max) * 100)}%;background:var(--tete)"></i></div>
        </div>`;
    }
  }
  html += `</div>`;
  return html;
}

function courbeSVG(points) {
  const large = 520;
  const haut = 170;
  const marge = 6;
  const maxi = Math.max(1, points[points.length - 1]?.plein || 1);
  const x = (i) => marge + (i / Math.max(1, points.length - 1)) * (large - 2 * marge);
  const y = (v) => haut - marge - (v / maxi) * (haut - 2 * marge);
  const chemin = (champ) => points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p[champ]).toFixed(1)}`).join(' ');
  const aire = `${chemin('reel')} L${x(points.length - 1).toFixed(1)},${haut - marge} L${x(0).toFixed(1)},${haut - marge} Z`;

  return `
    <svg class="courbe" viewBox="0 0 ${large} ${haut}" preserveAspectRatio="none" aria-label="Courbe du cumul">
      <path d="${aire}" fill="rgba(216,169,74,.12)" />
      <path d="${chemin('plein')}" fill="none" stroke="var(--texte-faible)" stroke-width="1.5" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" />
      <path d="${chemin('reel')}" fill="none" stroke="var(--or)" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linejoin="round" />
    </svg>`;
}

// ---------------------------------------------------------------------------
// L'argent
// ---------------------------------------------------------------------------

function vueArgent() {
  const cle = aujourdhui();
  const p = L.projectionArgent(classeur.argent, cle);
  const moisCourant = L.cleDuMois(cle);

  let html = `
    <div class="entete">
      <div class="date">L'argent</div>
      <div class="moment">Où tu en es</div>
      <div class="identite">Pas de compte connecté. Rien ne sort de ce téléphone.</div>
    </div>`;

  html += `<div class="${classeVerdict(p)}">${phraseVerdict(p)}</div>`;

  if (p.objectif > 0) {
    const part = Math.max(0, Math.min(1, p.partObjectif || 0));
    html += `
      <div class="carte">
        <h2>${txt(classeur.argent.objectif.libelle || 'Objectif')} — ${txt(euros.format(p.objectif))}</h2>
        <div class="part">
          <div class="haut"><span>${txt(euros.format(p.valeur))}</span><b>${pourcent(part)}</b></div>
          <div class="barre"><i style="width:${Math.round(part * 100)}%;background:var(--or)"></i></div>
        </div>
        <div class="chiffres" style="margin-top:14px">
          <div class="chiffre"><div class="val">${txt(euros.format(p.restant || 0))}</div><div class="quoi">il reste à faire</div></div>
          <div class="chiffre"><div class="val">${p.moisRestants ?? '—'}</div><div class="quoi">mois avant l'échéance</div></div>
          <div class="chiffre"><div class="val">${p.rythmeNecessaire === null ? '—' : txt(euros.format(p.rythmeNecessaire))}</div><div class="quoi">par mois, pour y être</div></div>
          <div class="chiffre"><div class="val">${p.rythmeReel === null ? '—' : txt(euros.format(p.rythmeReel))}</div><div class="quoi">ton rythme réel</div></div>
        </div>
      </div>`;
  }

  html += `
    <div class="carte">
      <h2>Ce que tu as mis de côté — ${txt(L.moisEnClair(cle))}</h2>
      <label class="champ">
        <span>Ce mois-ci</span>
        <input type="number" inputmode="decimal" id="mise-du-mois" placeholder="0" value="${classeur.argent.mois[moisCourant] ?? ''}" />
      </label>`;
  const passes = L.moisTries(classeur.argent.mois).filter((m) => m.mois < moisCourant).slice(-6).reverse();
  for (const m of passes) {
    html += `<div class="ligne"><div class="nom"><div class="libelle">${txt(L.moisEnClair(`${m.mois}-01`))}</div></div>
      <div class="chaine">${txt(euros.format(m.misDeCote))}</div></div>`;
  }
  html += `</div>`;

  html += `<div class="carte"><h2>Où c'est placé</h2>`;
  if (classeur.argent.placements.length === 0) {
    html += `<div class="vide">Rien encore. Ajoute un placement ci-dessous.</div>`;
  }
  classeur.argent.placements.forEach((pl, i) => {
    const investi = Number(pl.investi) || 0;
    const valeur = pl.valeur === '' || pl.valeur === undefined || pl.valeur === null ? investi : Number(pl.valeur);
    const gain = valeur - investi;
    html += `
      <div class="placement">
        <div class="titre">
          <input type="text" data-placement="${i}" data-champ="nom" value="${txt(pl.nom || '')}" placeholder="Nom (ETF Monde, PEA, livret…)" />
          <span class="gain ${gain >= 0 ? 'positif' : 'negatif'}">${gain >= 0 ? '+' : ''}${txt(euros.format(gain))}</span>
        </div>
        <div class="trio">
          <label class="champ" style="margin:0"><span>investi</span>
            <input type="number" inputmode="decimal" data-placement="${i}" data-champ="investi" value="${pl.investi ?? ''}" /></label>
          <label class="champ" style="margin:0"><span>vaut aujourd'hui</span>
            <input type="number" inputmode="decimal" data-placement="${i}" data-champ="valeur" value="${pl.valeur ?? ''}" /></label>
          <button class="bouton danger" data-action="retirer-placement" data-index="${i}" aria-label="Retirer">✕</button>
        </div>
      </div>`;
  });
  html += `<div class="boutons" style="margin-top:14px">
      <button class="bouton or" data-action="ajouter-placement">+ Un placement</button>
    </div>
    <div class="note-bas">La valeur se met à jour à la main, quand tu regardes tes comptes. Une valeur jamais relevée compte pour ce qu'elle a coûté — l'app n'invente pas de performance.</div>
  </div>`;

  html += `
    <div class="carte">
      <h2>L'objectif</h2>
      <label class="champ"><span>Nom</span>
        <input type="text" id="obj-libelle" value="${txt(classeur.argent.objectif.libelle || '')}" placeholder="Indépendance" /></label>
      <label class="champ"><span>Montant visé (€)</span>
        <input type="number" inputmode="decimal" id="obj-montant" value="${classeur.argent.objectif.montant || ''}" /></label>
      <label class="champ"><span>Échéance</span>
        <input type="text" id="obj-echeance" value="${txt(classeur.argent.objectif.echeance || '')}" placeholder="2027-12-31" /></label>
    </div>`;
  return html;
}

function classeVerdict(p) {
  if (p.verdict === 'en retard' || p.verdict === 'jamais') return 'verdict retard';
  if (p.verdict === 'en avance' || p.verdict === 'atteint') return 'verdict avance';
  return 'verdict neutre';
}

function phraseVerdict(p) {
  switch (p.verdict) {
    case 'atteint':
      return `<b>L'objectif est atteint.</b> Il est temps d'en poser un autre.`;
    case 'jamais':
      return `<b>À ce rythme, jamais.</b> Rien n'a été mis de côté ces derniers mois.`;
    case 'en retard':
      return `<b>À ce rythme, ${txt(L.moisEnClair(`${p.dateProjetee}-01`))}</b> — soit ${p.moisProjetes - p.moisRestants} mois après l'échéance. Il faudrait ${txt(euros.format(p.rythmeNecessaire))} par mois au lieu de ${txt(euros.format(p.rythmeReel))}.`;
    case 'en avance':
      return `<b>À ce rythme, ${txt(L.moisEnClair(`${p.dateProjetee}-01`))}</b> — soit ${p.moisRestants - p.moisProjetes} mois avant l'échéance.`;
    case 'sans echeance':
      return `<b>À ce rythme, ${txt(L.moisEnClair(`${p.dateProjetee}-01`))}.</b>`;
    default:
      return `Pose un montant visé et note ce que tu mets de côté pendant deux mois : l'app pourra alors dire où ce rythme te mène.`;
  }
}

// ---------------------------------------------------------------------------
// Les réglages
// ---------------------------------------------------------------------------

function vueReglages() {
  const r = classeur.reglages;
  const permission = typeof Notification === 'undefined' ? 'absente' : Notification.permission;

  let html = `
    <div class="entete">
      <div class="date">Réglages</div>
      <div class="moment">Ce que tu suis</div>
      <div class="identite">Peu d'habitudes tenues valent mieux que beaucoup abandonnées.</div>
    </div>

    <div class="carte">
      <h2>Qui tu es</h2>
      <label class="champ"><span>La phrase du haut de l'écran, et ce pour quoi tu votes</span>
        <input type="text" id="identite" value="${txt(r.identite)}" /></label>
      <div class="note-bas">Une habitude tient quand elle prouve une identité, pas quand elle vise un résultat.
      Chaque case cochée est un vote — l'app les compte dans l'onglet Le cumul.</div>
    </div>

    <div class="carte">
      <h2>Le rappel du jour</h2>
      <div class="rappel-etat ${permission === 'granted' ? 'ok' : ''}">${etatRappel(permission)}</div>
      ${permission === 'granted' ? '' : `
        <div class="boutons" style="margin-top:11px">
          <button class="bouton or" data-action="autoriser-rappels">Autoriser les notifications</button>
        </div>`}
      <div class="note-bas" style="margin-top:12px">
        <b>Ce qu'une app web NE PEUT PAS faire sur iPhone</b> : se réveiller toute seule.
        Il faudrait un serveur qui envoie la notification. Et <b>iOS n'a aucun déclencheur
        « toutes les 20 minutes »</b> : les automatisations ne partent qu'à des heures fixes.
        <br><br>
        <b>Ce qui marche</b> : l'app <i>Raccourcis</i>, une automatisation par heure.
        Le mode d'emploi complet est dans <i>RAPPELS.md</i>.
      </div>
    </div>

    <div class="carte">
      <h2>Le dhikr — ${ADHKAR.length} adhkâr en rotation</h2>
      <div class="note-bas" style="margin:0 0 12px">
        Colle cette liste dans l'action <b>Texte</b> du raccourci « Dhikr » : il en tire un au hasard
        et l'affiche. Une ligne par dhikr, rien d'autre — chaque caractère en trop se retrouverait
        dans la notification.
      </div>
      <div class="boutons">
        <button class="bouton or" data-action="copier-adhkar">Copier les ${ADHKAR.length} adhkâr</button>
        <button class="bouton" data-action="voir-adhkar">${voirAdhkar ? 'Masquer' : 'Les voir avec leurs sources'}</button>
      </div>

      <label class="champ" style="margin-top:14px;margin-bottom:0">
        <span>Le texte à coller — si le bouton ne donne rien, appui long ici → Tout sélectionner → Copier</span>
        <textarea id="texte-a-coller" readonly rows="6" style="font-size:14px">${txt(texteACollerDansRaccourcis())}</textarea>
      </label>
      ${voirAdhkar ? listeAdhkar() : ''}
      <div class="note-bas" style="margin-top:12px">
        <b>Ce qui est garanti, et ce qui ne l'est pas.</b> Deux ont été vérifiés directement à la
        source ; les autres viennent de recueils très connus, sans vérification une par une. Un a
        une authenticité discutée, et il est marqué. <b>Contrôle-les avec ta propre référence.</b>
      </div>
    </div>

    <div class="carte">
      <h2>Tes habitudes</h2>`;
  r.habitudes.forEach((h, i) => {
    html += `
      <div class="placement">
        <div class="titre">
          <span class="nom">${txt(h.libelle)} <span class="detail" style="color:var(--texte-faible)">· ${txt(DOMAINES[h.domaine]?.libelle || h.domaine)}</span></span>
          <span class="boutons" style="flex:none">
            <button class="bouton ${h.actif === false ? '' : 'or'}" data-action="basculer-habitude" data-index="${i}">${h.actif === false ? 'éteinte' : 'active'}</button>
            <button class="bouton danger" data-action="supprimer-habitude" data-index="${i}" aria-label="Supprimer ${txt(h.libelle)}">✕</button>
          </span>
        </div>
        ${h.type === 'compteur'
      ? `<div class="trio" style="grid-template-columns:1fr 1fr"><label class="champ" style="margin:0"><span>objectif</span>
             <input type="number" inputmode="numeric" data-habitude="${i}" data-champ="objectif" value="${h.objectif ?? ''}" /></label>
             <label class="champ" style="margin:0"><span>unité</span>
             <input type="text" data-habitude="${i}" data-champ="unite" value="${txt(h.unite || '')}" /></label></div>`
      : h.type === 'priere' ? ''
        : `<label class="champ" style="margin-top:9px;margin-bottom:0"><span>la règle, en clair</span>
             <input type="text" data-habitude="${i}" data-champ="detail" value="${txt(h.detail || '')}" placeholder="ex. pas de sucre ajouté" /></label>`}
      </div>`;
  });
  html += formulaireHabitude();
  html += `<div class="note-bas"><b>Éteindre</b> garde l'histoire : l'habitude sort des comptes mais reste dans la liste.
  <b>Supprimer</b> (✕) la retire de la liste — et ne touche à aucune journée passée : si tu la recrées du même nom,
  son passé revient.
  <br><br>Et peu d'habitudes tenues battent toujours beaucoup d'habitudes abandonnées — plus de la moitié des gens
  arrêtent une app de suivi dans les trente jours, presque toujours pour en avoir mis trop.</div></div>`;

  html += `
    <div class="carte">
      <h2>Tes projets</h2>
      <label class="champ"><span>Un par ligne</span>
        <textarea id="projets">${txt(r.projets.join('\n'))}</textarea></label>
      <div class="note-bas">L'app ne lit aucun fichier de tes dossiers de travail : tu écris la ligne toi-même. C'est ce qui fait qu'elle ne cassera pas le jour où tu renommes un dossier.</div>
    </div>

    <div class="carte">
      <h2>Le passage du matin au soir</h2>
      <label class="champ"><span>Heure de bascule</span>
        <input type="number" inputmode="numeric" id="bascule" min="0" max="23" value="${r.heureBascule}" /></label>
    </div>`;

  const derniere = classeur.derniereSauvegarde;
  const joursDepuis = derniere ? Math.round((Date.now() - new Date(derniere).getTime()) / 86400000) : null;
  html += `
    <div class="carte">
      <h2>La sauvegarde</h2>
      <div class="note-bas" style="margin:0 0 12px">
        Tout vit dans ce téléphone, et nulle part ailleurs. Vider les données de Safari effacerait tout.
        ${derniere ? `Dernière sauvegarde il y a ${joursDepuis} jour${joursDepuis > 1 ? 's' : ''}.` : "<b style='color:var(--danger)'>Jamais sauvegardé.</b>"}
      </div>
      <div class="boutons">
        <button class="bouton or" data-action="sauvegarder">Enregistrer une sauvegarde</button>
        <button class="bouton" data-action="restaurer">Restaurer un fichier</button>
      </div>
      <input type="file" id="fichier-restauration" accept="application/json,.json" style="display:none" />
    </div>

    <div class="carte">
      <h2>Si l'app se coince sur une vieille version</h2>
      <div class="note-bas" style="margin:0 0 12px">
        L'app garde une copie d'elle-même dans le téléphone pour marcher sans réseau.
        Si un jour elle refuse de se mettre à jour, ce bouton efface cette copie et la
        recharge. <b>Tes données ne sont pas touchées</b> — elles vivent ailleurs.
      </div>
      <div class="boutons">
        <button class="bouton danger" data-action="vider-le-cache">Vider le cache et recharger</button>
      </div>
    </div>`;
  return html;
}

// Le formulaire d'ajout. Fermé par défaut : une app qu'on ouvre chaque jour ne
// doit pas montrer en permanence de quoi la reconfigurer.
function formulaireHabitude() {
  if (!nouvelleHabitude) {
    return `<div class="boutons" style="margin-top:14px">
      <button class="bouton or" data-action="ouvrir-formulaire">+ Une habitude</button>
    </div>`;
  }
  const n = nouvelleHabitude;
  return `
    <div class="placement" style="border-top-color:var(--or-sombre)">
      <label class="champ"><span>Le nom</span>
        <input type="text" id="nh-libelle" value="${txt(n.libelle)}" placeholder="ex. Méditer, Marcher, Coran" /></label>
      <div class="trio" style="grid-template-columns:1fr 1fr">
        <label class="champ" style="margin:0"><span>Domaine</span>
          <select id="nh-domaine">${Object.entries(DOMAINES).map(([id, d]) =>
    `<option value="${id}" ${n.domaine === id ? 'selected' : ''}>${txt(d.libelle)}</option>`).join('')}</select></label>
        <label class="champ" style="margin:0"><span>Comment ça se coche</span>
          <select id="nh-type">${L.TYPES_HABITUDE.map((t) =>
    `<option value="${t.type}" ${n.type === t.type ? 'selected' : ''}>${txt(t.libelle)}</option>`).join('')}</select></label>
      </div>
      ${n.type === 'compteur'
    ? `<div class="trio" style="grid-template-columns:1fr 1fr;margin-top:12px">
           <label class="champ" style="margin:0"><span>objectif</span>
             <input type="number" inputmode="numeric" id="nh-objectif" value="${n.objectif}" /></label>
           <label class="champ" style="margin:0"><span>unité</span>
             <input type="text" id="nh-unite" value="${txt(n.unite)}" placeholder="verres, pages…" /></label>
         </div>`
    : `<label class="champ" style="margin-top:12px;margin-bottom:0"><span>la règle, en clair (facultatif)</span>
           <input type="text" id="nh-detail" value="${txt(n.detail)}" placeholder="ex. 10 pages" /></label>`}
      <div class="boutons" style="margin-top:14px">
        <button class="bouton or" data-action="valider-habitude">Ajouter</button>
        <button class="bouton" data-action="annuler-habitude">Annuler</button>
      </div>
    </div>`;
}

function listeAdhkar() {
  return `<div style="margin-top:14px">${ADHKAR.map((d, i) => `
    <div class="placement">
      <div class="libelle" style="font-size:15px">${i + 1}. ${txt(d.texte)}</div>
      <div class="detail" style="margin-top:5px">${txt(d.source)}${
  d.verifie ? ' · <b style="color:var(--tenu)">vérifié à la source</b>' : ''}${
  d.discute ? ' · <b style="color:var(--danger)">authenticité discutée</b>' : ''}</div>
    </div>`).join('')}</div>`;
}

function etatRappel(permission) {
  if (permission === 'absente') return "Ce navigateur ne connaît pas les notifications. Rien à activer.";
  if (permission === 'granted') return "✓ Les notifications sont autorisées. L'app peut t'afficher ce qu'il te reste quand elle s'ouvre.";
  if (permission === 'denied') return "Les notifications ont été refusées. Ça se change dans Réglages › Istiqama › Notifications, sur le téléphone.";
  return "Les notifications ne sont pas encore autorisées.";
}

// ---------------------------------------------------------------------------
// Le rendu et les gestes
// ---------------------------------------------------------------------------

const ONGLETS = [
  { id: 'aujourdhui', libelle: "Aujourd'hui", pic: '◉' },
  { id: 'cumul', libelle: 'Le cumul', pic: '◫' },
  { id: 'argent', libelle: "L'argent", pic: '◈' },
  { id: 'reglages', libelle: 'Réglages', pic: '⚙' },
];

function rendre() {
  const vues = { aujourdhui: vueAujourdhui, cumul: vueCumul, argent: vueArgent, reglages: vueReglages };
  ecran.innerHTML = vues[onglet]();
  piedOnglets.innerHTML = ONGLETS.map((o) => `
    <button data-onglet="${o.id}" ${onglet === o.id ? 'aria-current="page"' : ''}>
      <span class="pic">${o.pic}</span>${txt(o.libelle)}
    </button>`).join('');
  brancherChamps();
}

function brancherChamps() {
  const surSaisie = (selecteur, action) => {
    for (const champ of ecran.querySelectorAll(selecteur)) {
      champ.addEventListener('input', () => { action(champ); enregistrer(true); });
    }
  };

  surSaisie('#chose', (c) => { jourCourant().chose = c.value; });
  surSaisie('#note', (c) => { jourCourant().note = c.value; });
  surSaisie('#identite', (c) => { classeur.reglages.identite = c.value; });
  surSaisie('#bascule', (c) => { classeur.reglages.heureBascule = Number(c.value); });
  surSaisie('#projets', (c) => {
    classeur.reglages.projets = c.value.split('\n').map((s) => s.trim()).filter(Boolean);
  });
  surSaisie('#mise-du-mois', (c) => {
    const m = L.cleDuMois(aujourdhui());
    if (c.value === '') delete classeur.argent.mois[m];
    else classeur.argent.mois[m] = Number(c.value);
  });
  surSaisie('#obj-libelle', (c) => { classeur.argent.objectif.libelle = c.value; });
  surSaisie('#obj-montant', (c) => { classeur.argent.objectif.montant = Number(c.value); });
  surSaisie('#obj-echeance', (c) => { classeur.argent.objectif.echeance = c.value.trim(); });

  surSaisie('[data-projet-ligne]', (c) => {
    const nom = c.dataset.projetLigne;
    const j = jourCourant();
    j.projets[nom] = { ...(j.projets[nom] || {}), ligne: c.value };
  });
  surSaisie('[data-projet-minutes]', (c) => {
    const nom = c.dataset.projetMinutes;
    const j = jourCourant();
    j.projets[nom] = { ...(j.projets[nom] || {}), minutes: c.value === '' ? 0 : Number(c.value) };
  });
  surSaisie('[data-placement]', (c) => {
    const pl = classeur.argent.placements[Number(c.dataset.placement)];
    if (!pl) return;
    pl[c.dataset.champ] = c.dataset.champ === 'nom' ? c.value : (c.value === '' ? '' : Number(c.value));
  });
  surSaisie('[data-habitude]', (c) => {
    const h = classeur.reglages.habitudes[Number(c.dataset.habitude)];
    if (!h) return;
    h[c.dataset.champ] = c.dataset.champ === 'objectif' ? Number(c.value) : c.value;
  });

  // Le type change la forme du formulaire, donc lui SEUL redessine.
  const type = document.getElementById('nh-type');
  if (type) type.addEventListener('change', () => { nouvelleHabitude.type = type.value; rendre(); });
  surSaisie('#nh-libelle', (c) => { nouvelleHabitude.libelle = c.value; });
  surSaisie('#nh-detail', (c) => { nouvelleHabitude.detail = c.value; });
  surSaisie('#nh-objectif', (c) => { nouvelleHabitude.objectif = c.value; });
  surSaisie('#nh-unite', (c) => { nouvelleHabitude.unite = c.value; });
  const domaine = document.getElementById('nh-domaine');
  if (domaine) domaine.addEventListener('change', () => { nouvelleHabitude.domaine = domaine.value; });

  const fichier = document.getElementById('fichier-restauration');
  if (fichier) fichier.addEventListener('change', lireFichierRestauration);
}

document.addEventListener('click', (e) => {
  const cible = e.target.closest('button, [data-action]');
  if (!cible) return;
  const jour = jourCourant();

  if (cible.dataset.onglet) { onglet = cible.dataset.onglet; toutVoir = false; bilanOuvert = false; rendre(); return; }
  if (cible.dataset.fenetre) { fenetre = Number(cible.dataset.fenetre); rendre(); return; }

  const avant = L.pointsDuJour(jour, classeur.reglages).gagnes;

  if (cible.dataset.bascule) {
    jour.tenu[cible.dataset.bascule] = !jour.tenu[cible.dataset.bascule];
  } else if (cible.dataset.priere) {
    const id = cible.dataset.priere;
    jour.tenu[id] = jour.tenu[id] === cible.dataset.valeur ? 'non' : cible.dataset.valeur;
  } else if (cible.dataset.compteur) {
    const id = cible.dataset.compteur;
    jour.tenu[id] = Math.max(0, (Number(jour.tenu[id]) || 0) + Number(cible.dataset.pas));
  } else if (cible.dataset.action) {
    if (!agir(cible.dataset.action, cible)) return;
  } else return;

  // Le retour au doigt ne se déclenche qu'en MONTANT : décocher une erreur ne
  // doit pas être récompensé, sinon le signal ne veut plus rien dire.
  const apres = L.pointsDuJour(jour, classeur.reglages).gagnes;
  if (apres > avant) {
    const possibles = L.pointsDuJour(jour, classeur.reglages).possibles;
    vibrer(apres >= possibles ? 3 : 1);
  }

  enregistrer();
  rendre();
});

function agir(action, bouton) {
  switch (action) {
    case 'chose-faite':
      jourCourant().choseFaite = !jourCourant().choseFaite;
      return true;
    case 'tout-voir':
      toutVoir = !toutVoir;
      return true;
    case 'fermer-journee':
      bilanOuvert = true;
      vibrer(2);
      return true;
    case 'fermer-bilan':
      bilanOuvert = false;
      return true;
    case 'depenser-gel': {
      const hier = L.cleDecalee(aujourdhui(), -1);
      if (!classeur.gels) classeur.gels = { utilises: [] };
      if (!classeur.gels.utilises.includes(hier)) classeur.gels.utilises.push(hier);
      vibrer(2);
      return true;
    }
    case 'refuser-gel':
      // On marque la journée comme vue, sinon l'offre reviendrait à chaque
      // ouverture — et une proposition qu'on ne peut pas écarter est un harcèlement.
      classeur.gelRefuse = L.cleDecalee(aujourdhui(), -1);
      return true;
    case 'voir-adhkar':
      voirAdhkar = !voirAdhkar;
      return true;
    case 'copier-adhkar':
      copierDansLePressePapier(texteACollerDansRaccourcis(), bouton, `${ADHKAR.length} adhkâr — colle pour vérifier`);
      return false;
    case 'autoriser-rappels':
      demanderRappels();
      return false;
    case 'ajouter-placement':
      classeur.argent.placements.push({ nom: '', investi: 0, valeur: '' });
      return true;
    case 'retirer-placement': {
      const i = Number(bouton.dataset.index);
      const nom = classeur.argent.placements[i]?.nom || 'ce placement';
      if (!confirm(`Retirer ${nom} ?`)) return false;
      classeur.argent.placements.splice(i, 1);
      return true;
    }
    case 'ouvrir-formulaire':
      nouvelleHabitude = { libelle: '', domaine: 'corps', type: 'oui-non', detail: '', objectif: 1, unite: '' };
      return true;
    case 'annuler-habitude':
      nouvelleHabitude = null;
      return true;
    case 'valider-habitude':
      try {
        classeur.reglages.habitudes = L.ajouterHabitude(classeur.reglages.habitudes, nouvelleHabitude);
        nouvelleHabitude = null;
        vibrer(2);
      } catch (err) {
        alert(err.message);
        return false;
      }
      return true;
    case 'supprimer-habitude': {
      const h = classeur.reglages.habitudes[Number(bouton.dataset.index)];
      if (!h) return false;
      if (!confirm(`Supprimer « ${h.libelle} » ?\n\nElle sort de la liste. Tes journées passées ne sont pas touchées — si tu la recrées du même nom, son historique revient.\n\nPour la mettre de côté sans la retirer, utilise « éteinte ».`)) return false;
      classeur.reglages.habitudes = L.supprimerHabitude(classeur.reglages.habitudes, h.id);
      return true;
    }
    case 'basculer-habitude': {
      const h = classeur.reglages.habitudes[Number(bouton.dataset.index)];
      h.actif = h.actif === false;
      return true;
    }
    case 'vider-le-cache':
      viderLeCache();
      return false;
    case 'sauvegarder':
      sauvegarder();
      return true;
    case 'restaurer':
      document.getElementById('fichier-restauration').click();
      return false;
    default:
      return false;
  }
}

// --- Les rappels -----------------------------------------------------------
//
// Ce que l'app peut honnêtement faire : afficher ce qu'il reste QUAND ELLE
// S'OUVRE. Ce qu'elle ne peut pas : se réveiller seule. Une app web sur iPhone
// n'a aucun moyen de programmer une notification locale ; il faudrait un
// serveur qui la pousse, donc des données qui quittent le téléphone.
//
// La chaîne qui marche, et qui ne coûte rien : une automatisation Raccourcis
// ouvre Istiqama à l'heure dite → Istiqama affiche ce qu'il reste. Le mode
// d'emploi est dans LISEZ-MOI-DABORD.md.
async function demanderRappels() {
  try {
    if (typeof Notification === 'undefined') return;
    await Notification.requestPermission();
    rendre();
  } catch { /* un refus n'est pas une panne */ }
}

// Le rappel : un dhikr, et il n'est JAMAIS le même deux fois de suite.
//
// Demandé par Samer le 19/09/2026 : « je veux que la notification affiche le
// dhikr au lieu de me mettre tout le temps la même chose ». Sa capture montrait
// trois notifications identiques en une heure — « Il te reste 11 choses » — une
// par ouverture de l'app.
//
// Deux corrections, et la seconde compte autant que la première : le contenu
// tourne (séquentiel, pas au hasard : le hasard répète), ET l'app se tait si
// elle vient de parler. Une notification qu'on voit trop devient un décor, puis
// on coupe les notifications de l'app — et on perd tout.
async function rappelDuMoment() {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    if (!peutNotifier(classeur.derniereNotification)) return;

    const tour = dhikrSuivant(classeur.dhikrIndex);
    if (!tour) return;

    const cle = aujourdhui();
    const { gagnes, possibles } = L.pointsDuJour(classeur.jours[cle], classeur.reglages);
    const reste = Math.max(0, possibles - Math.ceil(gagnes));

    // On avance le tour AVANT d'afficher : si l'affichage échoue, le dhikr
    // suivant sortira quand même la fois d'après. Un tour bloqué redonnerait
    // exactement le défaut qu'on corrige.
    classeur.dhikrIndex = tour.suivant;
    classeur.derniereNotification = new Date().toISOString();
    D.ecrire(classeur);

    const corps = corpsDuRappel(tour.dhikr, reste);

    // `navigator.serviceWorker.ready` ne se résout JAMAIS quand l'enregistrement
    // a échoué — il ne rejette pas, il attend. Sans cette course, la fonction
    // resterait suspendue pour toujours, sans une ligne d'erreur.
    const inscription = await Promise.race([
      navigator.serviceWorker?.ready,
      new Promise((r) => setTimeout(() => r(null), 1500)),
    ]);
    const options = { body: corps, tag: `istiqama-${cle}`, icon: 'icone-180.png' };
    if (inscription) await inscription.showNotification('Dhikr', options);
    else new Notification('Dhikr', options);   // sans service ouvrier, la voie directe
  } catch { /* jamais au prix d'un écran blanc */ }
}

// La porte de sortie d'un composant que personne n'a pu vérifier ici : le
// service ouvrier ne s'enregistre pas dans tous les navigateurs, et un service
// ouvrier coincé sert une vieille version POUR TOUJOURS, sans une erreur nulle
// part. C'est la panne silencieuse la plus chère de ce genre de fichier.
// ATTENTION — ce que ce bouton NE PEUT PAS garantir.
//
// `navigator.clipboard.writeText()` peut se résoudre SANS avoir rien écrit :
// vu le 18/09/2026 dans un navigateur où l'appel réussissait et où le
// collage ne rendait rien. Un « ✓ copié » serait donc un mensonge poli, et
// c'est exactement le genre d'affirmation qu'on refuse ici.
//
// D'où deux choses : le message dit « colle pour vérifier » au lieu d'affirmer,
// et la zone de texte au-dessus reste toujours là — appui long, Tout
// sélectionner, Copier. Ce chemin-là marche partout, et il ne ment pas.
async function copierDansLePressePapier(texte, bouton, message) {
  const dire = (m) => { if (bouton) { const avant = bouton.textContent; bouton.textContent = m; setTimeout(() => { bouton.textContent = avant; }, 1800); } };
  try {
    await navigator.clipboard.writeText(texte);
    dire(`✓ ${message}`);
  } catch {
    const zone = document.createElement('textarea');
    zone.value = texte;
    zone.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(zone);
    zone.select();
    const ok = document.execCommand?.('copy');
    zone.remove();
    dire(ok ? `✓ ${message}` : '✗ copie refusée');
  }
}

async function viderLeCache() {
  try {
    for (const r of await navigator.serviceWorker?.getRegistrations?.() || []) await r.unregister();
    for (const nom of await caches?.keys?.() || []) await caches.delete(nom);
  } catch { /* on recharge quand même : c'est l'essentiel */ }
  location.reload();
}

function sauvegarder() {
  classeur.derniereSauvegarde = new Date().toISOString();
  D.ecrire(classeur);
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(new Blob([D.versTexte(classeur)], { type: 'application/json' }));
  lien.download = D.nomDeSauvegarde(aujourdhui());
  lien.click();
  URL.revokeObjectURL(lien.href);
}

function lireFichierRestauration(e) {
  const fichier = e.target.files?.[0];
  if (!fichier) return;
  const lecteur = new FileReader();
  lecteur.onload = () => {
    try {
      const repris = D.depuisTexte(String(lecteur.result));
      const nb = Object.keys(repris.jours).length;
      if (!confirm(`Remplacer tout ce que contient l'app par cette sauvegarde (${nb} journée${nb > 1 ? 's' : ''}) ?`)) return;
      classeur = repris;
      D.ecrire(classeur);
      rendre();
    } catch (err) {
      alert(err.message || 'Fichier illisible.');
    }
  };
  lecteur.readAsText(fichier);
}

// Une app ouverte le soir et regardée le lendemain matin doit changer de jour
// toute seule, sans qu'on la ferme.
let jourAffiche = aujourdhui();
setInterval(() => {
  if (aujourdhui() !== jourAffiche) { jourAffiche = aujourdhui(); bilanOuvert = false; rendre(); }
}, 60000);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (aujourdhui() !== jourAffiche) { jourAffiche = aujourdhui(); bilanOuvert = false; rendre(); }
  rappelDuMoment();
});

// Le service ouvrier : il sert l'app hors connexion. Sans lui, un métro sans
// réseau = un écran blanc, et une app qu'on n'ouvre pas est une app morte.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-ouvrier.js').catch(() => { /* hors ligne n'est qu'un confort */ });
}

rendre();
rappelDuMoment();
