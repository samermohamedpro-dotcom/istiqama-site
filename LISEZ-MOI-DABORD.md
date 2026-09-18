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
| `docs/` | **effacé et refait à chaque construction.** C'est lui que sert GitHub Pages. Rien ne s'y dépose à la main | produit |
| `docs/service-ouvrier.js` | produit par `construire.mjs` : l'app hors connexion | **jamais vu marcher** — voir `A-FAIRE.md` |

## Les écrans

| Onglet | Ce qu'on y fait | Le mécanisme |
|---|---|---|
| **Aujourd'hui** | cocher la journée ; il change de visage matin / soir | l'anneau du jour, le gel de chaîne, les paliers, la chose du jour, le bilan du soir |
| **Le cumul** | regarder, ne rien saisir | le niveau et le rang, les gels en stock, la courbe, les votes, les chaînes, le temps par projet |
| **L'argent** | mettre à jour une fois par mois | l'objectif, le verdict, les placements |
| **Réglages** | changer ce qu'on suit, sauvegarder | — |

## Ce qui n'existe pas encore

Tout est dans `A-FAIRE.md`, en ordre. Les trois premiers : finir la mise sur le
téléphone (activer Pages, ajouter l'icône), mesurer les écrans dans **Safari**
et pas seulement dans Chromium, et lui donner ses vraies valeurs.

Les points déjà réglés, en entier : `archives/A-FAIRE-ISTIQAMA-fait-2026-09.md`.


---

## Le rappel du jour — ce qui marche, et pourquoi ce n'est pas ce qu'on croit

**Ce qu'une app web NE PEUT PAS faire sur iPhone : se réveiller toute seule.**
Il n'existe aucun moyen de programmer une notification locale depuis une page
web. Le seul chemin serait un **serveur** qui pousse la notification — ce qui
casserait la première règle du projet (« rien ne sort du téléphone ») et
coûterait de l'infrastructure. Vérifié le 18/09/2026.

**Ce qui marche, coûte zéro, et prend deux minutes** : l'app *Raccourcis*
d'Apple ouvre Istiqama à l'heure dite, et Istiqama affiche alors ce qu'il reste.
C'est le réveil qui est dans Raccourcis ; le message est dans l'app.

### La recette, à faire une fois

1. **Autorise les notifications** dans Istiqama : onglet *Réglages* →
   *Le rappel du jour* → « Autoriser les notifications ».
2. Ouvre l'app **Raccourcis** → onglet **Automatisation** → **+**
3. **Créer une automatisation personnelle** → **Heure de la journée**
4. Choisis **07:00**, répétition **Quotidienne** → *Suivant*
5. **Ajouter une action** → cherche **Ouvrir une URL** → colle :
   `https://samermohamedpro-dotcom.github.io/istiqama-site/`
6. **Important** : mets *Exécuter immédiatement* et coupe *Demander avant
   d'exécuter*. Sinon il faut confirmer chaque matin, et on arrête au bout
   de trois jours.
7. Refais la même chose pour **21:00** — le passage du soir.

**Sa limite, et elle est réelle** : une automatisation « Heure de la journée »
peut ne pas se déclencher si le téléphone n'a pas été touché depuis plusieurs
heures. Ce n'est donc pas un réveil de précision. Pour quelque chose
d'absolument fiable, un **rappel répétitif** dans l'app Rappels ou une
**alarme** font le travail, et il suffit d'ouvrir Istiqama derrière.

Source : [Apple — créer une automatisation personnelle](https://support.apple.com/guide/shortcuts/create-a-new-personal-automation-apdfbdbd7123/ios)

---

## Si l'app se coince sur une vieille version

*Réglages* → dernière carte → **Vider le cache et recharger**. Ça efface la
copie hors connexion et recharge l'app depuis GitHub. **Tes données ne sont pas
touchées** : elles vivent ailleurs dans le téléphone.
