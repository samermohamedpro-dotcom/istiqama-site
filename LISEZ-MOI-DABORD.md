# Où est chaque chose, et dans quel état

Écrit le 18/09/2026, jour où l'app est née.

## Les fichiers

| Fichier | Ce qu'il porte | État |
|---|---|---|
| `1-SOURCE/logique.js` | **tout le calcul** : chaînes, cumul, part tenue, projection d'argent. Aucun accès à l'écran ni au stockage — c'est ce qui le rend testable en entier | fait, 28 tests |
| `1-SOURCE/donnees.js` | lire, écrire, sauvegarder, restaurer. Rien d'autre ne touche au stockage | fait |
| `1-SOURCE/depart.js` | ce que contient l'app le premier jour : les habitudes, les domaines, l'objectif vide | fait |
| `1-SOURCE/app.js` | l'écran, et rien que l'écran. **Aucune règle de calcul ne doit apparaître ici** | fait |
| `1-SOURCE/style.css` | l'apparence. Aucune police chargée | fait |
| `construire.mjs` | fabrique `docs/` : copie les modules, dessine les icônes, écrit la page et le manifeste | fait |
| `servir.mjs` | le serveur local, pour regarder l'app comme le téléphone la verra | fait |
| `tests.mjs` | les tests du calcul | 28, tous vus rouges avant d'être verts |
| `verifier.sh` | tests + construction + contrôle que le construit n'est pas en retard | fait |
| `docs/` | **effacé et refait à chaque construction.** Rien ne s'y dépose à la main | produit |

## Les écrans

| Onglet | Ce qu'on y fait | Le mécanisme |
|---|---|---|
| **Aujourd'hui** | cocher la journée ; il change de visage matin / soir | la chose du jour, l'alerte « jamais deux fois » |
| **Le cumul** | regarder, ne rien saisir | la courbe, la part tenue, les chaînes, le temps par projet |
| **L'argent** | mettre à jour une fois par mois | l'objectif, le verdict, les placements |
| **Réglages** | changer ce qu'on suit, sauvegarder | — |

## Ce qui n'existe pas encore

Tout est dans `A-FAIRE.md`, en ordre. Les trois premiers : finir la mise sur le
téléphone (activer Pages, ajouter l'icône), mesurer les écrans dans **Safari**
et pas seulement dans Chromium, et lui donner ses vraies valeurs.

Les points déjà réglés, en entier : `archives/A-FAIRE-ISTIQAMA-fait-2026-09.md`.
