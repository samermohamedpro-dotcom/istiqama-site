# À faire — Istiqama

Par ordre de dépendance : ce qui est en haut débloque ce qui est en dessous.
Les points portent un nom, jamais un numéro — un rang change quand on clôt un
point, et le renvoi devient faux en silence.

| Le point | Ce qui l'attend |
|---|---|
| finir la mise sur le téléphone | **deux gestes de Samer** : activer Pages, ajouter l'icône |
| Safari n'est testé nulle part | le même trou que chez Petit Gâteau |
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

## Safari n'est testé nulle part

Les écrans n'ont été regardés que dans le navigateur de Claude (Chromium). Or
les deux pires défauts visuels de l'autre projet du même auteur **ne se
reproduisaient pas dans Chromium** : l'en-tête invisible quand la barre
d'adresse de Safari est en haut, et une hauteur qui se résout autrement.

Deux parades sont déjà posées à l'aveugle dans `style.css` (`dvh` au lieu de
`vh`, et `env(safe-area-inset-bottom)` sous la barre d'onglets) — **mais
personne ne les a vues marcher.** À vérifier sur le vrai téléphone, le jour du
point ci-dessus.

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
