# Istiqama — pourquoi elle existe, et ce qu'elle refuse de faire

**الاستقامة** — la droiture, la constance, le fait de se tenir droit dans la
durée. C'est le sujet de tous les livres dont cette app est tirée, dit en un
mot.

Elle répond à une demande de Samer, le 18/09/2026 : *« une application qui
m'aide tous les jours à être meilleur »*, dans l'esprit de **L'Effet cumulé**
(Darren Hardy) — mieux manger, tenir ses objectifs religieux, ses finances, et
voir avancer ses projets.

---

## Le pari du livre, et pourquoi il demande un outil

L'Effet cumulé tient en une phrase : **de petites décisions, insignifiantes le
jour où on les prend, deviennent énormes en se répétant.** Et son corollaire,
qui est le vrai problème : **on ne les voit pas.** Une journée de plus ou de
moins ne change rien de mesurable. C'est précisément pour ça qu'on abandonne —
non par manque de volonté, mais parce que l'effort ne renvoie aucun signal.

Un outil n'ajoute pas de volonté. Il fait une seule chose, et elle suffit :
**il rend visible ce qui ne l'est pas.**

---

## Les quatre mécanismes, et le livre de chacun

**1. La chaîne** — *Atomic Habits*, James Clear.
Le nombre de jours d'affilée s'affiche à côté de chaque habitude. Ce n'est pas
un jeu : c'est la seule chose qui rende coûteux le fait de sauter un jour. Deux
détails décident si elle marche ou pas, et ils sont tenus par des tests :

- **elle ne casse pas parce que la journée en cours n'est pas encore cochée.**
  Sinon chaque réveil remettrait tout à zéro, et on cesserait d'ouvrir l'app en
  une semaine ;
- **une prière rattrapée compte.** Le seuil est bas exprès. Le jour où « tenir »
  devient exigeant, on arrête de tenir.

**2. Jamais deux fois de suite** — Clear encore, et c'est la règle la plus utile
du lot. Manquer une fois est un accident ; manquer deux fois, c'est la nouvelle
habitude qui commence. L'app le dit **uniquement le lendemain d'un raté**, en
haut de l'écran, et pas les autres jours. Une alerte permanente devient un
décor.

**3. La courbe du cumul** — Hardy, et c'est l'écran central.
Deux lignes : ce que tu as réellement accumulé, et ce que ça aurait fait en
tenant tout. **L'écart entre les deux est le sujet du livre.** Un score du jour
ne montre rien — il est bon ou mauvais, et on l'oublie. Deux droites qui
s'écartent sur trente jours, non.

**4. La chose du jour** — *The One Thing*, Gary Keller.
Une seule, jamais une liste : celle qui, faite seule, rendrait la journée
utile.

Et une cinquième chose qui ne vient pas d'un livre mais de la méthode de
travail de Samer : **la part réellement tenue est comptée honnêtement.** Les
jours passés où rien n'a été noté comptent comme ratés. Sans ça, il suffirait
de ne rien inscrire pour rester à 100 %, et le chiffre le plus important de
l'app deviendrait un mensonge poli.

---

## Ce que l'app refuse de faire, et pourquoi

- **Pas d'encouragements, pas de confettis, pas de badges.** Samer a demandé un
  outil. La phrase du bas dit « 7,5 sur 11 aujourd'hui », et rien d'autre. La
  projection d'argent a le droit de répondre **« à ce rythme, jamais »** — un
  outil qui ne peut pas annoncer une mauvaise nouvelle ne sert à rien.
- **Pas de compte bancaire connecté.** C'est techniquement possible (voir
  `A-FAIRE.md`), et ça reviendrait à donner à un tiers un accès permanent à ses
  comptes. Tant que ce n'est pas tranché en connaissance de cause, on saisit à
  la main : ça prend dix secondes par mois.
- **Pas de performance inventée.** Un placement dont la valeur n'a jamais été
  relevée vaut ce qu'il a coûté.
- **Aucune lecture des dossiers de travail.** L'app ne va pas chercher les
  `A-FAIRE.md` de 89G : Samer écrit lui-même sa ligne du soir. C'est un choix,
  pris le 18/09/2026 — un chemin vers l'intérieur d'un autre projet tient tant
  que rien ne bouge, et casse au premier dossier renommé.
- **Pas d'horaires de prière calculés.** Il les connaît. Une app qui les
  calcule doit connaître la position, donc demander une autorisation, donc
  parler au réseau — pour remplacer ce qu'il sait déjà.

---

## Le choix technique, en une ligne chacun

- **Rien ne sort du téléphone.** Tout vit dans le stockage local de Safari.
- **Aucune dépendance.** Ni npm, ni bibliothèque, ni police téléchargée. Une
  app qu'on veut ouvrir dans trois ans ne doit rien attendre d'internet.
- **Le calcul est séparé de l'écran** (`1-SOURCE/logique.js`), parce qu'un
  chiffre faux dans une courbe ne se voit pas : il a l'air d'un chiffre. La
  seule parade est de pouvoir l'éprouver hors de l'écran.
- **Sombre**, parce qu'elle s'ouvre au Fajr avant le jour et le soir avant de
  dormir.
- **Le code de l'app de Petit Gâteau n'a pas été copié.** La règle du groupe
  dit qu'elle est la base des autres *apps de commerce* ; ici il n'y a ni
  commande, ni stock, ni client. C'est la **méthode** qui a été reprise, pas le
  code.

**La contrepartie du « rien ne sort », et elle est réelle** : vider les données
de Safari efface l'app. D'où la sauvegarde dans les réglages, et le rappel qui
s'affiche quand elle n'a jamais été faite.
