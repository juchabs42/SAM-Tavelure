SAM TAVELURE — PAGE UNIQUE
==========================

CONTENU
-------
- index.html       : page publique dédiée uniquement à la tavelure
- style.css        : style de la page, calé sur la couleur du logo SudExpé
- app.js           : données de démonstration et logique du graphique
- logo-sudexpe.jpg : logo utilisé dans l'en-tête

CE QUI A ÉTÉ FAIT
-----------------
- extraction de la partie tavelure pour en faire une page unique ;
- retrait de toute la partie piégeages ravageurs ;
- ajout du logo fourni ;
- titre principal : "SAM Tavelure" ;
- suivi des 7 stades des périthèces ;
- calcul du biofix J0 à partir de la première date du stade 7 ;
- graphique pluie + spores :
  * pluie en histogramme bleu ;
  * spores en courbe rouge ;
- affichage possible :
  * par tranche horaire ;
  * ou par épisode ;
- choix de la date de début et de fin ;
- export CSV des données affichées dans le graphique ;
- indication explicite si le comptage est terminé ou non ;
- indication explicite si le suivi des projections est terminé.

IMPORTANT SUR LA SAISIE ADMIN / PRODUCTEURS
-------------------------------------------
La page fournie ici est volontairement en lecture seule.

Pourquoi ?
Parce qu'avec une simple page HTML/JS publique (par exemple sur GitHub Pages),
si on met directement un formulaire de saisie dessus, il n'est pas possible de
protéger sérieusement l'écriture. Un producteur pourrait potentiellement le voir
ou le détourner.

SOLUTION LA PLUS SIMPLE ET RÉALISTE
-----------------------------------
Option 1 — Google Sheet + page publique
1. Tu saisis les contaminations dans un Google Sheet.
2. Toi seul (et éventuellement 1 ou 2 techniciens) avez les droits d'édition.
3. La page SAM Tavelure lit les données depuis ce tableur exporté en CSV ou JSON.
4. Les producteurs voient la page mais ne peuvent rien modifier.

Avantages :
- très simple à mettre en place ;
- pas besoin de développer un vrai back-end au départ ;
- facile pour corriger ou compléter les données.

Option 2 — Supabase / base de données avec compte admin
1. Tu crées une table pour les stades et une table pour les contaminations.
2. Tu te connectes avec un compte administrateur.
3. La page publique lit uniquement les données validées.
4. Les producteurs n'ont aucun droit d'écriture.

Avantages :
- plus propre à long terme ;
- plusieurs utilisateurs techniques possibles ;
- historique centralisé.

MISE EN LIGNE
-------------
Sur GitHub Pages, place à la racine du dépôt :
- index.html
- style.css
- app.js
- logo-sudexpe.jpg

Puis active Pages sur la branche principale.

MODIFIER LES DONNÉES DE DÉMONSTRATION
-------------------------------------
Dans app.js :
- STAGE_DEFINITIONS : dates des stades 1 à 7 ;
- MONITORING        : état de fin de suivi ;
- SPORE_RECORDS     : comptages horaires / épisodes.

PROCHAINE ÉTAPE POSSIBLE
------------------------
Si tu veux, l'étape suivante peut être :
- version publique + admin connectée à Google Sheet ;
- ou version publique + admin connectée à Supabase.
