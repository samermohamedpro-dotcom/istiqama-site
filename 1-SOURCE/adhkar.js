// Les adhkâr, et LEUR SEUL ENDROIT.
//
// `RAPPELS.md` les montre dans un tableau, avec les sources et le mode d'emploi
// des Raccourcis. C'est une deuxième copie, et deux copies finissent toujours
// par diverger — donc `tests.mjs` COMPARE les deux, ligne par ligne, et crie si
// elles s'écartent. C'est la règle « quand une valeur doit exister à deux
// endroits, écris un test qui compare les deux ».
//
// En franco-arabe, demandé par Samer le 18/09/2026 : « je les veux en
// franco-arabe pas l'arabe écriture ». Écriture phonétique française —
// `ch` pour ش, `dh` pour ذ, `kh` pour خ, `â/î/û` pour les voyelles longues,
// `'` pour ع et ء.
//
// CE QUI EST GARANTI ET CE QUI NE L'EST PAS : les n° 1 et 2 ont été vérifiés
// directement à la source le 18/09/2026. Les autres viennent de recueils très
// connus (Hisn al-Muslim, Riyâd as-Sâlihîn) sans vérification une par une. Le
// n° 13 a une authenticité discutée, et Samer a choisi de le garder. Rien ici
// ne remplace un contrôle avec une vraie référence.

export const ADHKAR = [
  { texte: "Subhâna-Llâhi wa bi-hamdih, subhâna-Llâhi-l-'Azîm",
    source: 'Bukhârî 6406 · Muslim 2694', verifie: true, taille: 'court' },

  { texte: "Lâ ilâha illa-Llâhu wahdahu lâ charîka lah, lahu-l-mulku wa lahu-l-hamd, wa huwa 'alâ kulli chay'in qadîr",
    source: 'Bukhârî 3293 · Muslim 2691', verifie: true, taille: 'moyen' },

  { texte: 'Subhâna-Llâhi wa bi-hamdih',
    source: 'Bukhârî 6405', taille: 'court' },

  { texte: 'Astaghfiru-Llâha wa atûbu ilayh',
    source: 'Bukhârî 6307', taille: 'court' },

  { texte: 'Lâ hawla wa lâ quwwata illâ bi-Llâh',
    source: 'Bukhârî 6384', taille: 'court' },

  { texte: "Allâhumma salli 'alâ Muhammad wa 'alâ âli Muhammad",
    source: 'Muslim 408', taille: 'court' },

  { texte: 'Subhâna-Llâh · Al-hamdu li-Llâh · Lâ ilâha illa-Llâh · Allâhu akbar',
    source: 'Muslim 2137', taille: 'court' },

  { texte: "Subhâna-Llâhi wa bi-hamdihi 'adada khalqih, wa ridâ nafsih, wa zinata 'archih, wa midâda kalimâtih",
    source: 'Muslim 2726', taille: 'moyen' },

  { texte: "Allâhumma anta Rabbî, lâ ilâha illâ anta, khalaqtanî wa anâ 'abduk, wa anâ 'alâ 'ahdika wa wa'dika mâ-stata't. A'ûdhu bika min charri mâ sana't. Abû'u laka bi-ni'matika 'alayya, wa abû'u bi-dhanbî fa-ghfir lî, fa-innahu lâ yaghfiru-dh-dhunûba illâ anta",
    source: 'Bukhârî 6306', taille: 'long', nom: "Sayyid al-istighfâr" },

  { texte: "Bismi-Llâhi-lladhî lâ yadurru ma'a ismihi chay'un fi-l-ardi wa lâ fi-s-samâ', wa huwa-s-Samî'u-l-'Alîm",
    source: 'Abû Dâwûd 5088 · Tirmidhî 3388', taille: 'moyen' },

  { texte: 'Radîtu bi-Llâhi Rabban, wa bi-l-islâmi dînan, wa bi-Muhammadin nabiyyan',
    source: 'Abû Dâwûd 5072', taille: 'court' },

  { texte: "Yâ Hayyu yâ Qayyûm, bi-rahmatika astaghîth, aslih lî cha'nî kullah, wa lâ takilnî ilâ nafsî tarfata 'ayn",
    source: 'Nasâ’î — hasan', taille: 'moyen' },

  { texte: "Hasbiya-Llâhu lâ ilâha illâ huwa, 'alayhi tawakkaltu wa huwa Rabbu-l-'archi-l-'azîm",
    source: 'Abû Dâwûd 5081', taille: 'moyen', discute: true },

  { texte: "Allâhumma a'innî 'alâ dhikrika wa chukrika wa husni 'ibâdatik",
    source: 'Abû Dâwûd 1522 — sahîh', taille: 'court' },
];

// Ce qui se colle dans l'action « Texte » du raccourci : une ligne par dhikr,
// rien d'autre. Pas de numéro, pas de source — le raccourci tire une ligne au
// hasard et l'affiche telle quelle, donc chaque caractère en trop se retrouve
// dans la notification.
export function texteACollerDansRaccourcis(liste = ADHKAR) {
  return liste.map((d) => d.texte).join('\n');
}
