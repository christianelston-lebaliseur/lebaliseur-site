# Le Baliseur, site

Site de Le Baliseur (lebaliseur.fr), hébergé sur Cloudflare Workers (fichiers statiques + un petit Worker pour le formulaire).

## Structure

- `public/` : le site (index, témoignages, mentions légales, confidentialité, `assets/`, `_headers`, `robots.txt`)
- `src/worker.js` : sert le site et envoie le formulaire par Brevo (rien n'est stocké)
- `wrangler.jsonc` : configuration Cloudflare

## Déploiement

Worker `lebaliseur-site` relié au dépôt GitHub. Build command : aucune. Deploy command : `npx wrangler deploy`.
Chaque push sur `main` redéploie le site.

## Formulaire

Dans le Worker > Settings > Variables and Secrets :

| Variable | Exemple |
| --- | --- |
| `BREVO_API_KEY` (Secret) | clé API Brevo |
| `MAIL_FROM` | adresse validée dans Brevo |
| `MAIL_TO` | chris@lebaliseur.fr |

Sans ces variables, le formulaire affiche un message invitant à écrire par e-mail.

## Avant le lancement public

- Remplacer les témoignages fictifs par de vrais avis et retirer la mention « démo »
- Retirer `noindex` des pages et ouvrir `robots.txt`, ajouter un sitemap
- Compléter SIRET, adresse et photo
- Ajouter Turnstile au formulaire
- Vérifier le score sur pagespeed.web.dev (attendu : 99–100 dans les 4 catégories) puis l'afficher sur le site
