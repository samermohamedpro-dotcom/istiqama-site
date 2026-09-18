# Istiqama — les points réglés, en entier

Un point clos s'ARCHIVE avec son titre, il ne se supprime pas : un ancien renvoi
doit encore mener quelque part. (Règle du groupe « rien de difficile à changer
ne doit devenir porteur ».)

---

## Un dépôt git, ou pas

Le projet n'en a pas encore, et c'est volontaire : **jamais de dépôt sans le
demander**. Ce qu'il apporterait : l'historique du code, et une copie ailleurs
que sur ce Mac. Ce qu'il ne doit jamais contenir : une seule donnée réelle — le
`.gitignore` est déjà écrit pour ça, avant le premier commit.

**Réglé le 18/09/2026, 22 h 23** — tranché par Samer : **un seul dépôt,
public, `istiqama-site`**, qui porte la source, les documents et ce que sert
GitHub Pages. Le `.gitignore` refuse tout fichier `istiqama-*.json`. Détail et
raisons : `JOURNAL.md`, entrée du 18/09/2026 à 22 h 23.

---

## Le hors-connexion n'a jamais été vu marcher

Le service ouvrier (`docs/service-ouvrier.js`, produit par `construire.mjs`)
sert l'app sans réseau. **Il n'a été vérifié nulle part**, et pas par
négligence : le 18/09/2026, le navigateur d'aperçu a refusé de l'enregistrer —
**même un service ouvrier vide** —, donc aucun essai n'était possible depuis le
Mac.

**Ce qui a été vérifié à la place** : trois tests lisent le fichier produit et
vérifient que ses parades sont déclarées — un cache dont le nom porte la
version, `skipWaiting` + `clients.claim`, la suppression des vieux caches, et la
page cherchée sur le **réseau d'abord**. Ensemble, elles empêchent la panne la
plus chère de ce genre de fichier : **servir une vieille version pour toujours,
sans une seule erreur nulle part.**

**Le test réel, à faire sur l'iPhone** : ouvrir l'app, puis passer en mode
avion, puis la rouvrir. Elle doit s'afficher.

**Et si un jour elle refuse de se mettre à jour** : *Réglages* → dernière carte
→ *Vider le cache et recharger*. Cette porte de sortie existe **parce que** ce
composant n'a pas pu être vérifié.

**Réglé le 18/09/2026, 23 h 26** — **constaté par Samer sur son iPhone** : app
rechargée, mode avion activé, app rouverte, **elle s'affiche**. Le service
ouvrier fonctionne. C'est le seul essai qui pouvait trancher : le navigateur
d'aperçu refusait d'enregistrer un service ouvrier, même vide.

La porte de sortie (*Réglages* → *Vider le cache et recharger*) **reste** : elle
ne protégeait pas seulement contre un service ouvrier qui ne marche pas, mais
contre un service ouvrier qui se coince sur une vieille version — ce qui reste
possible, et reste silencieux.
