# homebridge-rte-tempo
Plugin Homebridge pour connaitre la couleur du jour sur le tarif EDF Tempo

Le plugin expose 3 motion detector dans Homekit.
Chaque motion detector correspond à une couleur (bleu, blanc ou rouge).
Lors de l'actualisation, l'un des detecteur correspondant à la couleur du jour s'activera.

Il est alors possible de crééer des automatisations pour réagir à la couleur du jours (réglage du chauffage, pompe de piscine, éclairage...)

## Configuration
Fréquence d'actualisation : 
 - Une fois par jours (S'actualise une fois par jours pendant la nuit.)
 - Toutes les heures

## Librairies
[Homebridge](https://homebridge.io)

[API Tempo](https://www.api-couleur-tempo.fr)
