# À faire — Istiqama

Par ordre de dépendance : ce qui est en haut débloque ce qui est en dessous.
Les points portent un nom, jamais un numéro — un rang change quand on clôt un
point, et le renvoi devient faux en silence.

| Le point | Ce qui l'attend |
|---|---|
| finir la mise sur le téléphone | **deux gestes de Samer** : activer Pages, ajouter l'icône |
| Safari : un défaut trouvé, deux angles morts | le paysage, et trois écrans jamais vus |
| lui donner ses vraies valeurs | dix minutes, un soir |
| connecter les dépenses à la banque | un vrai chantier, à trancher |
| la sauvegarde qui ne demande rien | après le téléphone |

---

## Finir la mise sur le téléphone

**L'hébergement est fait** (18/09/2026) : dépôt public `istiqama-site`, servi
par GitHub Pages depuis `/docs`. Restent deux gestes que Claude ne peut pas
faire :

1. **Activer Pages** — dépôt `istiqama-site` → *Settings* → *Pages* → source
   *Deploy from a branch*, branche `main`, dossier `/docs`.
2. **Ajouter l'icône** — ouvrir
   `https://samermohamedpro-dotcom.github.io/istiqama-site/` sur l'iPhone,
   *Partager* → *Sur l'écran d'accueil*.

**Et à partir de ce moment-là, le nom du dépôt ne peut plus changer** : aucun
domaine ne couvre cette adresse, donc le nom EST l'adresse, et GitHub ne
redirige pas les anciennes adresses de Pages. C'est ce qui est arrivé au dépôt
`APP` de Petit Gâteau.

**Pour mettre à jour l'app ensuite** : `bash verifier.sh`, puis commit et push.
Pages resert `docs/` tout seul.

## Safari : un défaut trouvé, deux angles morts qui restent

**Le premier test a eu lieu le 18/09/2026**, par Samer sur son iPhone, et il a
rapporté tout de suite : la ligne de date passait sous la barre d'état.
Corrigé le soir même (`JOURNAL.md`, entrée de 22 h 54), et protégé par trois
tests.

**Ce qui est maintenant VU marcher** : la marge du bas — la barre d'onglets se
tient au-dessus de la barre de gestes, sur sa capture. Et la marge du haut,
après correction.

**Ce qui reste à l'aveugle :**

- **le mode paysage** — les marges gauche et droite ont été posées dans le même
  mouvement, sans que personne ne les voie servir ;
- **les trois autres écrans** (Le cumul, L'argent, Réglages) n'ont jamais été
  regardés sur l'iPhone. Ils partagent le même `#ecran`, donc la correction les
  couvre — mais « donc » n'est pas « vu ».

**Et la leçon de fond reste entière** : `env(safe-area-inset-top)` vaut zéro sur
un navigateur de bureau. Aucun contrôle lancé depuis le Mac ne peut voir ce
défaut-là. C'est le même trou que chez Petit Gâteau, où les deux pires défauts
visuels ne se reproduisaient pas dans Chromium.

## Lui donner ses vraies valeurs

L'app démarre avec des valeurs de départ, pas avec les siennes :

- **la règle « manger propre »** : « pas de sucre ajouté » est une proposition,
  pas sa règle ;
- **l'objectif d'eau** : 8 verres, à ajuster ;
- **le montant visé** et l'échéance, dans l'onglet L'argent — aujourd'hui à 0 et
  au 31/12/2027 ;
- **ses placements** — rien n'est saisi ;
- **la phrase d'identité**, en haut de l'écran.

Tout se change dans Réglages, sans toucher au code.

## Le rappel ne se déclenche pas tout seul — et il y a une décision à prendre

Aujourd'hui, la chaîne qui marche est : une automatisation *Raccourcis* ouvre
l'app à l'heure dite, l'app affiche ce qu'il reste (recette exacte dans
`LISEZ-MOI-DABORD.md`). Ça ne coûte rien et rien ne sort du téléphone.

**Sa limite** : une automatisation « Heure de la journée » peut ne pas se
déclencher si le téléphone n'a pas été touché depuis des heures.

**La vraie notification — ce qu'elle coûterait, pour que la décision soit prise
en connaissance de cause.** Depuis iOS 16.4, une app ajoutée à l'écran d'accueil
peut recevoir des notifications poussées. Mais il faut **quelqu'un qui les
envoie** : un serveur avec des clés VAPID. Options réelles :

- **une GitHub Action programmée** — gratuite, tu as déjà le dépôt. Elle
  enverrait la notification à 7 h et 21 h ;
- **un service de push tiers** — payant au-delà d'un seuil.

**Dans les deux cas, l'abonnement du téléphone quitte le téléphone**, et la
première règle du projet (« rien ne sort du téléphone ») tombe. Elle ne doit pas
tomber par accident au détour d'une fonctionnalité pratique : **c'est à
trancher, pas à glisser.**

## Connecter les dépenses à la banque

Demandé par Samer le 18/09/2026 (« on peut pas connecter une dépense une
ligne ? »), **volontairement non construit ce jour-là**.

C'est possible en France par un agrégateur PSD2 — GoCardless Bank Account Data
(ex-Nordigen) a une offre gratuite, Powens est l'autre voie. Ce que ça coûte
vraiment, et ce sur quoi il faut trancher :

- une inscription en tant que développeur, et des clés à garder ;
- **un accès permanent à ses comptes donné à un tiers**, à ré-autoriser tous les
  90 jours ;
- et surtout : l'app cesse d'être « rien ne sort du téléphone ». C'est la
  première règle du projet. Elle ne tombe pas par accident, elle se retire
  sciemment ou elle reste.

**En attendant, l'argent est tourné vers l'objectif, pas vers la dépense** —
c'est ce que Samer a demandé dans la même phrase : combien de côté, combien
placé, sur quoi, et où il en est.

## La sauvegarde qui ne demande rien

Aujourd'hui la sauvegarde est un bouton : elle produit un fichier JSON qu'il
faut ranger. Une sauvegarde qu'on doit penser à faire ne se fait pas. La suite
naturelle, une fois l'app sur le téléphone : qu'elle propose d'elle-même
d'enregistrer dans iCloud Drive quand la dernière date de plus de deux
semaines. L'écran le signale déjà en rouge tant que rien n'a jamais été
sauvegardé.
