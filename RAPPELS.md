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

**Le texte à coller** dans Raccourcis se récupère en deux gestes :
Istiqama → *Réglages* → *Les rappels* → **Copier les 14 adhkâr**. Une ligne par
dhikr, dans l'ordre du tableau. C'est la même liste, construite depuis le même
fichier — elle ne peut pas diverger.

---

## Le raccourci « Dhikr » — à faire UNE fois

Il tire un dhikr au hasard dans la liste et l'affiche. Quatre actions.

1. App **Raccourcis** → onglet **Raccourcis** → **+** (en haut à droite)
2. **Ajouter une action** → cherche **Texte** → colle les 14 lignes
   (copiées depuis Istiqama)
3. **+** → cherche **Diviser le texte** → séparateur : **Nouvelles lignes**
4. **+** → cherche **Obtenir l'élément de la liste** → choisis **Élément
   aléatoire**
5. **+** → cherche **Afficher la notification** → mets l'élément obtenu comme
   contenu
6. Renomme-le **Dhikr** et enregistre.

*Les noms d'actions peuvent varier légèrement selon la version d'iOS. Si tu ne
trouves pas « Diviser le texte », cherche « texte » et regarde la liste.*

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

### Le dhikr — 15 automatisations, toutes sur *Dhikr*

```
07:00  08:00  09:00  10:00  11:00
12:00  13:00  14:00  15:00  16:00
17:00  18:00  19:00  20:00  21:00
```

**Tu peux commencer par cinq** (08:00, 11:00, 14:00, 17:00, 20:00) et en
ajouter si ça te va. Quinze d'un coup, c'est vingt minutes de tapotage, et rien
ne dit que tu les voudras toutes.

### L'eau — 8 automatisations, toutes sur *Eau*

```
06:30  08:30  10:30  12:30
14:30  16:30  18:30  20:30
```

Décalées des repas, et rien après 21 h.

---

## Ce que ça ne fera pas, et il faut le savoir avant

- **Une automatisation « Heure de la journée » peut ne pas partir** si le
  téléphone n'a pas été touché depuis plusieurs heures. Ce n'est pas un réveil
  de précision.
- **Il n'y aura pas de rappel toutes les 20 minutes.** iOS ne sait pas le faire,
  et une app web encore moins. Le seul chemin fiable serait une vraie app
  native, ou un serveur qui pousse — et ce dernier ferait sortir l'adresse de
  notification du téléphone (`A-FAIRE.md`).
- **Le vendredi n'est pas traité à part.** Si tu veux que les rappels se taisent
  ce jour-là, dis-le : ça se fait dans le raccourci, pas dans l'app.
