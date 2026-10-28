# Le Baliseur, site

Site statique de Le Baliseur (lebaliseur.fr), hébergé sur Cloudflare Pages.

## Structure

- `index.html` : page d'accueil
- `temoignages.html`, `mentions-legales.html`, `confidentialite.html`
- `assets/` : styles, polices auto-hébergées (Barlow, licence OFL), favicon, script du formulaire
- `functions/api/contact.js` : envoi du formulaire par Brevo (rien n'est stocké)
- `_headers`, `robots.txt`

## Déploiement Cloudflare Pages

- Framework preset : **None**
- Build command : *(vide)*
- Build output directory : `/`

Chaque push sur `main` redéploie le site.

## Formulaire

Dans Cloudflare Pages > Settings > Variables and Secrets :

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
