// Un serveur de vingt lignes pour regarder l'app comme le téléphone la verra.
//
// Pourquoi pas simplement ouvrir le fichier : en `file://`, le navigateur
// refuse les modules ES (règle d'origine), et `localStorage` n'a pas d'origine
// fiable — l'app s'afficherait sans rien retenir, et on chercherait le défaut
// dans le code. C'est la panne silencieuse la plus chère du dossier `~/Projets`
// (leçon du 11/09/2026, un autre projet du même auteur).
//
// `node servir.mjs` puis http://localhost:8123

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const DOSSIER = join(dirname(fileURLToPath(import.meta.url)), 'docs');
const PORT = Number(process.argv[2]) || 8123;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (requete, reponse) => {
  const chemin = decodeURIComponent(new URL(requete.url, 'http://x').pathname);
  // `normalize` puis vérification du préfixe : sans ça, `../../` sortirait du
  // dossier et servirait n'importe quel fichier du Mac.
  const fichier = normalize(join(DOSSIER, chemin === '/' ? 'index.html' : chemin));
  if (!fichier.startsWith(DOSSIER)) { reponse.writeHead(403).end(); return; }
  try {
    const contenu = await readFile(fichier);
    reponse.writeHead(200, {
      'Content-Type': TYPES[extname(fichier)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    }).end(contenu);
  } catch {
    reponse.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Pas ici.');
  }
}).listen(PORT, () => console.log(`Istiqama : http://localhost:${PORT}`));
