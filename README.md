# homebridge-rte-tempo
Plugin Homebridge pour connaître la couleur du jour sur le tarif EDF Tempo.

Le plugin expose 3 détecteurs de mouvement dans HomeKit.
Chaque détecteur de mouvement correspond à une couleur (bleu, blanc ou rouge).
Lors de l'actualisation, le détecteur correspondant à la couleur du jour s'activera.

Il est alors possible de créer des automatisations pour réagir à la couleur du jour (réglage du chauffage, pompe de piscine, éclairage, etc.).

## Configuration
Fréquence d'actualisation : 
 - Une fois par jours (S'actualise une fois par jours pendant la nuit.)
 - Toutes les heures

## Librairies
[Homebridge](https://homebridge.io)

[API Tempo](https://www.api-couleur-tempo.fr)
