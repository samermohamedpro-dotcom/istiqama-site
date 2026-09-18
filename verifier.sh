#!/bin/bash
# Le contrôle complet d'Istiqama. Rien ne se livre sans l'avoir VU passer.
set -e
cd "$(dirname "$0")"

echo "── Les tests du calcul ──"
node --test tests.mjs

echo
echo "── La construction ──"
node construire.mjs

# Le construit est refait juste au-dessus, donc il ne PEUT pas être en retard.
# Ce contrôle sert à autre chose : attraper un fichier source que la
# construction ne copie pas. Le jour où un module est ajouté à 1-SOURCE/ et
# oublié dans construire.mjs, l'app perdrait une fonction en silence — la page
# s'afficherait, et un import échouerait au premier geste.
echo
echo "── Tout ce qui est dans 1-SOURCE/ est-il bien construit ? ──"
manque=0
for f in 1-SOURCE/*; do
  nom=$(basename "$f")
  if [ ! -f "docs/$nom" ]; then
    echo "  MANQUE : $nom n'est pas copié par construire.mjs"
    manque=1
  fi
done
[ "$manque" -eq 0 ] && echo "  tous copiés."

# Une donnée réelle qui partirait dans un dépôt ne se rattrape pas : un dépôt
# se clone, se restaure, se partage. Le .gitignore la refuse déjà ; ceci
# attrape le cas où un fichier de sauvegarde traîne à la racine.
echo
echo "── Aucune sauvegarde personnelle qui traîne ? ──"
if ls istiqama-*.json >/dev/null 2>&1; then
  echo "  ATTENTION : une sauvegarde est posée ici. Elle contient des données réelles."
  echo "  Le .gitignore la tient hors de git, mais range-la ailleurs (iCloud)."
  exit 1
fi
echo "  aucune."

echo
if [ "$manque" -eq 0 ]; then
  echo "Tout est vert."
else
  echo "ROUGE : $manque fichier(s) de 1-SOURCE/ ne sont pas construits."
fi
exit $manque
