# SAM Tavelure V5

## Fonctionnement

### Sans connexion
Le visiteur peut uniquement consulter :
- les stades des périthèces ;
- le graphique spores + pluie ;
- l'historique des comptages.

Aucun formulaire de création de compte n'est présent dans la page.

### Après connexion
Un utilisateur dont le compte a été créé manuellement dans Supabase peut :
- renseigner ou modifier les dates des stades 1 à 7 ;
- ajouter un épisode de tavelure ;
- indiquer si le suivi des projections est terminé.

## Important : aucune donnée fictive
Cette version ne contient aucune date de périthèce et aucun comptage de démonstration.

Le fichier `supabase.sql` crée les 7 lignes des stades avec `date_obs = NULL`.
Il remet aussi les dates de ces 7 stades à NULL lors de son exécution.

Il ne supprime pas automatiquement d'éventuels anciens comptages présents dans `tavelure_comptages`.
Si tu veux repartir avec un historique totalement vide, exécute séparément :

```sql
truncate table public.tavelure_comptages restart identity;
```

## Configuration Supabase
1. Exécuter `supabase.sql` dans Supabase > SQL Editor.
2. Dans Authentication, désactiver les inscriptions publiques / sign up.
3. Créer les utilisateurs manuellement depuis Authentication > Users.
4. Copier Project URL + Publishable key dans `config.js`.

```js
window.SAM_CONFIG = {
  supabaseUrl: "https://xxxx.supabase.co",
  supabaseAnonKey: "sb_publishable_xxxx",
  countsTable: "tavelure_comptages",
  stagesTable: "tavelure_peritheces",
  settingsTable: "tavelure_parametres"
};
```

Ne jamais mettre une `service_role` ou une `secret key` dans `config.js`.

## GitHub Pages
Tous les fichiers du ZIP doivent être à la racine du dépôt :
- `index.html`
- `style.css`
- `app.js`
- `config.js`
- `supabase.sql`
- `logo-sudexpe-trimmed.png`
- `favicon.png`
- `.nojekyll`

## Icône dans l’onglet du navigateur
La V6 contient les favicons issus du logo SAM Tavelure :
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`
- `icon-192.png`
- `icon-512.png`
- `site.webmanifest`

Tous ces fichiers doivent rester à la racine du dépôt GitHub avec `index.html`.
Après mise à jour, le navigateur peut conserver l’ancienne icône en cache : faire `Ctrl + F5` ou vider le cache du site.
