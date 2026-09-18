# Istiqama — à lire avant de toucher à quoi que ce soit

Istiqama est l'application personnelle de Samer : ce qu'il tient chaque jour,
ce que ça donne au bout de trente, et où il en est de son objectif d'argent.
Elle s'ouvre **le matin et le soir**, sur son iPhone, et rien d'autre.

**Elle n'appartient à aucune entreprise.** Elle vit exprès **hors de `89G/` :
elle porte sa pratique religieuse, sa santé et ses finances personnelles, et
89G est le nom d'une future holding dont les dépôts seront un jour regardés par
un comptable, une banque, peut-être un associé. Une fois dans l'historique
d'un dépôt, ces données n'en ressortent plus.

Ce fichier est court exprès : il aiguille, il ne répète rien.

---

## Les deux règles qui ne se discutent pas

1. **Rien ne sort du téléphone.** Aucun compte, aucun serveur, aucune requête
   réseau, aucun outil de mesure d'audience. Le jour où une fonctionnalité
   demande d'envoyer quelque chose quelque part, elle se discute d'abord, elle
   ne s'ajoute pas.

2. **Aucune donnée réelle ne sort de l'app.** Ni dans un dépôt, ni dans une
   capture d'écran, ni dans un exemple de documentation. Pour montrer un écran,
   on fabrique des journées (c'est ce qui a été fait le 18/09/2026, puis
   effacé). Le `.gitignore` refuse déjà les fichiers `istiqama-*.json`, mais un
   `.gitignore` ne protège pas d'un copier-coller.

Le reste — les tests, une seule copie de chaque chose, jamais de commit sans
demander, écrire chaque décision le jour même — est dans la compétence
`facon-de-travailler`, qui vaut pour tous les projets de Samer. **On ne la
redit pas ici.**

---

## Ce que l'app fait, et d'où ça vient

Quatre mécanismes, chacun emprunté à un livre et chacun visible à l'écran. Le
pourquoi de chacun est dans `README.md` ; ici, juste de quoi ne pas les casser
par erreur :

| Le mécanisme | Où il vit | Ce qui le casserait |
|---|---|---|
| **la chaîne** | `chaineEnCours` | la faire repartir de zéro chaque matin |
| **jamais deux fois de suite** | `enDanger` | l'afficher tous les jours : elle deviendrait un décor |
| **la courbe du cumul** | `courbeCumul` | montrer un score du jour à la place |
| **la chose du jour** | écran *Aujourd'hui* | en autoriser plusieurs |

---

## Où est quoi

| Pour savoir… | Lire |
|---|---|
| **pourquoi l'app est faite ainsi, et ce qu'elle refuse de faire** | `README.md` |
| où est chaque fichier, et dans quel état | `LISEZ-MOI-DABORD.md` |
| ce qui a été décidé, daté | `JOURNAL.md` |
| ce qui reste à faire, en ordre | `A-FAIRE.md` |

---

## Les commandes

```bash
cd ~/Projets/ISTIQAMA

node --test tests.mjs     # le calcul, 28 tests. Rien ne se livre sans les avoir VUS passer.
node construire.mjs       # refait docs/ (effacé puis reconstruit à chaque fois)
node servir.mjs           # puis http://localhost:8123
bash verifier.sh          # les deux premiers, plus le contrôle que le construit n'est pas en retard

# mettre à jour ce qui est en ligne — dans cet ordre, le dépôt refuse le non commité
bash verifier.sh          # rien ne part sans avoir VU les tests passer
git add -A && git commit  # jamais sans le demander à Samer
git push                  # GitHub Pages resert docs/ tout seul, en deux à trois minutes
```

**Un seul dépôt, et il est PUBLIC** : `istiqama-site`
(`samermohamedpro-dotcom.github.io/istiqama-site/`). Il porte la source, les
documents et le journal. Les données de l'app n'y entrent jamais — elles ne
quittent pas le téléphone, et le `.gitignore` refuse tout `istiqama-*.json`.
La liste des huit dépôts de Samer vit dans `depots-github.md`, à côté de la
compétence `facon-de-travailler` — **une seule fois**, et c'est là-bas.

**`docs/` est effacé à chaque construction.** Tout ce qui doit y
survivre est *produit* par `construire.mjs` — l'icône, le manifeste, la page.
Un fichier posé à la main dedans disparaîtra, et personne ne saura pourquoi.

**Il n'y a aucune dépendance** : ni `npm install`, ni `node_modules`, ni
bibliothèque. C'est voulu — une app qu'on veut encore pouvoir ouvrir dans trois
ans ne doit rien attendre d'internet.
