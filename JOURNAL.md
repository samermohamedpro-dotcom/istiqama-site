# Journal — Istiqama

Le plus récent en haut. La forme d'une entrée (en-tête, statut, les quatre
rubriques, « vu passer ») est celle de la compétence `facon-de-travailler` :
elle n'est pas redite ici.

**Index des corrections** — aucune à ce jour. Une entrée devenue fausse se
corrige par une **nouvelle** entrée, jamais en modifiant l'ancienne, et se
signale ici.

---

# 18/09/2026, 20 h 33 — Istiqama existe : une app personnelle, hors de 89G, qui ne parle à personne

Touche : Istiqama (nouveau projet) · le dossier `~/Projets/`

Statut : **tranché par Samer** pour l'emplacement, le nom, les domaines et le
rythme · **décidé en session** pour les choix techniques, à contredire s'il veut

## Ce qui a été décidé

- **Une application personnelle quotidienne est créée**, à partir de *L'Effet
  cumulé* (Hardy), *Atomic Habits* (Clear) et *The One Thing* (Keller).
- **Elle s'appelle Istiqama** (الاستقامة, la constance) — choisi par Samer
  entre quatre propositions.
- **Elle vit hors de `89G/`**, dans `~/Projets/ISTIQAMA/` — choisi par Samer.
- **Quatre domaines** : le corps (manger propre, bouger, l'eau), la religion
  (les cinq prières une par une, adhkâr matin et soir), la tête (lire), et
  l'argent dans un écran à part.
- **Elle s'ouvre matin et soir**, et l'écran *Aujourd'hui* change de visage
  selon l'heure.
- **Elle ne lit aucun fichier de 89G** : la ligne du soir par projet s'écrit à
  la main.
- **Le suivi de dépenses par connexion bancaire n'est pas construit**, et la
  raison est écrite dans `A-FAIRE.md`.
- **Techniquement** : aucune dépendance, aucun réseau, tout dans le stockage
  local du téléphone. Le code de l'app de Petit Gâteau n'est **pas** copié.

## Pourquoi

- **Hors de 89G, parce que les données sont personnelles.** 89G est le nom
  d'une future holding : ses dépôts seront un jour regardés par un comptable,
  une banque, peut-être un associé. Une pratique religieuse et des montants
  d'épargne n'y ont pas leur place, et **une fois dans l'historique d'un dépôt
  ils n'en ressortent plus**.
- **Le corps d'abord.** Samer : « j'aimerai bien un peu de tout mais si je dois
  que choisir une seul je dirais le corps ». Les quatre domaines sont donc là,
  mais le corps ouvre l'écran.
- **Pas de code copié de Petit Gâteau.** La règle du groupe dit que son app est
  la base de toutes les autres — mais elle vise les apps de commerce (commandes,
  stock, clients). Ici il n'y en a aucun. Reprendre React, Tailwind et Firebase
  pour quatre écrans de cases à cocher aurait apporté trois cents mégaoctets de
  dépendances, un compte et une base de données distante, pour une app dont la
  première règle est que rien ne sort du téléphone. **C'est la méthode qui a
  été reprise, pas le code** : un fichier construit, des tests, une sauvegarde,
  une icône sur le téléphone.
- **Pas de connexion bancaire aujourd'hui.** Elle est possible (PSD2,
  GoCardless ou Powens) et elle casserait la première règle du projet. Une règle
  pareille se retire sciemment, pas au détour d'une fonctionnalité pratique.
- **L'app ne lit pas les `A-FAIRE.md` de 89G.** Un chemin vers l'intérieur d'un
  autre projet tient tant que rien ne bouge, et casse au premier dossier
  renommé — c'est exactement l'incident Playwright du 10/09/2026 entre Advisory
  et Petit Gâteau. Une ligne écrite à la main ne casse jamais.

## Ce que ça change

- **`~/Projets/`** contient désormais deux projets et non plus un. **Son
  `CLAUDE.md` dit « Tout est sous `89G/` » : cette phrase est devenue fausse
  ce soir.** Elle n'a pas été modifiée — ce fichier appartient à l'étage
  au-dessus, et c'est à Samer de trancher. Point ouvert, ci-dessous.
- **89G n'est touché en rien.** Aucun fichier des deux sociétés n'a été lu pour
  construire l'app, aucun n'a été modifié, et Istiqama ne pointe vers aucun.
- **Aucun dépôt git n'a été créé**, et aucun commit n'a été fait : ni l'un ni
  l'autre n'a été demandé. Le `.gitignore` est écrit **avant**, prêt, et il
  refuse déjà tout fichier de sauvegarde.

## Ce qui reste ouvert

- **Comment mettre l'app sur le téléphone** — trois voies, exposées dans
  `A-FAIRE.md`. C'est le seul point qui bloque l'usage quotidien.
- **La phrase « Tout est sous 89G/ » de `~/Projets/CLAUDE.md`.** Correction
  proposée, non appliquée.
- **Un dépôt git pour Istiqama**, ou pas.
- **Ses vraies valeurs** : la règle « manger propre », le montant visé, ses
  placements, sa phrase d'identité. Tout se saisit dans l'app.
- **Non tranché exprès** : les horaires de prière calculés. Ils exigeraient la
  position et le réseau, pour remplacer ce qu'il sait déjà.

## Vu passer

- `node --test tests.mjs` → **28 tests, 28 verts, 0 rouge.**
- **Trois protections cassées volontairement, et vues rouges** avant d'être
  remises : la chaîne qui ne repart plus d'hier (2 tests rouges), la part tenue
  qui ignore les jours non renseignés (1 rouge), la projection qui ne peut plus
  répondre « jamais » (1 rouge). Retour à 28 verts après remise en état.
- `node construire.mjs` → 56,6 ko de code, icônes 180 et 512 produites.
- **Les quatre écrans regardés dans un vrai navigateur**, servis en HTTP (jamais
  en `file://`), à 375 × 812 — la largeur d'un iPhone. Aucune erreur en console.
  Les écrans qui n'ont de sens qu'avec de l'historique ont été regardés sur
  **40 journées fabriquées**, effacées juste après : aucune donnée réelle n'a
  été inventée ni conservée.
- **Un défaut trouvé et corrigé en chemin** : l'horodatage de la construction
  était en UTC (18 h 29) alors que la machine était à 20 h 29 — deux horloges
  dans le même dossier, le défaut même que le journal de Petit Gâteau a payé la
  veille. Passé à l'heure de la machine, vérifié contre `date`.
- **Safari n'a pas été essayé**, et c'est écrit dans `A-FAIRE.md` plutôt que
  supposé.
