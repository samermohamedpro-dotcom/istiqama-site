// L'écran. Tout le calcul est dans logique.js — ici on ne fait qu'afficher et
// enregistrer. Si une règle de calcul apparaît dans ce fichier, elle est au
// mauvais endroit : elle deviendra impossible à tester.

import * as L from './logique.js';
import * as D from './donnees.js';
import { DOMAINES } from './depart.js';

let classeur = D.lire();
let onglet = 'aujourdhui';
let fenetre = 30;
let toutVoir = false;

const ecran = document.getElementById('ecran');
const piedOnglets = document.getElementById('onglets');

// ---------------------------------------------------------------------------
// Outils d'affichage
// ---------------------------------------------------------------------------

// Tout texte venu de Samer passe par ici avant d'entrer dans une page. Il est
// seul à écrire dans son app, mais une apostrophe ou un chevron dans le nom
// d'un projet casserait l'écran — et ça ressemblerait à un bug incompréhensible.
function txt(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const pourcent = (x) => `${Math.round(x * 100)} %`;

function dateEnClair(cle) {
  return L.dateDepuisCle(cle).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function dureeEnClair(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// L'état
// ---------------------------------------------------------------------------

function aujourdhui() { return L.cleDuJour(); }

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

  const danger = L.habitudesActives(classeur.reglages)
    .filter((h) => L.enDanger(classeur.jours, h, cle));

  let html = `
    <div class="entete">
      <div class="date">${txt(dateEnClair(cle))}</div>
      <div class="moment">${matin ? 'Ce matin' : 'Ce soir'}</div>
      <div class="identite">${txt(classeur.reglages.identite)}</div>
    </div>`;

  // L'alerte ne s'affiche QUE le jour où elle a un sens. Une alerte permanente
  // devient un décor, et on ne la lit plus.
  if (danger.length > 0) {
    html += `
      <div class="alerte">
        <div class="titre">Jamais deux fois de suite</div>
        <div class="quoi">Hier, tu as manqué : ${txt(danger.map((h) => h.libelle).join(', '))}.</div>
        <div class="regle">Manquer une fois est un accident. Manquer deux fois, c'est la nouvelle habitude qui commence.</div>
      </div>`;
  }

  // La chose du jour — une seule. Le principe de « The One Thing » : si tout
  // le reste tombait à l'eau, laquelle rendrait quand même la journée utile ?
  html += `
    <div class="carte chose ${jour.choseFaite ? 'faite' : ''}">
      <h2>La chose du jour</h2>
      <div class="sous">Celle qui, faite seule, rendrait la journée utile.</div>
      <div class="chose-ligne">
        <input type="text" id="chose" placeholder="Une seule." value="${txt(jour.chose)}" />
        <button class="case" data-action="chose-faite" aria-pressed="${jour.choseFaite}" aria-label="C'est fait">✓</button>
      </div>
    </div>`;

  // Les habitudes, groupées par domaine et dans l'ordre des réglages.
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

  // Le soir : les projets et la note. Le matin, ils sont là aussi mais après —
  // on peut très bien avoir avancé avant midi.
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
      <div class="note-bas">${txt(phraseDuJour(cle))}</div>
    </div>`;

  return html;
}

function ligneHabitude(h, jour, cle) {
  const valeur = jour.tenu[h.id];
  const chaine = L.chaineEnCours(classeur.jours, h, cle);
  const marque = chaine > 0 ? `<div class="chaine">${chaine} j</div>` : '';
  const nom = `
    <div class="nom">
      <div class="libelle">${txt(h.libelle)}</div>
      ${h.detail ? `<div class="detail">${txt(h.detail)}</div>` : ''}
    </div>`;

  if (h.type === 'priere') {
    return `
      <div class="ligne ${L.tenue(h, valeur) ? '' : 'rate'}">
        ${nom}${marque}
        <div class="priere-choix">
          <button data-priere="${txt(h.id)}" data-valeur="heure" aria-pressed="${valeur === 'heure'}">à l'heure</button>
          <button class="rattrape" data-priere="${txt(h.id)}" data-valeur="rattrapee" aria-pressed="${valeur === 'rattrapee'}">rattrapée</button>
        </div>
      </div>`;
  }

  if (h.type === 'compteur') {
    const n = Number(valeur) || 0;
    const plein = n >= (h.objectif || 1);
    return `
      <div class="ligne">
        ${nom}${marque}
        <div class="compteur">
          <button data-compteur="${txt(h.id)}" data-pas="-1" aria-label="Moins">−</button>
          <div class="valeur ${plein ? 'plein' : ''}">${n} / ${h.objectif || 1}</div>
          <button data-compteur="${txt(h.id)}" data-pas="1" aria-label="Plus">+</button>
        </div>
      </div>`;
  }

  return `
    <div class="ligne ${valeur ? '' : 'rate'}">
      ${nom}${marque}
      <button class="case" data-bascule="${txt(h.id)}" aria-pressed="${!!valeur}" aria-label="${txt(h.libelle)}">✓</button>
    </div>`;
}

// Une phrase factuelle en bas de l'écran du jour : ce qui a été tenu, sans
// commentaire. Pas d'encouragement — il a demandé un outil, pas un coach.
function phraseDuJour(cle) {
  const { gagnes, possibles } = L.pointsDuJour(classeur.jours[cle], classeur.reglages);
  return `${gagnes % 1 === 0 ? gagnes : gagnes.toFixed(1)} sur ${possibles} aujourd'hui.`;
}

// ---------------------------------------------------------------------------
// Le cumul
// ---------------------------------------------------------------------------

function vueCumul() {
  const cle = aujourdhui();
  const points = L.courbeCumul(classeur.jours, classeur.reglages, cle, fenetre);
  const actives = L.habitudesActives(classeur.reglages);

  let html = `
    <div class="entete">
      <div class="date">Le cumul</div>
      <div class="moment">Ce qui s'additionne</div>
      <div class="identite">Une journée ne se voit pas. Trente, si.</div>
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
    .map((h) => ({ h, en: L.chaineEnCours(classeur.jours, h, cle), record: L.meilleureChaine(classeur.jours, h) }))
    .sort((a, b) => b.en - a.en);
  for (const c of chaines) {
    html += `
      <div class="ligne">
        <div class="nom"><div class="libelle">${txt(c.h.libelle)}</div>
        <div class="detail">record : ${c.record} j</div></div>
        <div class="chaine" style="font-size:17px">${c.en} j</div>
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

// La courbe est dessinée à la main en SVG : aucune bibliothèque à charger, et
// elle reste nette à toutes les largeurs.
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
  let html = `
    <div class="entete">
      <div class="date">Réglages</div>
      <div class="moment">Ce que tu suis</div>
      <div class="identite">Peu d'habitudes tenues valent mieux que beaucoup abandonnées.</div>
    </div>

    <div class="carte">
      <h2>Qui tu es</h2>
      <label class="champ"><span>La phrase du haut de l'écran</span>
        <input type="text" id="identite" value="${txt(r.identite)}" /></label>
      <div class="note-bas">Une habitude tient quand elle prouve une identité, pas quand elle vise un résultat.</div>
    </div>

    <div class="carte">
      <h2>Tes habitudes</h2>`;
  r.habitudes.forEach((h, i) => {
    html += `
      <div class="placement">
        <div class="titre">
          <span class="nom">${txt(h.libelle)} <span class="detail" style="color:var(--texte-faible)">· ${txt(DOMAINES[h.domaine]?.libelle || h.domaine)}</span></span>
          <button class="bouton ${h.actif === false ? '' : 'or'}" data-action="basculer-habitude" data-index="${i}">${h.actif === false ? 'éteinte' : 'active'}</button>
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
  html += `<div class="note-bas">Une habitude éteinte garde son histoire : elle sort des comptes, elle ne s'efface pas.</div></div>`;

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
    </div>`;
  return html;
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

// Les champs de texte NE déclenchent PAS de nouveau rendu : reconstruire
// l'écran à chaque frappe ferait perdre le curseur au bout d'une lettre.
// Ils écrivent dans l'état, et l'enregistrement est différé.
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

  const fichier = document.getElementById('fichier-restauration');
  if (fichier) fichier.addEventListener('change', lireFichierRestauration);
}

document.addEventListener('click', (e) => {
  const cible = e.target.closest('button');
  if (!cible) return;
  const jour = jourCourant();

  if (cible.dataset.onglet) { onglet = cible.dataset.onglet; toutVoir = false; rendre(); return; }
  if (cible.dataset.fenetre) { fenetre = Number(cible.dataset.fenetre); rendre(); return; }

  if (cible.dataset.bascule) {
    jour.tenu[cible.dataset.bascule] = !jour.tenu[cible.dataset.bascule];
  } else if (cible.dataset.priere) {
    const id = cible.dataset.priere;
    // Ré-appuyer sur le choix déjà fait l'annule : c'est ainsi qu'on corrige
    // une erreur sans avoir à chercher un troisième bouton.
    jour.tenu[id] = jour.tenu[id] === cible.dataset.valeur ? 'non' : cible.dataset.valeur;
  } else if (cible.dataset.compteur) {
    const id = cible.dataset.compteur;
    jour.tenu[id] = Math.max(0, (Number(jour.tenu[id]) || 0) + Number(cible.dataset.pas));
  } else if (cible.dataset.action) {
    if (!agir(cible.dataset.action, cible)) return;
  } else return;

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
    case 'basculer-habitude': {
      const h = classeur.reglages.habitudes[Number(bouton.dataset.index)];
      h.actif = h.actif === false;
      return true;
    }
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
      // On demande AVANT d'écraser : une restauration par erreur effacerait des
      // mois de suivi, et rien ne permettrait de revenir en arrière.
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
  if (aujourdhui() !== jourAffiche) { jourAffiche = aujourdhui(); rendre(); }
}, 60000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && aujourdhui() !== jourAffiche) { jourAffiche = aujourdhui(); rendre(); }
});

rendre();
