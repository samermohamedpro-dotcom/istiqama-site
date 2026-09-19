# Les rappels du jour — le dhikr et l'eau

Choisi par Samer le 18/09/2026 : **le dhikr toutes les heures, l'eau à huit
heures fixes**, tout par l'app *Raccourcis*, sans serveur et sans que rien ne
quitte le téléphone.

**Pourquoi Raccourcis et pas l'app** — vérifié le 18/09/2026 : une app web ne
peut pas programmer une notification locale sur iPhone, et **iOS n'a aucun
déclencheur « toutes les X minutes »**. Les automatisations ne partent qu'à des
heures fixes, une automatisation par heure. C'est pour ça qu'il y en a beaucoup
à créer, et c'est une fois pour toutes.

---

## Les 14 adhkâr

**En franco-arabe, à la demande de Samer** (18/09/2026). Écriture phonétique
française : `ch` pour ش, `dh` pour ذ, `kh` pour خ, `â/î/û` pour les voyelles
longues, `'` pour ع et ء.

**Ce que je garantis, et ce que je ne garantis pas.** Les n° 1 et 2 ont été
vérifiés directement à la source le 18/09/2026. Les autres viennent de recueils
très connus (*Hisn al-Muslim*, *Riyâd as-Sâlihîn*) mais n'ont pas été vérifiés
un par un. **Le n° 13 a une authenticité discutée** — Samer a choisi de le
garder. Je ne suis pas savant : cette liste se contrôle avec une vraie
référence.

| # | À dire | Source | Long ? |
|---|---|---|---|
| 1 | Subhâna-Llâhi wa bi-hamdih, subhâna-Llâhi-l-'Azîm | Bukhârî 6406 · Muslim 2694 — **vérifié** | court |
| 2 | Lâ ilâha illa-Llâhu wahdahu lâ charîka lah, lahu-l-mulku wa lahu-l-hamd, wa huwa 'alâ kulli chay'in qadîr | Bukhârî 3293 · Muslim 2691 — **vérifié** | moyen |
| 3 | Subhâna-Llâhi wa bi-hamdih | Bukhârî 6405 | court |
| 4 | Astaghfiru-Llâha wa atûbu ilayh | Bukhârî 6307 | court |
| 5 | Lâ hawla wa lâ quwwata illâ bi-Llâh | Bukhârî 6384 | court |
| 6 | Allâhumma salli 'alâ Muhammad wa 'alâ âli Muhammad | Muslim 408 | court |
| 7 | Subhâna-Llâh · Al-hamdu li-Llâh · Lâ ilâha illa-Llâh · Allâhu akbar | Muslim 2137 | court |
| 8 | Subhâna-Llâhi wa bi-hamdihi 'adada khalqih, wa ridâ nafsih, wa zinata 'archih, wa midâda kalimâtih | Muslim 2726 | moyen |
| 9 | *Sayyid al-istighfâr* — Allâhumma anta Rabbî, lâ ilâha illâ anta, khalaqtanî wa anâ 'abduk, wa anâ 'alâ 'ahdika wa wa'dika mâ-stata't. A'ûdhu bika min charri mâ sana't. Abû'u laka bi-ni'matika 'alayya, wa abû'u bi-dhanbî fa-ghfir lî, fa-innahu lâ yaghfiru-dh-dhunûba illâ anta | Bukhârî 6306 | **long** |
| 10 | Bismi-Llâhi-lladhî lâ yadurru ma'a ismihi chay'un fi-l-ardi wa lâ fi-s-samâ', wa huwa-s-Samî'u-l-'Alîm | Abû Dâwûd 5088 · Tirmidhî 3388 | moyen |
| 11 | Radîtu bi-Llâhi Rabban, wa bi-l-islâmi dînan, wa bi-Muhammadin nabiyyan | Abû Dâwûd 5072 | court |
| 12 | Yâ Hayyu yâ Qayyûm, bi-rahmatika astaghîth, aslih lî cha'nî kullah, wa lâ takilnî ilâ nafsî tarfata 'ayn | Nasâ'î — *hasan* | moyen |
| 13 | Hasbiya-Llâhu lâ ilâha illâ huwa, 'alayhi tawakkaltu wa huwa Rabbu-l-'archi-l-'azîm | Abû Dâwûd 5081 — **authenticité discutée** | moyen |
| 14 | Allâhumma a'innî 'alâ dhikrika wa chukrika wa husni 'ibâdatik | Abû Dâwûd 1522 — *sahîh* | court |

**Chaque dhikr a son heure** : le n° N tombe à l'heure N-1, puis douze heures
plus tard. Sur tes créneaux de 11 h à 23 h, cela donne les n° 12, 13, 14, puis
1 à 10.

**Le texte à coller** se récupère en deux gestes : Istiqama → *Réglages* →
*Le dhikr* → appui long dans la zone → Tout sélectionner → Copier. **24 lignes**,
une par heure. Elles sont construites depuis le même fichier que le tableau
ci-dessus, et un test compare les deux — elles ne peuvent pas diverger.

---

## Le raccourci « Dhikr » — à faire UNE fois

**Il ne tire plus au hasard.** Il prend **le dhikr de l'heure qu'il est** — donc
la notification et l'écran de l'app montrent toujours le même, sans que les deux
aient besoin de se parler. C'est pour ça que la liste fait **24 lignes** et non
14 : une par heure de la journée.

*Pourquoi 24 : Raccourcis sait lire « l'élément numéro N » d'une liste, mais pas
calculer un reste de division sans deux actions de plus. En dépliant la liste
sur les heures, il n'a qu'à prendre l'heure + 1.*

1. App **Raccourcis** → onglet **Raccourcis** → **+**
2. **Ajouter une action** → **Texte** → colle les **24 lignes**
   (Istiqama → *Réglages* → *Le dhikr* → appui long dans la zone → Tout
   sélectionner → Copier)
3. **+** → **Diviser le texte** → séparateur : **Nouvelles lignes**
4. **+** → **Date** (la date du moment)
5. **+** → **Formater la date** → *Format de date* : **Personnalisé** →
   format : **`H`** *(H majuscule : l'heure sur 24, sans zéro devant)*
6. **+** → **Calculer** → la date formatée **+ 1**
   *(Raccourcis compte les listes à partir de 1, les heures à partir de 0.)*
7. **+** → **Obtenir l'élément de la liste** → **Élément à l'index** = le
   résultat du calcul, dans la **liste** de l'étape 3
8. **+** → **Afficher la notification** → l'élément obtenu
9. Renomme-le **Dhikr** et enregistre.

**Vérifie-le tout de suite** : lance-le à la main, et compare avec ce qu'affiche
Istiqama sur l'écran du jour. **Les deux doivent dire la même chose.** Sinon,
c'est l'étape 5 ou 6 qui a un souci.

**Sur tes créneaux de 11 h à 23 h, treize adhkâr différents passent chaque
jour** — jamais deux fois le même dans la journée. Le quatorzième n'apparaît
qu'à 10 h : c'est le prix de la simplicité du raccourci, et c'est dit plutôt que
caché.

**L'app, elle, n'envoie AUCUNE notification** — choix du 19/09/2026. Elle en
envoyait une à chaque ouverture : cela faisait deux bannières coup sur coup au
moment du rappel d'eau (qui ouvre l'app), et une bannière affichée pendant qu'on
regarde l'app ne sert à rien puisque la carte du dhikr y est déjà, en entier.
**Tant que ce raccourci n'est pas installé, il n'y a donc aucun rappel de
dhikr.**

## Le raccourci « Eau » — à faire UNE fois

1. **+** → **Afficher la notification** → contenu : `Un verre d'eau`
2. **+** → **Ouvrir l'URL** → `https://samermohamedpro-dotcom.github.io/istiqama-site/`
3. Renomme-le **Eau** et enregistre.

L'app s'ouvre sur l'écran du jour, tu appuies sur **+** de *L'eau*, c'est coché.

---

## Les automatisations

Pour chacune : **Raccourcis** → onglet **Automatisation** → **+** →
*Créer une automatisation personnelle* → **Heure de la journée** → l'heure →
répétition **Quotidienne** → *Suivant* → **Exécuter le raccourci** → choisis
*Dhikr* ou *Eau*.

**Et à chaque fois, le réglage qui décide de tout** : mets **Exécuter
immédiatement** et coupe **Demander avant d'exécuter**. Sans ça il faut
confirmer chaque fois, et on arrête au bout de trois jours.

**Les heures suivent la journée de Samer, pas une journée moyenne** : réveil
vers **10 h 30**, coucher **après minuit** (dit par lui le 19/09/2026). Un
rappel qui part pendant qu'on dort est pire qu'un rappel absent : il apprend à
ignorer les notifications de l'app.

### Le dhikr — 13 automatisations, toutes sur *Dhikr*

```
11:00  12:00  13:00  14:00  15:00
16:00  17:00  18:00  19:00  20:00
21:00  22:00  23:00
```

**Tu peux commencer par cinq** (11:00, 14:00, 17:00, 20:00, 22:00) et en
ajouter si ça te va. Treize d'un coup, c'est vingt minutes de tapotage, et rien
ne dit que tu les voudras toutes.

### L'eau — 8 automatisations, toutes sur *Eau*

```
06:00  10:30  12:30  14:30
16:30  18:30  20:30  22:30
```

**Le premier au Fajr** (choisi par Samer le 19/09/2026) : on se lève déshydraté
après une nuit, et c'est le moment où il est déjà debout. Puis toutes les deux
heures à partir du réveil, et le dernier à 22 h 30 — assez tôt avant un coucher
après minuit pour ne pas le réveiller la nuit.

**Le 06:00 va dériver, et il faut le savoir.** L'heure du Fajr change toute
l'année : à Paris, autour de 4 h en juin et de 6 h 45 en décembre. Une
automatisation à heure fixe ne la suit pas. Deux façons de vivre avec :

- **la déplacer trois ou quatre fois dans l'année**, aux changements de saison ;
- **ou l'oublier** : Samer reçoit déjà l'athan de sa mosquée sur son téléphone.
  Il boit à ce moment-là et coche dans l'app quand il y passe. Le rappel n'est
  alors qu'un filet.

---

## Ce que ça ne fera pas, et il faut le savoir avant

- **Une automatisation « Heure de la journée » peut ne pas partir** si le
  téléphone n'a pas été touché depuis plusieurs heures. Ce n'est pas un réveil
  de précision.
- **Le raccourci « Eau » ouvre l'app**, et c'est voulu : tu coches ton verre
  d'un geste. Il n'y a plus de double bannière, puisque l'app ne notifie plus.
- **Il n'y aura pas de rappel toutes les 20 minutes.** iOS ne sait pas le faire,
  et une app web encore moins. Le seul chemin fiable serait une vraie app
  native, ou un serveur qui pousse — et ce dernier ferait sortir l'adresse de
  notification du téléphone (`A-FAIRE.md`).
- **Le vendredi reste un jour comme les autres pour les rappels.** Tranché par
  Samer le 19/09/2026 : « le vendredi non tu garde ». C'est une exception
  assumée à sa règle de méthode « vendredi est jour de repos » — cette règle-là
  vaut pour le travail, pas pour l'eau ni pour le dhikr.
