// Produit par construire.mjs — ne pas modifier à la main, il est réécrit.
const CACHE = 'istiqama-202609182326';
const FICHIERS = ['./', 'index.html', 'app.js', 'logique.js', 'donnees.js', 'depart.js',
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
