# Journal — Istiqama

Le plus récent en haut. La forme d'une entrée (en-tête, statut, les quatre
rubriques, « vu passer ») est celle de la compétence `facon-de-travailler` :
elle n'est pas redite ici.

**Index des corrections.** Une entrée devenue fausse se corrige par une
**nouvelle** entrée, jamais en modifiant l'ancienne, et se signale ici.

- **18/09/2026, 20 h 33** — « Aucun dépôt git n'a été créé », et les points
  ouverts « comment mettre l'app sur le téléphone » et « un dépôt git, ou
  pas ». **Réglés le même soir** par l'entrée de 22 h 23 : le dépôt
  `istiqama-site` existe, il est public, et l'app est servie par GitHub Pages.

---

# 18/09/2026, 22 h 54 — Le premier vrai test Safari trouve le défaut que rien d'autre ne pouvait voir

Touche : Istiqama

Statut : **constaté par Samer sur son iPhone**, corrigé et protégé le soir même

## Ce qui a été décidé

- **`#ecran` réserve désormais les quatre marges de sécurité de l'iPhone** —
  haut, bas, gauche et droite — et pas seulement celle du bas.
- **Trois tests neufs gardent la règle** : la présence des marges haut et bas
  sur `#ecran`, celle du bas sur la barre d'onglets, et le fait que
  `viewport-fit=cover` et les marges vont toujours ensemble.

## Pourquoi

**Le défaut, tel que Samer l'a vu** : la ligne de date — « VENDREDI 18
SEPTEMBRE » — était illisible, l'heure du téléphone et l'icône de batterie
posées par-dessus. Sa capture le montre sans ambiguïté.

**La cause** : la page déclare `viewport-fit=cover`, ce qui la fait s'étendre
**sous** la barre d'état et sous l'encoche. La marge du bas avait été réservée
(`env(safe-area-inset-bottom)` sur `#ecran` et sur la barre d'onglets), celle du
haut avait été oubliée. Un seul `env()` manquant, et le premier élément de
l'écran disparaît.

**Et voilà pourquoi aucun contrôle ne l'a vu** : sur un navigateur de bureau,
`env(safe-area-inset-top)` vaut **zéro**. Les quatre écrans avaient été
regardés à 375 × 812, en HTTP, sans une erreur en console — et le défaut était
là, entier. C'est la panne silencieuse dans sa forme la plus pure : l'outil de
mesure ne peut pas voir la chose qu'on lui demande de mesurer, et il répond
vert.

**Ce que ça confirme sur la méthode** : le point « Safari n'est testé nulle
part » n'était pas une précaution de style. Il a rapporté un défaut réel au
premier essai, sur le tout premier écran de l'app.

## Ce que ça change

- **La barre d'onglets, elle, était juste** : la capture de Samer la montre
  au-dessus de la barre de gestes. La parade du bas fonctionne — elle est
  maintenant vue marcher, plus seulement posée.
- **Les trois tests neufs ne remplacent pas un iPhone.** Ils lisent la feuille
  de style à sa source et vérifient que la règle est déclarée. Ils empêchent la
  régression ; ils ne découvrent rien. C'est écrit en tête de leur section pour
  que personne ne s'y trompe.

## Ce qui reste ouvert

- **Le mode paysage n'a pas été essayé.** Les marges gauche et droite sont
  posées dans le même mouvement, donc elles aussi à l'aveugle.
- **Les trois autres écrans** (Le cumul, L'argent, Réglages) n'ont pas été vus
  sur l'iPhone. Ils partagent le même `#ecran`, donc la correction vaut pour
  eux — mais « donc » n'est pas « vu ».

## Vu passer

- **Les trois tests neufs vus ROUGES avant la correction** : « la page réserve
  les marges de sécurité EN HAUT comme en bas » échouait sur la feuille de style
  telle qu'elle était, avec le message qui nomme la conséquence. 30 verts, 1
  rouge.
- **Après correction : 31 tests, 31 verts.**
- **La correction regardée à l'écran**, avec l'encoche simulée (59 px en haut,
  34 px en bas, matérialisée par une bande rouge) : la date passe nettement
  sous la bande. Et sur un écran sans encoche, la marge du haut reste à 16 px —
  aucune régression.

# 18/09/2026, 22 h 23 — Istiqama est en ligne : un seul dépôt public, et son nom est désormais son adresse

Touche : Istiqama · `depots-github.md` (la liste des dépôts de Samer)

Statut : **tranché par Samer** — emplacement, nombre de dépôts, nom

## Ce qui a été décidé

- **L'app est hébergée par GitHub Pages**, dépôt `istiqama-site`, servi depuis
  `/docs` sur `main`.
- **Un seul dépôt, public, qui porte tout** : la source, les documents, le
  journal, et ce qui est servi. Samer a écarté la convention `-source` privé /
  `-site` public qu'il applique à ses trois autres activités.
- **Il s'appelle `istiqama-site`** et non `istiqama`, pour rester dans la
  convention `activité-rôle`.
- **Le dossier construit passe de `2-CONSTRUIT/` à `docs/`**, et il n'est plus
  ignoré par git : c'est GitHub Pages qui le sert.

## Pourquoi

- **Un seul dépôt, choisi en connaissance de cause.** La conséquence lui a été
  dite avant : son journal, son A-FAIRE et son README deviennent publics, donc
  la raison pour laquelle Istiqama vit hors de 89G — une future holding, un
  comptable, un associé possible — est lisible par tous. Il a tranché pour la
  simplicité : une seule commande à tenir. **Aucune donnée de l'app n'y entre**,
  et c'est ce qui rend le choix tenable.
- **`istiqama-site` plutôt qu'`istiqama`.** Aucun domaine ne couvre cette
  adresse, donc **le nom du dépôt EST l'adresse**, et GitHub ne redirige pas les
  anciennes adresses de Pages : le jour où l'icône est sur l'écran d'accueil, ce
  nom ne peut plus changer. C'est exactement ce qui est arrivé au dépôt `APP` de
  Petit Gâteau. Le choix a donc été fait en sachant qu'il est définitif.
- **`docs/` plutôt que `2-CONSTRUIT/`.** GitHub Pages sait servir `/docs` sur
  `main` sans aucune mécanique de déploiement — pas d'action à configurer, pas
  de branche à tenir. Le renommage a été fait ce soir parce qu'il ne coûtait
  encore rien : c'est la règle « rien de difficile à changer ne doit devenir
  porteur », appliquée avant qu'il ne soit trop tard.

## Ce que ça change

- **`depots-github.md` passe de sept à huit dépôts, et de trois activités à
  quatre.** Istiqama y est nommée comme une activité à part, hors 89G, avec la
  mention explicite qu'elle est le seul dépôt à porter sa source et son site
  ensemble.
- **`89G/0-COMPETENCES/` est un miroir de `~/.claude/skills`, refait par
  `sauvegarder.sh`.** Ce miroir est donc en retard d'une modification depuis ce
  soir. Rien n'a été lancé : `sauvegarder.sh` dépose sur les dépôts du groupe,
  et ça ne se fait pas sans demander.
- **89G n'est toujours touché en rien d'autre.** Istiqama ne lit aucun de ses
  fichiers, et aucun des siens ne pointe vers elle.

## Ce qui reste ouvert

- **Safari n'a toujours pas été essayé.** Les deux parades posées à l'aveugle
  (`dvh`, `env(safe-area-inset-bottom)`) n'ont été vues marcher nulle part. Le
  premier vrai test est celui de Samer, sur son iPhone.
- **Ses vraies valeurs** ne sont pas saisies : la règle « manger propre », le
  montant visé, ses placements, sa phrase d'identité.
- **Les points de `A-FAIRE.md` qui restent** : la connexion bancaire (non
  construite exprès) et la sauvegarde qui ne demande rien.

## Vu passer

- `bash verifier.sh` avant le commit → **28 tests verts**, construction faite,
  tous les fichiers de `1-SOURCE/` copiés, aucune sauvegarde personnelle qui
  traîne.
- **L'app servie sous un sous-chemin** (`/istiqama-site/` simulé en local), pas
  seulement à la racine : feuille de style appliquée (fond `rgb(16, 14, 11)`),
  quatre onglets, six cartes, **zéro erreur en console**. C'est le piège des
  chemins absolus, vérifié plutôt que supposé.
- `git push` → commit `9bec1d6`, et **vérifié sur le distant** : `git ls-remote`
  et `git ls-tree` montrent le même commit que le local et les dix fichiers de
  `docs/`. Pas une date de dossier — le contenu réellement présent.
- **Un script qui n'a rien fait, en silence, attrapé au passage** : le
  remplacement dans `.gitignore` cherchait `docs/` alors que le fichier
  contenait encore `2-CONSTRUIT/`. Il s'est exécuté sans erreur et sans effet.
  Refait avec une assertion qui échoue si le motif ne correspond pas — c'est
  désormais la forme utilisée pour tout remplacement de ce genre.

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
