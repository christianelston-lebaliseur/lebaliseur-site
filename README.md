# Le Baliseur, site

Site de Le Baliseur (lebaliseur.fr), hébergé sur Cloudflare Workers (fichiers statiques + un petit Worker pour le formulaire).

## Structure

- `public/` : le site (index, pages services dans `services/`, FAQ, auto-diagnostic, mentions légales, confidentialité, version anglaise dans `en/`, `assets/`, `_headers`, `robots.txt`)
- `src/worker.js` : sert le site et envoie le formulaire par Brevo (rien n'est stocké)
- `wrangler.jsonc` : configuration Cloudflare

## Déploiement

Worker `lebaliseur-site` relié au dépôt GitHub. Build command : aucune. Deploy command : `npx wrangler deploy`.
Chaque push sur `main` redéploie le site. Adresse officielle : https://lebaliseur.fr ; www et lebaliseur.com redirigent (301) vers elle dans le Worker. Les adresses workers.dev ne sont jamais indexées.

## Formulaire

Dans le Worker > Settings > Variables and Secrets :

| Variable | Exemple |
| --- | --- |
| `BREVO_API_KEY` (Secret) | clé API Brevo |
| `MAIL_FROM` | adresse validée dans Brevo |
| `MAIL_TO` | chris@lebaliseur.fr |
| `TURNSTILE_SECRET` (Secret) | clé secrète Turnstile (la vérification s'active dès qu'elle existe) |

Sans ces variables, le formulaire affiche un message invitant à écrire par e-mail.

Quand un prospect laisse un e-mail, il reçoit automatiquement un accusé de réception (FR ou EN selon la page), envoyé depuis `MAIL_FROM`, réponse vers `MAIL_TO`. Rien n'est envoyé s'il ne laisse qu'un téléphone.

## Assistant IA (bulle de discussion)

- `public/assets/assistant.js` : la bulle et la fenêtre de discussion (FR/EN selon la page). La conversation reste dans le navigateur ; rien n'est enregistré côté serveur.
- `src/chat.js` : `POST /api/chat`, envoie la conversation à l'IA avec les consignes. Les informations sur l'agence viennent de `public/llms.txt` : le mettre à jour met l'assistant à jour.
- Accueil avec six boutons, gérés par le site (mêmes réponses à chaque fois, sans IA) : fiche Google (10 questions, score sur 100, 3 actions, offre selon le score), nouveau site (3 questions puis l'offre adaptée), visibilité dans les IA, test gratuit, tarifs, parler à Chris. Les textes et les points sont en tête de `assistant.js`.
- L'IA ne répond qu'aux questions écrites ; elle peut afficher le test pré-rempli, le rappel ou le menu.
- « Être rappelé » passe par le même envoi que le formulaire (`/api/contact`, Brevo).

**Test sans le montrer au public** : ouvrir n'importe quelle page avec `?chat=test` (un cookie garde la bulle 30 jours sur ce navigateur), `?chat=off` pour la retirer. Pour l'afficher à tous : variable `CHAT_PUBLIC` = `on` (réglée dans `wrangler.jsonc` depuis le 24/11/2026 ; mettre `off` pour la retirer).

| Variable | Rôle |
| --- | --- |
| `CHAT_PUBLIC` | `on` = bulle visible par tous les visiteurs |
| `AI_PROVIDER` | `workers-ai` (défaut, gratuit dans la limite quotidienne de Cloudflare) ou `claude` |
| `WORKERS_AI_MODEL` | facultatif, défaut `@cf/mistralai/mistral-small-3.1-24b-instruct` (secours automatique : Llama 3.3 70B puis Llama 3.1 8B ; la réponse de /api/chat indique le modèle utilisé) |
| `ANTHROPIC_API_KEY` (Secret) | clé API Claude, nécessaire si `AI_PROVIDER` = `claude` |
| `CLAUDE_MODEL` | facultatif, défaut `claude-haiku-5-5` |

Passer à Claude : acheter des crédits sur platform.claude.com (auto-reload désactivé = plafond de dépenses), créer une clé, l'ajouter en Secret `ANTHROPIC_API_KEY`, puis mettre `AI_PROVIDER` = `claude`. Rien d'autre à changer.

## Téléphone animé (accueil)

`public/assets/telephone-anime.js` : sur l'accueil FR et EN, « Votre entreprise » part 3e, gagne avis, photos et fiche complète, monte 1re, puis le badge tombe. Joue une fois quand le téléphone est visible. Sans JavaScript ou avec « réduire les animations », l'image finale s'affiche directement.

## Avant le lancement public

- Témoignages fictifs retirés (offre « 5 premiers clients » à la place). Remettre une page Témoignages dès 3 vrais avis ; signaler « client fondateur » sur ceux ayant eu la remise
- Témoignages : jamais de remise en échange d'un avis Google (interdit par les règles Google), seulement un témoignage sur ce site
- FAIT (30/10/2026) : site ouvert aux moteurs, `robots.txt` avec sitemap ; seuls les trois sites de démonstration dans `exemples/` restent non indexés
- Déclarer le site dans Google Search Console et Bing Webmaster Tools ; créer la fiche Google du Baliseur (zone desservie, adresse masquée), Bing Places et Apple Business Connect
- Contenu après lancement : une page par secteur (restaurants, hébergements, artisans, santé) puis un guide par mois ; jamais de pages par ville copiées-collées
- Adresse ajoutée ; SIREN ajouté (881 403 604) ; ajouter le SIRET complet (14 chiffres) quand l'avis de situation INSEE arrive ; remplacer la photo LinkedIn (250 px) par une photo nette plus grande
- Turnstile : widget « Le Baliseur formulaire » créé (clé publique dans `src/worker.js`) ; ajouter `TURNSTILE_SECRET` dans le Worker pour activer la vérification
- Vérifier le score sur pagespeed.web.dev (attendu : 99–100 dans les 4 catégories) puis l'afficher sur le site
- `outils/generer-pages.py` : génère les pages services et la FAQ (FR/EN) ; modifier les textes ici puis relancer
