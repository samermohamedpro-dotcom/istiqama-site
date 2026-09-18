// Construit `docs/` à partir de `1-SOURCE/`.
//
// Volontairement bête : elle COPIE les modules, elle ne les transforme pas.
// Un assembleur écrit à coups d'expressions régulières est exactement le genre
// d'outil qui casse en silence — le fichier sort, il a l'air normal, et une
// fonction manque. Les navigateurs savent charger des modules ES depuis 2018 :
// il n'y a rien à assembler.
//
// Tout ce qui doit survivre à un dépôt est PRODUIT ICI, jamais posé à la main
// dans `docs/` : ce dossier est effacé à chaque construction.

import { mkdirSync, rmSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RACINE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(RACINE, '1-SOURCE');
const SORTIE = join(RACINE, 'docs');

// Le numéro de version sert à une seule chose, et elle est vitale : savoir si
// le téléphone affiche bien la dernière version. Sans lui, un cache Safari
// donne l'impression que rien n'a changé — et on cherche pendant une heure.
// L'heure est celle de la MACHINE, pas UTC : c'est elle que montre `ls`, c'est
// elle que git tamponne sur un commit, donc c'est la seule qui se vérifie après
// coup. Deux horloges dans un même dossier finissent toujours par se mélanger,
// et le tri est tout ce à quoi sert une heure.
const maintenant = new Date();
const VERSION = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}-${String(maintenant.getDate()).padStart(2, '0')} ${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`;

rmSync(SORTIE, { recursive: true, force: true });
mkdirSync(SORTIE, { recursive: true });

for (const f of ['logique.js', 'donnees.js', 'depart.js', 'adhkar.js', 'app.js', 'style.css']) {
  copyFileSync(join(SOURCE, f), join(SORTIE, f));
}

// --- l'icône -----------------------------------------------------------------
// Dessinée par le calcul plutôt que déposée en fichier : une icône déposée à la
// main dans un dossier effacé à chaque construction disparaîtrait un jour sans
// que personne ne comprenne pourquoi.
//
// Le dessin : fond encre, et la courbe du cumul qui monte. C'est le sujet de
// l'app en un trait.
function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xFFFFFFFF;
  for (const octet of buf) crc = table[(crc ^ octet) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function morceau(type, donnees) {
  const longueur = Buffer.alloc(4);
  longueur.writeUInt32BE(donnees.length);
  const corps = Buffer.concat([Buffer.from(type, 'ascii'), donnees]);
  const somme = Buffer.alloc(4);
  somme.writeUInt32BE(crc32(corps));
  return Buffer.concat([longueur, corps, somme]);
}

function png(taille, pixel) {
  const lignes = [];
  for (let y = 0; y < taille; y++) {
    const ligne = Buffer.alloc(1 + taille * 3);
    for (let x = 0; x < taille; x++) {
      const [r, v, b] = pixel(x, y, taille);
      ligne[1 + x * 3] = r; ligne[2 + x * 3] = v; ligne[3 + x * 3] = b;
    }
    lignes.push(ligne);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(taille, 0);
  ihdr.writeUInt32BE(taille, 4);
  ihdr[8] = 8;   // 8 bits par canal
  ihdr[9] = 2;   // couleur vraie, sans transparence
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    morceau('IHDR', ihdr),
    morceau('IDAT', deflateSync(Buffer.concat(lignes), { level: 9 })),
    morceau('IEND', Buffer.alloc(0)),
  ]);
}

const ENCRE = [16, 14, 11];
const OR = [216, 169, 74];

function pixelIcone(x, y, taille) {
  const u = x / taille;          // 0 → 1 de gauche à droite
  const v = 1 - y / taille;      // 0 → 1 de bas en haut
  // La courbe du cumul : lente, puis qui décolle. C'est la forme du livre.
  const courbe = 0.16 + 0.72 * (u ** 2.4);
  const epaisseur = 0.055;
  const marge = 0.14;
  if (u < marge || u > 1 - marge) return ENCRE;
  const ecart = Math.abs(v - courbe);
  if (ecart < epaisseur) return OR;
  // un halo doux sous la courbe, pour que l'icône ne soit pas qu'un trait
  if (v < courbe && ecart < 0.22) {
    const f = 1 - (ecart - epaisseur) / 0.22;
    return ENCRE.map((c, i) => Math.round(c + (OR[i] - c) * 0.16 * f));
  }
  return ENCRE;
}

writeFileSync(join(SORTIE, 'icone-180.png'), png(180, pixelIcone));
writeFileSync(join(SORTIE, 'icone-512.png'), png(512, pixelIcone));

// --- le manifeste ------------------------------------------------------------
writeFileSync(join(SORTIE, 'manifest.webmanifest'), JSON.stringify({
  name: 'Istiqama',
  short_name: 'Istiqama',
  start_url: './',
  display: 'standalone',
  background_color: '#100E0B',
  theme_color: '#100E0B',
  icons: [{ src: 'icone-512.png', sizes: '512x512', type: 'image/png' }],
}, null, 2));

// --- le service ouvrier ------------------------------------------------------
// Il sert l'app hors connexion. Sans lui, un métro sans réseau donne un écran
// blanc — et une app qu'on n'arrive pas à ouvrir est une app qu'on n'ouvre plus.
//
// LE DANGER de ce fichier, et il est réel : un service ouvrier mal écrit sert
// une vieille version pour toujours. On corrige un défaut, on dépose, et rien
// ne change sur le téléphone — sans une seule erreur nulle part. Trois parades,
// toutes indispensables ensemble :
//   1. le nom du cache contient la VERSION, donc chaque construction en crée un neuf ;
//   2. `skipWaiting` + `clients.claim` : la nouvelle version prend la main tout
//      de suite, sans attendre que tous les onglets soient fermés ;
//   3. la PAGE est cherchée sur le réseau D'ABORD, et ne retombe sur le cache
//      qu'en cas d'échec. Une page servie depuis le cache gèlerait tout le reste.
writeFileSync(join(SORTIE, 'service-ouvrier.js'), `// Produit par construire.mjs — ne pas modifier à la main, il est réécrit.
const CACHE = 'istiqama-${VERSION.replace(/[^0-9]/g, '')}';
const FICHIERS = ['./', 'index.html', 'app.js', 'logique.js', 'donnees.js', 'depart.js', 'adhkar.js',
  'style.css', 'icone-180.png', 'icone-512.png', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const nom of await caches.keys()) if (nom !== CACHE) await caches.delete(nom);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const estLaPage = e.request.mode === 'navigate';
  e.respondWith((async () => {
    if (estLaPage) {
      // Réseau d'abord : c'est ce qui garantit qu'une nouvelle version arrive.
      try {
        const reponse = await fetch(e.request);
        const cache = await caches.open(CACHE);
        cache.put(e.request, reponse.clone());
        return reponse;
      } catch {
        return (await caches.match('index.html')) || (await caches.match('./')) || Response.error();
      }
    }
    const enCache = await caches.match(e.request, { ignoreSearch: true });
    if (enCache) return enCache;
    try {
      const reponse = await fetch(e.request);
      if (reponse.ok) (await caches.open(CACHE)).put(e.request, reponse.clone());
      return reponse;
    } catch {
      return Response.error();
    }
  })());
});

// Une notification tapée ramène dans l'app plutôt que d'ouvrir un onglet de plus.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const ouverts = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of ouverts) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  })());
});
`);

// --- la page -----------------------------------------------------------------
const page = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Istiqama</title>
<meta name="description" content="Ce qui s'additionne, jour après jour.">
<meta name="theme-color" content="#100E0B">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Istiqama">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icone-180.png">
<link rel="icon" href="icone-180.png">
<link rel="stylesheet" href="style.css?v=${encodeURIComponent(VERSION)}">
</head>
<body>
<main id="ecran"></main>
<nav id="onglets" class="onglets" aria-label="Navigation"></nav>
<script type="module" src="app.js?v=${encodeURIComponent(VERSION)}"></script>
<!-- construit le ${VERSION} -->
</body>
</html>
`;
writeFileSync(join(SORTIE, 'index.html'), page);

// Le numéro de version est aussi écrit à part : c'est lui que lira un contrôle
// « est-ce bien la dernière version qui est en ligne ? ».
writeFileSync(join(SORTIE, 'version.txt'), `${VERSION}\n`);

const taille = ['index.html', 'app.js', 'logique.js', 'donnees.js', 'depart.js', 'style.css', 'service-ouvrier.js']
  .reduce((s, f) => s + readFileSync(join(SORTIE, f)).length, 0);
console.log(`Construit — version ${VERSION}, ${(taille / 1024).toFixed(1)} ko de code, icônes 180 et 512, service ouvrier.`);
