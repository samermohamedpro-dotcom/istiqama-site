# Journal — Istiqama

Le plus récent en haut. La forme d'une entrée (en-tête, statut, les quatre
rubriques, « vu passer ») est celle de la compétence `facon-de-travailler` :
elle n'est pas redite ici.

**Index des corrections.** Une entrée devenue fausse se corrige par une
**nouvelle** entrée, jamais en modifiant l'ancienne, et se signale ici.

- **19/09/2026, 12 h 59** — « l'app n'envoie plus AUCUNE notification », et le
  raccourci Dhikr à huit actions. **Renversés par Samer le même jour**, entrée
  de 13 h 43 : c'est l'app qui notifie, et le raccourci n'a plus qu'une action.
- **19/09/2026, 12 h 29 et 12 h 49** — la rotation séquentielle de l'app, le
  débit de notification limité à 45 minutes, et « l'app affiche une
  notification ». **Remplacés par l'entrée de 12 h 59** : le dhikr est devenu
  une fonction de l'heure, et l'app n'envoie plus aucune notification.
- **19/09/2026, 00 h 10** — l'eau à 10:30 pour premier rappel, et « le Fajr
  n'a pas de rappel d'eau ». **Corrigé par l'entrée de 12 h 29** : le premier
  verre passe au Fajr, à la demande de Samer.
- **19/09/2026, 00 h 07** — les heures des rappels (dhikr 07:00–21:00, eau
  06:30–20:30). **Fausses dès le départ** : elles supposaient une journée
  7 h – 21 h que personne n'avait demandée. Corrigées par l'entrée de 00 h 10.
- **18/09/2026, 23 h 15** — « le hors-connexion n'a jamais été vu marcher » et
  « le service ouvrier est le premier composant que personne n'a pu vérifier ».
  **Réglé onze minutes plus tard** par l'entrée de 23 h 26 : Samer l'a essayé en
  mode avion, ça marche.
- **18/09/2026, 20 h 33** — « Aucun dépôt git n'a été créé », et les points
  ouverts « comment mettre l'app sur le téléphone » et « un dépôt git, ou
  pas ». **Réglés le même soir** par l'entrée de 22 h 23 : le dépôt
  `istiqama-site` existe, il est public, et l'app est servie par GitHub Pages.

---

# 19/09/2026, 13 h 43 — C'est l'app qui parle : un raccourci à UNE action, et la traduction sous chaque dhikr

Touche : Istiqama

Statut : **tranché par Samer**, contre ma conception de l'après-midi

## Ce qui a été décidé

- **C'est l'app qui écrit la notification**, plus le raccourci. Elle dit
  « Un verre d'eau » aux heures d'eau, « Dhikr » le reste du temps, et met le
  dhikr de l'heure dans le corps.
- **Les 14 adhkâr ont une traduction française.** Dans l'app : sous le texte,
  plus petite, en italique. Dans la notification : à la ligne suivante.
- **Les raccourcis tombent à UN seul, avec UNE action** : *Ouvrir les URL*.
  Le même pour l'eau et pour le dhikr.
- **Les heures d'eau entrent dans les réglages** (`heuresEau`), avec une marge
  de 12 minutes.

## Pourquoi

**Samer a renversé ma conception, et il a eu raison.** À 12 h 59 j'avais retiré
la notification de l'app pour supprimer une double bannière, et reporté tout le
travail sur le raccourci — huit actions à monter à la main, avec un format de
date et un calcul. Sa réponse : « je préfère quand c'était l'app qui me disait
verre d'eau ou dhikr avec le dhikr écrit directement dans le centre de
notification ».

**Ce que j'avais raté** : la double bannière venait de ce que DEUX choses
notifiaient. Je l'ai réglée en supprimant la mauvaise des deux. En supprimant
l'autre — la notification du raccourci — le problème disparaît pareil, **et**
le raccourci devient trivial, **et** le contenu est écrit par le seul programme
qui sait tout : l'app. Trois gains au lieu d'un.

**La marge de 12 minutes sur les heures d'eau** : une automatisation iOS ne part
pas à la seconde. Sans marge, un rappel de 10 h 30 parti à 10 h 34 arriverait
sous le titre « Dhikr », au moment de boire.

**Ce que je n'ai pas pu faire, et qui était demandé** : la traduction « en plus
petit » DANS la notification. Le corps d'une notification iOS n'a qu'une seule
fonte. Elle est donc à la ligne du dessous, de la même taille. **Dans l'app,
elle est plus petite et en italique** — et un test vérifie qu'elle l'est
réellement, en comparant les deux tailles dans la feuille de style.

## Ce que ça change

- **Deux tests ont été réécrits** — ils affirmaient « l'app n'envoie AUCUNE
  notification », règle qui aura vécu deux heures. Le commentaire qui les
  remplace dit pourquoi, et qui a tranché.
- **Trois ponts entre copies existent maintenant** : les textes, les
  traductions, et les heures d'eau — tous entre `RAPPELS.md` et le code.
- **Les traductions sont des rendus français courants**, pas une traduction
  savante. C'est écrit dans le code et dans le document : elles se contrôlent
  comme le reste.

## Ce qui reste ouvert

- **Les 14 adhkâr ET leurs traductions** attendent toujours le contrôle de
  Samer avec sa référence.
- **Les automatisations ne sont pas installées.**

## Vu passer

- **75 tests, 75 verts.**
- **Huit protections cassées et vues rouges** : la marge d'eau supprimée puis
  élargie à 45 minutes, la traduction placée avant le texte, la traduction
  rendue aussi grosse que le texte, le titre figé sur « Dhikr », une traduction
  divergente entre le document et le code, une heure d'eau changée dans le
  document, une heure d'eau retirée de l'app.
- **Regardé à l'écran** : texte à 19 px, traduction à 14 px en italique
  dessous, puis la source. Aucun débordement.
- **Deux fausses manœuvres sur moi-même** : une insertion tombée APRÈS
  l'accolade fermante (le fichier ne compilait plus, `git checkout` et refait
  proprement), et un motif de cassure avec un antislash de trop — l'assertion
  a bloqué avant d'écrire, comme elle devait.

# 19/09/2026, 12 h 59 — Le dhikr est une fonction de l'heure : deux programmes qui ne se parlent pas tombent d'accord

Touche : Istiqama

Statut : **demandé par Samer** — « règle les deux »

## Ce qui a été décidé

- **Le dhikr affiché est celui de l'heure qu'il est** (`dhikrDeLHeure`), dans
  l'app comme dans le raccourci. Plus aucun compteur enregistré.
- **La liste à coller dans le raccourci fait 24 lignes**, une par heure.
- **Le raccourci lit l'heure** au lieu de tirer au hasard : *Formater la date*
  en `H`, **+ 1**, *Élément à l'index*.
- **L'app n'envoie plus AUCUNE notification.**
- **« Le suivant » devient un feuilletage** : un écart volontaire, qui se
  referme dès que l'heure tourne.
- **Le classeur perd `dhikrIndex` et `derniereNotification`.**

## Pourquoi

**Les deux défauts n'en faisaient qu'un, et c'est ce qui a permis de les régler
ensemble.**

- **Le raccourci pouvait répéter** : un raccourci iOS ne mémorise rien entre
  deux exécutions, donc il tirait au hasard.
- **Deux bannières au moment du rappel d'eau** : le raccourci « Eau » ouvre
  l'app, et l'app notifiait à chaque ouverture.
- **Et un troisième, que personne n'avait vu** : l'app et le raccourci
  choisissaient chacun leur dhikr dans leur coin. On recevait une bannière
  coupée, on ouvrait l'app pour lire la suite — et on trouvait **autre chose**.
  Sans une seule erreur nulle part.

**La racine était commune : deux états parallèles qui ne pouvaient pas rester
d'accord.** La seule façon de faire concorder deux programmes qui ne se parlent
pas est de leur donner une entrée commune qu'aucun des deux ne possède. Ici,
c'est l'heure. Chacun calcule de son côté et tombe sur le même, pour toujours,
sans synchronisation.

**Pourquoi l'app cesse de notifier.** Une bannière qui s'affiche pendant qu'on
regarde l'app ne sert à rien : la carte du dhikr est là, en entier, et la
bannière la donne coupée. L'app ne notifiait qu'à son ouverture — donc toujours
au mauvais moment.

**Ce que ça coûte, et c'est dit partout** : tant que le raccourci n'est pas
installé, il n'y a plus aucun rappel de dhikr. C'est écrit dans l'app, dans
`RAPPELS.md`, et ici.

**Pourquoi 24 lignes et pas 14** : Raccourcis sait lire « l'élément numéro N »
mais pas calculer un reste de division sans deux actions de plus. Déplier la
liste sur les heures fait passer la recette de onze actions à huit, sur un
téléphone, à faire à la main. Le prix : sur des créneaux de 11 h à 23 h,
**treize** des quatorze passent chaque jour — le quatorzième tombe à 10 h.
Dit, pas caché.

## Ce que ça change

- **Neuf tests ont été RETIRÉS**, et un commentaire en tête de `tests.mjs` dit
  lesquels et pourquoi. Ils ne gênaient pas : ils décrivaient une règle morte.
  Ce qu'ils protégeaient l'est maintenant par un seul test, plus fort — celui
  qui vérifie que le raccourci et l'app tombent sur le même dhikr aux 24 heures.
- **Cinq fonctions supprimées** : `dhikrSuivant`, `peutNotifier`,
  `corpsDuRappel`, `texteACollerDansRaccourcis`, et les deux fonctions de
  permission de l'écran Réglages.
- **Le crochet `notificationclick` du service ouvrier est GARDÉ exprès**, et la
  raison est écrite dans le code : la décision sur une vraie notification
  poussée est encore ouverte (`A-FAIRE.md`), et il servira tel quel ce jour-là.

## Ce qui reste ouvert

- **Samer n'a toujours pas contrôlé les 14 adhkâr** avec sa référence.
- **Les raccourcis ne sont pas installés** — et maintenant, sans eux, il n'y a
  aucun rappel.
- **La vraie notification poussée**, toujours à trancher.

## Vu passer

- **70 tests, 70 verts.**
- **Le test d'accord vu REFUSER trois divergences** : le raccourci décalé d'une
  ligne, la liste ramenée à 14 lignes, et le dhikr rendu dépendant du jour.
- **Vérifié dans le navigateur** : à 12 h, l'app affiche « 13 sur 14 · celui de
  cette heure », et le texte est exactement celui que renvoie `dhikrDeLHeure`.
  « Le suivant » passe à « 14 sur 14 · feuilleté ».
- **Les 24 lignes de la zone à coller comparées une par une** aux 24 heures :
  toutes concordent.
- **Deux fausses manœuvres attrapées sur moi-même** : une assertion a bloqué
  l'écriture d'`app.js` à mi-chemin (le fichier est resté intact, et c'est pour
  ça qu'elle était là) ; et `dhikrCourant` a été emporté par le nettoyage parce
  qu'il vivait entre un commentaire et une fonction morte — les tests l'ont dit
  tout de suite.

# 19/09/2026, 12 h 49 — Le dhikr s'affiche EN ENTIER dans l'app, parce que la notification ne le pourra jamais

Touche : Istiqama

Statut : **constaté par Samer** — « quand j'ouvre l'app je ne vois pas le dhikr
au complet »

## Ce qui a été décidé

- **Une carte « Le dhikr » sur l'écran du jour**, juste sous l'anneau : le texte
  entier, sa source, et son rang (« 9 sur 14 »).
- **Appuyer sur le texte compte** une répétition — le compteur de séance à côté,
  le total du jour en dessous.
- **Un bouton « Le suivant »** passe au dhikr suivant et remet le compteur de
  séance à zéro.
- **`dhikrIndex` désigne désormais ce qui est AFFICHÉ**, plus « ce qui viendra ».

## Pourquoi

**La notification sera toujours coupée, et ce n'est pas réparable** : iOS
tronque la bannière après deux lignes. Le n° 9, *Sayyid al-istighfâr*, fait
252 caractères — il ne rentrera jamais. Tirer la bannière vers le bas l'ouvre,
mais c'est un geste qu'on ne fait pas en conduisant.

**Le vrai défaut était ailleurs** : le dhikr n'était **nulle part** sur l'écran
du jour. Il n'existait que dans les Réglages, derrière un bouton « Les voir ».
L'app envoyait un texte qu'elle ne montrait pas. C'est un oubli de conception,
pas un réglage.

**Pourquoi `dhikrIndex` change de sens.** Il désignait « le prochain à
montrer ». La carte et la notification auraient alors affiché deux adhkâr
différents, décalés d'un cran, sans que personne ne comprenne pourquoi la
bannière dit une chose et l'écran une autre. Il désigne maintenant ce qui est
affiché : la notification avance d'un cran **puis** montre ce cran, et la carte
lit le même nombre. Un test vérifie que les deux concordent.

**Le compteur est une séance, pas une donnée.** Combien de fois on a répété le
dhikr affiché n'a aucun sens le lendemain : il vit en mémoire. Le **total du
jour**, lui, est enregistré.

## Ce que ça change

- **`adhkar.js`** gagne `dhikrCourant`. `logique.js` : une journée neuve porte
  `dhikrs: 0`.
- **L'écran du jour a une carte de plus**, et c'est la deuxième après l'anneau —
  avant même la chose du jour. C'est un choix : c'est ce qu'on vient lire quand
  une notification arrive.

## Ce qui reste ouvert

- **Le raccourci « Dhikr » tire au hasard**, donc il peut répéter — un raccourci
  iOS ne mémorise rien entre deux exécutions. Seule l'app tient la promesse
  « toujours différent ». Proposé à Samer : rendre le raccourci déterministe en
  calculant l'indice depuis l'heure. Pas tranché.
- **Le raccourci « Eau » ouvre l'app**, donc l'app affichera aussi un dhikr :
  deux bannières coup sur coup. Proposé, pas tranché.
- **Les 14 adhkâr ne sont toujours pas contrôlés** par Samer avec sa référence.

## Vu passer

- **68 tests, 68 verts.**
- **Le plus long des quatorze regardé à l'écran** : 252 caractères, affiché
  **entier**, sans coupure ni débordement.
- **Les 14 adhkâr mesurés à 320 et 430 px** — 28 mesures, aucun débordement,
  aucune coupure.
- **Le compteur et « Le suivant » essayés** : trois appuis → « × 3 » et
  « 3 aujourd'hui » ; « Le suivant » → n° 10, compteur de séance remis à zéro.
- **Une fausse alerte, et c'est ma mesure qui avait tort** : le total du jour
  semblait ne pas s'enregistrer. Je lisais la première clé du classeur
  (`2026-09-18`, un reste d'essai) au lieu de celle d'aujourd'hui. Vérifié avant
  de « corriger » un défaut qui n'existait pas.

# 19/09/2026, 12 h 29 — La notification affiche un dhikr, et elle se tait quand elle vient de parler

Touche : Istiqama

Statut : **constaté puis demandé par Samer** — capture du centre de
notifications à l'appui

## Ce qui a été décidé

- **La notification de l'app affiche un dhikr**, pas « Il te reste 11 choses ».
  Le dhikr passe en premier, le compte de la journée en seconde ligne.
- **La rotation est séquentielle**, pas au hasard : les quatorze passent avant
  qu'un seul revienne.
- **L'app se tait si elle a parlé il y a moins de 45 minutes.**
- **Un rappel d'eau au Fajr**, et le dernier passe à 22 h 30 — huit verres,
  toujours.
- **Le vendredi reste un jour comme les autres** pour les rappels.

## Pourquoi

**Sa capture montrait le défaut en entier** : quatre notifications identiques —
23:55, 00:06, 00:46, puis 12:24 — toutes « Il te reste 11 choses aujourd'hui ».
Deux défauts, pas un :

- **le contenu ne changeait jamais**, alors que l'app porte quatorze adhkâr
  depuis la veille ;
- **elle partait à chaque retour au premier plan**, donc plusieurs fois par
  heure. Une notification qu'on voit trop devient un décor, puis on coupe les
  notifications de l'app — et on perd tout, y compris ce qui était utile.

**Séquentiel et non au hasard.** Samer a demandé « toujours différent ». Le
hasard ne le donne pas : sur quatorze, il retombe sur le même une fois sur
quatorze, et laisse des adhkâr jamais vus pendant des jours. Un tour complet
garantit exactement ce qui a été demandé.

**Le tour avance AVANT l'affichage.** Si l'index n'avançait qu'après un succès,
un échec d'affichage le bloquerait — et on retomberait sur « toujours le même »,
c'est-à-dire le défaut qu'on corrige.

**Le seuil est à 45 minutes et pas à une heure** : le rythme visé est horaire, et
un rappel qui arrive 58 minutes après le précédent doit passer.

**Le Fajr** : Samer se lève pour la prière, donc c'est le moment où il est déjà
debout, et on se lève déshydraté. Le rappel de 06:00 **dérivera** — l'heure du
Fajr va de 4 h en juin à 6 h 45 en décembre à Paris — et c'est écrit dans
`RAPPELS.md` plutôt que caché.

**Le vendredi** : sa règle de méthode dit « vendredi est jour de repos ». Elle
vaut pour le travail, pas pour l'eau ni pour le dhikr. Il l'a tranché en trois
mots : « le vendredi non tu garde ».

## Ce que ça change

- **`adhkar.js`** gagne `dhikrSuivant`, `peutNotifier`, `corpsDuRappel` — toutes
  pures, toutes testées. Le texte de la notification est sorti de l'écran pour
  pouvoir être éprouvé : un corps mal formé ne se voit que sur le téléphone,
  quand il est trop tard.
- **Le classeur** porte `dhikrIndex` et `derniereNotification`. Dans les données
  et non en mémoire : sinon le tour repartirait au premier dhikr à chaque
  ouverture.
- **`direCeQuiReste` s'appelle maintenant `rappelDuMoment`** — le nom disait ce
  qu'elle ne fait plus.

## Ce qui reste ouvert

- **Samer n'a toujours pas contrôlé les 14 adhkâr** avec sa référence.
- **Les raccourcis ne sont pas installés** : l'app parle quand elle s'ouvre, ce
  qui ne remplace pas un rappel qui sonne tout seul.

## Vu passer

- **66 tests, 66 verts** (5 de plus).
- **Quatre protections cassées et vues rouges** : la rotation remplacée par un
  tirage au hasard (2 rouges), le seuil de notification mis à zéro, le seuil
  passé au-dessus d'une heure, et un index négatif plus rattrapé.
- **La rotation regardée dans le navigateur** : quatre adhkâr différents à la
  suite, dans l'ordre.
- **Les notifications sont refusées dans le navigateur d'aperçu** (`permission:
  denied`), donc l'affichage réel n'a pas pu être vu ici. C'est le téléphone de
  Samer qui tranchera — et sa capture prouve déjà que le mécanisme fonctionne
  chez lui.

# 19/09/2026, 00 h 10 — Les rappels suivent SA journée, pas une journée moyenne

Touche : Istiqama

Statut : **dit par Samer** — « pour l'eau 6h30 je dors encore je me réveil que
à partir de 10h30 et me couche après 00h »

## Ce qui a été décidé

- **L'eau** : 10:30 · 12:00 · 14:00 · 16:00 · 18:00 · 20:00 · 21:30 · 23:00.
- **Le dhikr** : toutes les heures de **11:00 à 23:00**, soit 13 automatisations
  au lieu de 15.

## Pourquoi

**Les heures d'hier soir étaient fausses dès l'instant où je les ai écrites.**
J'avais calé 07:00–21:00 pour le dhikr et 06:30 pour le premier verre d'eau,
sur une journée moyenne que personne n'avait demandée. Samer se lève vers
10 h 30 et se couche après minuit : six rappels de dhikr partaient pendant qu'il
dormait, et le premier verre d'eau arrivait quatre heures avant son réveil.

**Ce n'est pas un détail de confort.** Un rappel qui sonne pendant qu'on dort
apprend à ignorer les notifications de l'app — et une notification qu'on ignore
est pire qu'une notification absente. Ça aurait tué le mécanisme avant qu'il
serve.

**Ce que ça dit sur ma façon de faire** : j'ai proposé des heures précises sans
demander à quelle heure il se lève. La question tenait en une ligne.

## Ce que ça change

- **`RAPPELS.md`** porte les nouvelles heures, et dit d'où elles viennent.
- **Le premier verre est au réveil**, parce qu'on se lève déshydraté ; le
  dernier à 23 h, assez tôt pour ne pas réveiller la nuit.
- **Aucun code n'a changé** : les heures ne vivent que dans les automatisations
  du téléphone et dans ce document.

## Ce qui reste ouvert

- **Le Fajr.** S'il se lève pour la prière puis se rendort, il manque un verre
  d'eau à ce moment-là — et il faudrait en retirer un le soir pour rester à
  huit. Posé, pas tranché.
- **Le vendredi**, toujours pas traité à part.

## Vu passer

- Rien lancé : seuls deux documents ont changé.

# 19/09/2026, 00 h 07 — Le dhikr toutes les heures et l'eau huit fois : par Raccourcis, parce qu'iOS ne sait pas faire autrement

Touche : Istiqama

Statut : **tranché par Samer** — le rythme, le mécanisme, et l'écriture en
franco-arabe

## Ce qui a été décidé

- **14 adhkâr**, en rotation, **en franco-arabe** — pas en écriture arabe
  (Samer : « je les veux en franco-arabe pas l'arabe écriture »). Le n° 13, dont
  l'authenticité est discutée, est **gardé** à sa demande, et marqué comme tel.
- **Le dhikr part toutes les heures**, de 07:00 à 21:00, par 15 automatisations
  Raccourcis qui lancent toutes le même raccourci : il tire un dhikr au hasard
  et l'affiche.
- **L'eau part huit fois** : 06:30 → 20:30 toutes les deux heures.
- **Un document à eux, `RAPPELS.md`** : les 14, les deux raccourcis à créer, les
  23 automatisations avec leurs heures.
- **Dans l'app** : une carte qui donne le texte à coller, un bouton de copie, et
  la liste avec ses sources.

## Pourquoi

**Samer voulait toutes les 20 minutes. Ce n'est pas possible, et c'est vérifié** :
iOS n'a **aucun déclencheur d'intervalle** — les automatisations ne partent qu'à
des heures fixes, une par heure. Et une app web ne peut pas programmer de
notification locale. Toutes les 20 min de 7 h à 22 h ferait **45 automatisations
à créer à la main**. Il a choisi l'heure, en connaissance de cause.

**Pourquoi les adhkâr vivent dans `adhkar.js` et pas dans le document** :
`RAPPELS.md` est une seconde copie, que Samer lira sur son téléphone en
installant les raccourcis. Si les deux divergent, il collera autre chose que ce
qu'il croit. **Un test compare les deux**, ligne par ligne.

## Ce que ça change

- **Le garde-fou de construction a servi pour de vrai** : `adhkar.js` a été créé
  et `verifier.sh` a refusé, en nommant le fichier — « MANQUE : adhkar.js n'est
  pas copié par construire.mjs ». C'est exactement ce pour quoi il avait été
  écrit, et c'est la première fois qu'il attrape quelque chose en situation.
- **Ce qui est garanti et ce qui ne l'est pas est écrit partout** : deux adhkâr
  vérifiés à la source, les autres non, un discuté. Dans le document, dans le
  code, et à l'écran.

## Ce qui reste ouvert

- **Samer doit contrôler la liste avec sa propre référence.** Je ne suis pas
  savant, et c'est écrit à trois endroits.
- **Le vendredi n'est pas traité à part.** Si les rappels doivent se taire ce
  jour-là, ça se fait dans le raccourci.
- **L'écriture franco-arabe est la forme des livres** (`ch` pour ش, `â/î/û`).
  Si Samer préfère la forme « chat » avec les chiffres (3, 7, 9), c'est un seul
  fichier à changer.

## Vu passer

- **61 tests, 61 verts.**
- **Le pont entre les deux copies vu REFUSER trois divergences** : un mot changé
  dans `RAPPELS.md`, un dhikr retiré de l'app, et de l'arabe remis dans un
  texte — chaque fois sur le bon test, avec le n° fautif dans le message.
- **Un défaut trouvé sur moi-même, et il est du pire genre** : le bouton de
  copie annonçait « ✓ 14 adhkâr copiés » **sans rien copier**.
  `navigator.clipboard.writeText()` se résolvait, et le collage ne rendait rien.
  Trouvé en collant vraiment, après avoir vérifié que le presse-papier
  fonctionnait par ailleurs (cmd+C puis cmd+V, aller-retour réussi) — sans quoi
  j'aurais accusé l'outil au lieu du code.
  **Ce qui a été fait** : le message n'affirme plus rien qu'il ne peut prouver
  (« colle pour vérifier »), et une **zone de texte sélectionnable** est
  toujours affichée — appui long, Tout sélectionner, Copier. Ce chemin-là marche
  partout.
- **Le contenu de la zone vérifié dans le navigateur** : 14 lignes, aucune vide,
  aucun caractère arabe, aucun numéro ni source qui fuit.
- **Zéro débordement** à 320 et 430 px sur les quatre onglets.

# 18/09/2026, 23 h 53 — On peut enfin AJOUTER et SUPPRIMER une habitude : ça manquait depuis le premier jour

Touche : Istiqama

Statut : **manque signalé par Samer en s'en servant** (« je peux ni ajouter ni
supprimer »), corrigé le soir même

## Ce qui a été décidé

- **Un formulaire d'ajout** dans *Réglages* : nom, domaine, façon de cocher
  (fait/pas fait · un nombre à atteindre · à l'heure ou rattrapée), et selon le
  cas un détail ou un objectif avec son unité. Fermé par défaut.
- **Un bouton ✕ par habitude**, qui demande confirmation.
- **Supprimer ne touche à AUCUNE journée passée.** Si l'habitude est recréée du
  même nom, son historique revient.
- **« Éteindre » et « Supprimer » sont deux gestes différents**, et la
  différence est écrite à l'écran comme dans la confirmation.

## Pourquoi

**C'était un trou, pas un choix.** Les placements avaient « + » et « ✕ », les
projets se modifient dans une zone de texte — les habitudes n'avaient qu'un
interrupteur. Une app personnelle dont on ne peut pas changer ce qu'on suit est
l'app de quelqu'un d'autre. Trouvé par l'usage, pas par un test : aucun test
n'avait de raison de chercher un bouton qui n'a jamais existé.

**L'identifiant se fabrique à partir du nom, sans accent ni espace, et ne change
plus jamais** — parce qu'il devient une CLÉ dans chaque journée enregistrée.
C'est la règle « rien de difficile à changer ne doit devenir porteur », à
l'intérieur des données cette fois. Deux habitudes du même nom reçoivent des
clés différentes : partager une clé ferait écraser l'historique de la première,
en silence.

**Supprimer ne nettoie pas les journées, et c'est voulu.** Les journées passées
restent vraies telles qu'elles ont été vécues, et les clés orphelines ne coûtent
rien. Le bénéfice est réel : recréer une habitude du même nom lui rend son
passé.

## Ce que ça change

- **`logique.js`** gagne `identifiantDepuis`, `ajouterHabitude`,
  `supprimerHabitude`, `TYPES_HABITUDE` et `DOMAINES_CONNUS` — toutes pures,
  toutes testées.
- **Les trois domaines restent figés** (le corps, la religion, la tête). En
  ajouter un demanderait une couleur, une place dans l'ordre et une entrée dans
  `DOMAINES` : à faire le jour où il en manque un, pas avant.

## Ce qui reste ouvert

- **Réordonner les habitudes** — pas demandé, pas construit.
- **Ajouter un domaine** — voir ci-dessus.
- **Le retour haptique**, **le mode paysage**, **les trois autres écrans sur
  l'iPhone** : toujours pas vus.

## Vu passer

- **56 tests, 56 verts** (7 de plus).
- **Quatre protections cassées volontairement et vues rouges** sur le bon test :
  deux habitudes du même nom partageant une clé, un compteur d'objectif zéro,
  l'ajout qui modifie la liste sur place, un nom vide accepté en silence.
- **Le parcours entier essayé dans un vrai navigateur** : ajout d'une habitude
  nommée « Méditer l'après-midi » (accent et apostrophe) → clé
  `mediter_l_apres_midi`, apparue sur l'écran du jour, cochée quatre fois,
  valeur enregistrée à 4 et plafonnée à 1 point. Puis supprimée : liste passée
  de 12 à 11, **et la valeur 4 toujours présente dans la journée**.
- **Zéro débordement** à 320 et 430 px avec le formulaire ouvert.
- **Un faux négatif attrapé au passage** : une de mes commandes de cassure n'a
  rien remplacé — l'apostrophe typographique fait trois octets et le motif n'en
  mangeait qu'un. Le test semblait dormir ; c'était la commande qui ne faisait
  rien. Refaite avec une assertion qui échoue si le motif ne correspond pas.

# 18/09/2026, 23 h 26 — Le hors-connexion marche : c'est Samer qui l'a prouvé, pas une machine

Touche : Istiqama

Statut : **constaté par Samer sur son iPhone**

## Ce qui a été décidé

- **Le point « le hors-connexion n'a jamais été vu marcher » est CLOS**, et
  archivé avec son titre dans `archives/A-FAIRE-ISTIQAMA-fait-2026-09.md`.
- **La porte de sortie reste** : *Réglages* → *Vider le cache et recharger*.

## Pourquoi

**Ce qu'il a fait, et c'est le seul essai qui pouvait trancher** : app
rechargée, **mode avion**, app rouverte. Elle s'affiche.

Onze minutes plus tôt, ce composant était le seul du projet que personne n'avait
vu fonctionner — et pas par négligence : le navigateur d'aperçu refuse
d'enregistrer un service ouvrier, **même vide**, ce qui avait été vérifié. Les
trois tests écrits à la place ne lisaient que les parades DÉCLARÉES dans le
fichier produit ; ils ne prouvaient rien sur son comportement réel. Ils gardent
exactement cette valeur-là, ni plus ni moins.

**Pourquoi la porte de sortie reste, alors que ça marche.** Elle ne protégeait
pas seulement contre un service ouvrier qui ne s'enregistre pas — ce risque-là
est levé. Elle protège contre un service ouvrier qui **se coince sur une vieille
version**, et ce risque-là ne l'est pas : c'est une panne qui ne fait aucun
bruit. On corrigerait un défaut, on déposerait, et rien ne changerait sur le
téléphone.

## Ce que ça change

- **`A-FAIRE.md`** perd une ligne de son tableau et une section entière.
- **`LISEZ-MOI-DABORD.md`** : le service ouvrier passe de « jamais vu marcher »
  à « vu marcher — Samer, mode avion ».
- **Ce qui reste invérifié se réduit à trois choses** : le retour haptique, le
  mode paysage, et les trois écrans autres qu'*Aujourd'hui* sur l'iPhone.

## Ce qui reste ouvert

- **Le retour haptique n'a jamais été senti.**
- **Le mode paysage**, et **les trois autres écrans sur l'iPhone**.
- **La vraie notification poussée** — une décision de Samer, pas un chantier.
- **Ses vraies valeurs** ne sont toujours pas saisies.

## Vu passer

- **Le seul essai qui comptait, fait par Samer** : mode avion, app rouverte,
  elle s'affiche.
- Rien d'autre n'a été lancé : aucun code n'a changé, seuls les documents.

# 18/09/2026, 23 h 15 — Sept mécanismes de rétention, chacun tiré d'une mesure publiée et non d'une intuition

Touche : Istiqama

Statut : **demandé par Samer** (« faut que ça joue dans mon cerveau comme un jeu
qui stimule », « fais des recherches poussées ») · mécanismes **choisis en
session** d'après la recherche, à contredire s'il veut

## Ce qui a été décidé

- **Le gel de chaîne** : il s'en gagne un tous les 7 jours corrects (60 % des
  points), le stock est plafonné à trois, il couvre la journée entière, et il ne
  s'achète pas.
- **Les paliers** — 7, 14, 21, 30, 60, 100, 180, 365 — et le prochain est
  toujours nommé à l'écran.
- **Le niveau et le rang** — huit rangs de *Premier pas* à *Istiqama*, sur une
  courbe en racine carrée. **Il ne baisse jamais.**
- **Les votes d'identité**, comptés sur 30 jours.
- **L'anneau du jour**, avec une transition qu'on voit avancer, et un retour
  haptique **uniquement quand ça monte**.
- **La semaine en sept cases** sous chaque habitude, avec quatre états dont le
  gel.
- **Le bilan du soir**, ouvert par un bouton.
- **Le zoom au double-appui est supprimé** (`touch-action: manipulation`), le
  zoom à deux doigts reste.
- **Un service ouvrier** sert l'app hors connexion.
- **Aucune notification programmée n'est construite**, et la raison est
  documentée.

## Pourquoi

**Chaque mécanisme vient d'une mesure, pas d'une intuition** — les sources sont
dans `README.md`, § « Ce qui fait qu'on revient ». Les trois qui ont décidé de
tout :

- **plus de la moitié des gens abandonnent une app de suivi dans les trente
  jours.** Le problème à résoudre n'est donc pas « avoir des fonctions », c'est
  franchir le premier mois ;
- **le gel de chaîne a réduit l'abandon de 21 %** chez Duolingo, et les apps qui
  en ont gardent leurs gens 17,2 jours après le 7ᵉ contre 11,6 sans. C'est le
  mécanisme le plus rentable du domaine, et il n'était pas dans l'app ;
- **le 7ᵉ jour est la bascule** : au-delà, on reste 2,4 fois plus longtemps. Il
  devait être nommé, pas seulement atteint.

**Le niveau existe pour une raison précise** : la chaîne ne sait que punir. Une
mauvaise semaine remettait tout à zéro, et c'est le moment exact où l'on ferme
une app pour de bon. Le niveau est ce qui reste — et c'est la traduction
littérale de L'Effet cumulé : ce qui est acquis ne se reperd pas.

**Ce qui a été écarté exprès** : le pet virtuel de Finch, le personnage qui
meurt de Habitica, les classements et les amis. La recherche dit que la
responsabilité sociale marche bien — mais cette app porte une pratique
religieuse et de l'argent personnel. Ça ne se partage pas.

**Pourquoi aucune notification programmée** : vérifié ce jour-là, **une app web
ne peut pas se réveiller seule sur iPhone**. Il faudrait un serveur qui pousse,
donc l'abonnement du téléphone quitterait le téléphone, donc la première règle
du projet tomberait. Elle ne doit pas tomber au détour d'une fonctionnalité
pratique. La chaîne qui marche sans rien coûter — une automatisation
*Raccourcis* ouvre l'app, l'app dit ce qu'il reste — est dans
`LISEZ-MOI-DABORD.md`, et le vrai choix est posé dans `A-FAIRE.md`.

## Ce que ça change

- **`logique.js` gagne dix fonctions pures** et reste sans aucun accès à
  l'écran : tout est testable hors navigateur.
- **`donnees.js`** porte `gels.utilises` — une simple liste de clés de jour, qui
  se lit à l'œil nu dans une sauvegarde.
- **Le service ouvrier est le premier composant du projet que personne n'a pu
  vérifier.** Il a donc une porte de sortie : *Réglages* → *Vider le cache et
  recharger*, qui ne touche pas aux données.
- **`docs/` s'appelait `2-CONSTRUIT/`** jusqu'à l'entrée de 22 h 23 ; les
  documents qui le nommaient sont à jour.

## Ce qui reste ouvert

- **Le hors-connexion n'a jamais été vu marcher.** Le test est celui de Samer :
  ouvrir l'app, passer en mode avion, la rouvrir.
- **Le retour haptique n'a jamais été senti.** Il passe par un détournement de
  `<input type="checkbox" switch>` (Safari 17.4+), qu'Apple a modifié en
  iOS 26.5. Il est enveloppé : s'il ne marche pas, rien ne casse.
- **La vraie notification poussée** — une décision, pas un chantier :
  `A-FAIRE.md`.
- **Le mode paysage** et **les trois autres écrans sur l'iPhone**, toujours pas
  vus.

## Vu passer

- **49 tests, 49 verts.** Vingt et un de plus qu'au matin.
- **Six protections cassées volontairement et vues rouges**, sur le bon test à
  chaque fois : le gel qui ne sauve plus rien (2 rouges), le plafond de gels
  retiré, le seuil du jour correct mis à zéro, le niveau qui ne compte plus que
  la dernière semaine (2 rouges), `skipWaiting` retiré du service ouvrier, et la
  course contre la montre retirée de la notification.
- **Un défaut de justesse trouvé À L'ÉCRAN, que les tests ne voyaient pas** :
  l'offre de gel annonçait « garde ta chaîne de 39 jours » alors que l'habitude
  manquée en avait 3 — le chiffre était vrai, et il répondait à une autre
  question. `chaineSauveeParUnGel` a été écrite pour ça, et son test a été vu
  rouge sur l'ancien calcul.
- **Un défaut de mise en page trouvé à l'écran** : la grille de la semaine
  passait sous les boutons des prières. Elle occupe maintenant sa propre ligne.
- **Zéro débordement horizontal** — 5 largeurs (320, 375, 430, 768) × 4 onglets,
  mesuré dans un vrai navigateur, sur les éléments eux-mêmes et pas seulement
  sur la page.
- **Une panne silencieuse évitée de justesse** : `navigator.serviceWorker.ready`
  ne se résout **jamais** quand l'enregistrement a échoué — il n'échoue pas, il
  attend. La fonction de notification serait restée suspendue pour toujours,
  sans une ligne d'erreur. Trouvé parce que le navigateur d'aperçu refuse les
  services ouvriers, et vérifié : **même un service ouvrier vide** y échoue.

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
