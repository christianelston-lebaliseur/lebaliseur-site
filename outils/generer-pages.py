#!/usr/bin/env python3
# Génère les pages services + FAQ (FR/EN) du site Le Baliseur à partir de l'en-tête/pied existants.
import json, re, os, html
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
SITE = 'https://lebaliseur.fr'

def gabarit(path):
    s = open(os.path.join(ROOT, path)).read()
    head = s[:s.index('<title>')]
    preload = s[s.index('<link rel="icon"'):s.index('</head>')]
    body = s[s.index('<body>'):s.index('<main id="contenu">')]
    foot = s[s.index('</main>') + 7:]
    return head, preload, body, foot

FR = gabarit('mentions-legales.html')
EN = gabarit('en/legal-notice.html')

def nav_fix(body, lang, other_url, current):
    # menu : ajoute Services et FAQ, met la page courante en évidence, bascule de langue vers l'équivalent
    if lang == 'fr':
        body = body.replace('<a href="/#offres">Offres</a>', '<a href="/services/">Services</a>')
        if '>FAQ</a>' not in body:
            body = body.replace('<a href="/#apropos">À propos</a>', '<a href="/#apropos">À propos</a>\n<a href="/faq">FAQ</a>')
    else:
        body = body.replace('<a href="/en/#pricing">Pricing</a>', '<a href="/en/services/">Services</a>')
        if '>FAQ</a>' not in body:
            body = body.replace('<a href="/en/#about">About</a>', '<a href="/en/#about">About</a>\n<a href="/en/faq">FAQ</a>')
    body = re.sub(r'(<a class="langue" href=")[^"]+(")', lambda m: m.group(1) + other_url + m.group(2), body)
    if current:
        body = body.replace(f'<a href="{current}">', f'<a href="{current}" aria-current="page">', 1)
    return body

def foot_fix(foot, other_url):
    return re.sub(r'(<a class="en" href=")[^"]+(")', lambda m: m.group(1) + other_url + m.group(2), foot)

def page(lang, url, other, title, desc, main, schema, current=None):
    head, pre, body, foot = FR if lang == 'fr' else EN
    fr_url, en_url = (url, other) if lang == 'fr' else (other, url)
    alt = (f'<link rel="canonical" href="{SITE}{url}">\n'
           f'<link rel="alternate" hreflang="fr" href="{SITE}{fr_url}">\n'
           f'<link rel="alternate" hreflang="en" href="{SITE}{en_url}">\n')
    ld = ''.join(f'<script type="application/ld+json">\n{json.dumps(x, ensure_ascii=False, indent=1)}\n</script>\n' for x in schema)
    out = (head + f'<title>{title}</title>\n<meta name="description" content="{html.escape(desc, quote=True)}">\n'
           '<meta name="robots" content="noindex, nofollow">\n' + pre + alt + ld + '</head>\n'
           + nav_fix(body, lang, other, current) + '<main id="contenu">\n' + main + '\n</main>\n' + foot_fix(foot, other))
    p = os.path.join(ROOT, url.strip('/'))
    p = p + '.html' if not url.endswith('/') else os.path.join(p, 'index.html')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w').write(out)
    return p

PROVIDER = {"@type": "ProfessionalService", "name": "Le Baliseur", "url": SITE + "/"}
AREA = [{"@type": "City", "name": "Annecy"}, {"@type": "AdministrativeArea", "name": "Haute-Savoie"}]

def fil(lang, items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (n, u) in enumerate(items)]}

def esc(t):  # espaces insécables français devant : ; ? !
    return re.sub(r' ([:;?!»])', r'&nbsp;\1', t).replace('« ', '«&nbsp;')

def ul(items):
    return '<ul class="liste-balise">\n' + '\n'.join(f'<li>{esc(i)}</li>' for i in items) + '\n</ul>'

def etapes(items):
    return '<ol class="etapes">\n' + '\n'.join(f'<li><strong>{esc(t)}</strong><span>{esc(d)}</span></li>' for t, d in items) + '\n</ol>'

def service_main(lang, d):
    T = {'fr': ('Ce qui est compris', 'Pour qui', 'Comment ça se passe', 'Le prix', 'Demander mon diagnostic offert', 'Tous les services', 'Questions fréquentes', 'Voir toutes les questions'),
         'en': ("What's included", "Who it's for", 'How it works', 'The price', 'Get my free audit', 'All services', 'Common questions', 'See all questions')}[lang]
    audit = '/#diagnostic' if lang == 'fr' else '/en/#audit'
    faq = '/faq' if lang == 'fr' else '/en/faq'
    services = '/services/' if lang == 'fr' else '/en/services/'
    qa = ''.join(f'<details class="qr"><summary>{esc(q)}</summary><p>{esc(a)}</p></details>\n' for q, a in d['faq'])
    return f'''<section class="conteneur page-service">
<nav class="fil" aria-label="{'Fil d’Ariane' if lang=='fr' else 'Breadcrumb'}"><a href="{services}">{T[5]}</a> <span aria-hidden="true">›</span> <span>{d['court']}</span></nav>
<div class="service-tete">
<div class="service-intro">
<h1 class="titre-1">{esc(d['h1'])}</h1>
<p class="accroche">{esc(d['accroche'])}</p>
<p class="chapo">{esc(d['chapo'])}</p>
<a class="bouton bouton-sombre" href="{audit}">{T[4]}</a>
</div>
<aside class="prix-encart" aria-label="{T[3]}">
<p class="prix-titre">{T[3]}</p>
<p class="prix-montant">{d['prix']}</p>
<p class="prix-detail">{esc(d['prix_detail'])}</p>
</aside>
</div>
<div class="service-corps">
<div>
<h2 class="titre-3">{T[0]}</h2>
{ul(d['inclus'])}
</div>
<div>
<h2 class="titre-3">{T[1]}</h2>
{ul(d['pour_qui'])}
</div>
</div>
<h2 class="titre-3">{T[2]}</h2>
{etapes(d['etapes'])}
{d.get('extra','')}
<h2 class="titre-3">{T[6]}</h2>
<div class="qrs">
{qa}</div>
<p><a class="lien-fleche" href="{faq}">{T[7]} →</a></p>
</section>'''

# ---------------------------------------------------------------- contenus
SERV = {
'google': {
 'fr': dict(url='/services/fiche-google-ia', court='Visibilité Google & IA',
   title='Fiche Google et visibilité dans les IA à Annecy · Le Baliseur',
   desc="Fiche Google complète, Bing et Apple Plans, annuaires harmonisés : soyez trouvé sur la carte Google et cité par ChatGPT et Gemini. 290 €, à Annecy et en Haute-Savoie.",
   h1='Visibilité Google & IA', accroche='Être sur la carte quand on vous cherche, et cité quand on demande à une IA.',
   chapo="Pour la plupart des commerces et indépendants, la fiche Google compte plus que le site. C'est elle qui apparaît sur la carte, avec vos horaires, vos photos et vos avis. Les IA comme ChatGPT, Gemini ou le mode IA de Google s'appuient sur les mêmes informations pour choisir qui citer.",
   prix='290 €', prix_detail="Prix unique, une seule fois. Prêt en une semaine environ. TVA non applicable, art. 293 B du CGI.",
   inclus=["Fiche Google Business Profile revendiquée, complétée et optimisée : catégories, services, description, horaires, zone desservie", "Photos sélectionnées et légendées, la vue ou la vitrine en premier", "Fiches Bing Places et Apple Plans, que consultent d'autres moteurs et assistants IA", "Mêmes nom, adresse et téléphone dans les principaux annuaires (PagesJaunes et autres)", "Un lien simple pour demander des avis à vos clients, et un modèle de réponse aux avis", "Un état des lieux avant / après pour mesurer les progrès"],
   pour_qui=["Restaurants, cafés et commerces de proximité", "Chambres d'hôtes, gîtes et hébergements", "Artisans et dépanneurs qui travaillent sur une zone", "Professions de santé et de bien-être", "Toute entreprise absente de la carte, ou avec une fiche incomplète"],
   etapes=[("Diagnostic offert", "Je compare votre présence à celle de trois concurrents, sur Google et dans les IA, puis je viens vous le présenter."), ("Accès à votre fiche", "Vous me donnez accès en tant que gestionnaire : vous restez propriétaire."), ("Mise au point", "Fiche, photos, annuaires et fiches Bing et Apple, en une semaine environ."), ("Bilan", "Je vous montre ce qui a changé et ce qu'il faut entretenir.")],
   faq=[("Faut-il un site pour être sur Google ?", "Non. Une fiche Google bien tenue suffit souvent pour commencer. Le site devient utile pour convaincre et pour les recherches plus détaillées."), ("Pouvez-vous garantir la première place ?", "Non, et personne ne peut le promettre honnêtement. Je travaille sur les signaux que Google et les IA utilisent : une fiche complète, des informations cohérentes, des avis récents.")]),
 'en': dict(url='/en/services/google-ai-visibility', court='Google & AI visibility',
   title='Google Business Profile and AI visibility in Annecy · Le Baliseur',
   desc='A complete Google profile, Bing and Apple Maps listings and consistent directories: be found on the Google map and named by ChatGPT and Gemini. €290, in Annecy and Haute-Savoie.',
   h1='Google & AI visibility', accroche='On the map when people search for you, and named when they ask an AI.',
   chapo="For most shops and independents, the Google profile matters more than the website. It's what appears on the map, with your hours, photos and reviews. AI tools such as ChatGPT, Gemini and Google's AI Mode rely on the same information to decide who to name.",
   prix='€290', prix_detail='One-off price. Ready in about a week. VAT not applicable, art. 293 B of the French tax code.',
   inclus=["Google Business Profile claimed, completed and optimised: categories, services, description, hours, service area", "Selected, captioned photos, with the view or shopfront first", "Bing Places and Apple Maps listings, used by other search engines and AI assistants", "The same name, address and phone number across the main directories", "A simple link to ask customers for reviews, and a template for replying to them", "A before-and-after snapshot to measure progress"],
   pour_qui=["Restaurants, cafés and local shops", "B&Bs, gîtes and holiday lets", "Tradespeople who cover an area", "Health and wellbeing practitioners", "Any business missing from the map, or with an incomplete profile"],
   etapes=[("Free audit", "I compare your presence with three competitors, on Google and in AI answers, then come and talk you through it."), ("Access to your profile", "You add me as a manager: you stay the owner."), ("The work", "Profile, photos, directories, Bing and Apple listings, in about a week."), ("Review", "I show you what changed and what needs keeping up.")],
   faq=[("Do I need a website to be on Google?", "No. A well-kept Google profile is often enough to start. A website helps convince people and covers more detailed searches."), ("Can you guarantee first place?", "No, and nobody can honestly promise it. I work on the signals Google and AI tools use: a complete profile, consistent details and recent reviews.")]),
},
'site': {
 'fr': dict(url='/services/site-vitrine', court='Site vitrine',
   title='Création de site vitrine à Annecy, rapide et bilingue · Le Baliseur',
   desc="Un site vitrine rapide, lisible sur téléphone, pensé pour Google et les IA, en français et en anglais. Dès 890 €, fiche Google incluse. Annecy et Haute-Savoie.",
   h1='Site vitrine', accroche='Un site qui convainc, et que Google comprend.',
   chapo="Un bon site ne cherche pas à impressionner : il répond vite aux questions du client (quoi, où, combien, comment réserver) et lui donne envie de vous appeler. Il se charge en un instant sur téléphone, et il est construit pour être bien lu par Google et par les IA.",
   prix='dès 890 €', prix_detail="Jusqu'à 1 490 € selon le nombre de pages et les fonctions. Version anglaise +300 €. Fiche Google & IA incluse. Prêt en trois semaines environ.",
   inclus=["Jusqu'à 5 pages à 890 € (accueil, services, à propos, contact…), davantage jusqu'à 1 490 €", "Textes rédigés ou retravaillés avec vous, photos mises en valeur", "Rapide et lisible sur téléphone, testé sur l'outil de qualité de Google", "Données structurées pour que Google et les IA comprennent qui vous êtes, où et à quel prix", "Formulaire de contact ou lien de réservation, sans cookies publicitaires", "Le pack Visibilité Google & IA (290 €) inclus", "Nom de domaine et comptes à votre nom : le site vous appartient"],
   pour_qui=["Les entreprises sans site, ou avec un site daté ou lent", "Les hébergements qui veulent plus de réservations en direct", "Les commerces qui veulent afficher leurs prix, menus ou horaires clairement", "Les activités qui reçoivent des clients étrangers (option anglaise)"],
   etapes=[("Diagnostic offert", "Je regarde si le site est vraiment votre problème. Parfois, la fiche Google suffit."), ("Maquette", "Vous voyez le site avant qu'il soit construit, et on l'ajuste ensemble."), ("Construction", "Textes, photos, pages et réglages pour Google, en trois semaines environ."), ("Mise en ligne", "Vérifications, mise en ligne sur votre nom de domaine, et prise en main.")],
   extra='<p class="note-service">En option&nbsp;: logo et identité visuelle, 250&nbsp;€.</p>',
   faq=[("Le site m'appartient-il ?", "Oui. Le nom de domaine est enregistré à votre nom, et vous gardez le site même si vous arrêtez le suivi."), ("Pourquoi une version anglaise ?", "Annecy accueille beaucoup de touristes, d'expatriés et de frontaliers. Une version anglaise les rassure et leur évite de réserver ailleurs.")]),
 'en': dict(url='/en/services/website', court='Business website',
   title='English-speaking web designer in Annecy: fast, bilingual business websites · Le Baliseur',
   desc='A fast business website that reads well on a phone and is built for Google and AI tools, in English and French. From €890, Google profile included. Annecy and Haute-Savoie.',
   h1='Business website', accroche='A site that convinces people, and that Google understands.',
   chapo="A good website isn't there to impress. It answers the customer's questions quickly (what, where, how much, how to book) and makes them want to call you. It loads instantly on a phone and is built to be read well by Google and AI tools.",
   prix='from €890', prix_detail='Up to €1,490 depending on pages and features. English version +€300. Google & AI pack included. Ready in about three weeks.',
   inclus=["Up to 5 pages at €890 (home, services, about, contact…), more up to €1,490", "Copy written or reworked with you, photos shown at their best", "Fast and easy to read on a phone, checked with Google's quality test", "Structured data so Google and AI tools understand who you are, where and at what price", "Contact form or booking link, with no advertising cookies", "The Google & AI visibility pack (€290) included", "Domain and accounts in your name: the site belongs to you"],
   pour_qui=["Businesses with no website, or a dated or slow one", "Holiday lets that want more direct bookings", "Shops that want to show prices, menus or hours clearly", "Businesses with international customers (English option)"],
   etapes=[("Free audit", "I check whether the website really is your problem. Sometimes the Google profile is enough."), ("Mock-up", "You see the site before it's built, and we adjust it together."), ("Build", "Copy, photos, pages and Google settings, in about three weeks."), ("Launch", "Checks, launch on your own domain, and a walkthrough.")],
   extra='<p class="note-service">Optional: logo and visual identity, €250.</p>',
   faq=[("Does the website belong to me?", "Yes. The domain is registered in your name, and you keep the site even if you stop the monthly support."), ("Why an English version?", "Annecy welcomes many tourists, expats and cross-border commuters. An English version reassures them and stops them booking elsewhere.")]),
},
'social': {
 'fr': dict(url='/services/reseaux-sociaux', court='Réseaux sociaux',
   title='Réseaux sociaux pour entreprises à Annecy : profils et contenus · Le Baliseur',
   desc="Facebook, Instagram et LinkedIn remis au point, modèles à vos couleurs, et un kit de publications mensuel prêt à poster en français et en anglais. 250 €, kit dès 99 €/mois.",
   h1='Réseaux sociaux', accroche='Des profils soignés, et de quoi publier sans y passer vos soirées.',
   chapo="Vos clients regardent souvent vos réseaux avant de venir, surtout pour un restaurant, un hébergement ou un commerce. Et vos avis Facebook comptent aussi pour les IA. Je remets vos profils au point, puis je vous prépare chaque mois des publications prêtes à poster. Vous gardez la main sur les réponses à vos clients.",
   prix='250 €', prix_detail="Remise au point des profils, une seule fois. Kit de publications mensuel en option, dès 99 € par mois.",
   inclus=["Facebook, Instagram et LinkedIn : bio, coordonnées, liens et horaires cohérents avec votre fiche Google", "Photo de profil, couverture et mises en avant à vos couleurs", "Des modèles de publication à réutiliser", "En option, chaque mois : un lot de publications prêtes à poster, textes en français et en anglais", "Des idées liées à la saison à Annecy : ski, été au bord du lac, marchés de Noël"],
   pour_qui=["Les entreprises dont les profils sont incomplets ou abandonnés", "Celles qui n'ont pas le temps de préparer des publications", "Les activités touristiques qui veulent parler aussi aux clients anglophones"],
   etapes=[("Diagnostic offert", "Je vérifie vos profils en même temps que votre présence sur Google."), ("Remise au point", "Profils, visuels et modèles, en une semaine environ."), ("Kit mensuel (option)", "Chaque mois, vos publications prêtes, que vous postez ou que je programme.")],
   faq=[("Répondez-vous aux messages et aux commentaires ?", "Non : vous êtes mieux placé que moi pour répondre à vos clients. Je prépare le contenu, et vous gardez la relation."), ("Faut-il être sur tous les réseaux ?", "Non. Mieux vaut un ou deux réseaux bien tenus que quatre à l'abandon. Le diagnostic dit lesquels comptent pour votre activité.")]),
 'en': dict(url='/en/services/social-media', court='Social media',
   title='Social media for businesses in Annecy: profiles and content · Le Baliseur',
   desc='Facebook, Instagram and LinkedIn sorted, templates in your colours, and a monthly content kit ready to post in English and French. €250, kit from €99/month.',
   h1='Social media', accroche='Polished profiles, and posts ready to go without losing your evenings.',
   chapo="Customers often check your social media before they come, especially for a restaurant, a holiday let or a shop. Your Facebook reviews count for AI tools too. I sort out your profiles, then prepare posts each month that are ready to publish. You stay in charge of replying to your customers.",
   prix='€250', prix_detail='Profile set-up, one-off. Optional monthly content kit from €99 a month.',
   inclus=["Facebook, Instagram and LinkedIn: bio, contact details, links and hours consistent with your Google profile", "Profile picture, cover and highlights in your colours", "Reusable post templates", "Optional, each month: a batch of posts ready to publish, captions in English and French", "Ideas tied to the Annecy seasons: skiing, summer on the lake, Christmas markets"],
   pour_qui=["Businesses whose profiles are incomplete or abandoned", "Those with no time to prepare posts", "Tourist businesses that also want to reach English-speaking customers"],
   etapes=[("Free audit", "I check your profiles alongside your Google presence."), ("Set-up", "Profiles, visuals and templates, in about a week."), ("Monthly kit (optional)", "Each month, your posts ready to go, posted by you or scheduled by me.")],
   faq=[("Do you reply to messages and comments?", "No: you're better placed to answer your customers. I prepare the content, and you keep the relationship."), ("Do I need to be on every network?", "No. One or two well-kept networks beat four abandoned ones. The audit shows which ones matter for your business.")]),
},
'suivi': {
 'fr': dict(url='/services/suivi-mensuel', court='Suivi mensuel',
   title='Suivi mensuel de visibilité Google et IA à Annecy · Le Baliseur',
   desc="Fiche Google entretenue, avis, publications, classement local et réponses des IA suivis chaque mois. Essentiel 49 €, Visibilité 129 €, Croissance 249 € par mois.",
   h1='Suivi mensuel', accroche='La visibilité, ça s’entretient. Je m’en occupe chaque mois.',
   chapo="Une fiche Google qu'on ne touche plus finit par reculer : horaires oubliés, photos datées, avis sans réponse. Le suivi mensuel garde votre présence à jour, mesure vos progrès sur la carte et dans les réponses des IA, et vous dit chaque mois ce qui a changé.",
   prix='dès 49 €/mois', prix_detail="Essentiel sans engagement. Visibilité et Croissance : 3 mois minimum, puis mois par mois.",
   extra='''<h2 class="titre-3">Les trois formules</h2>
<div class="formules">
<div class="formule"><h3>Essentiel</h3><p class="prix-montant">49&nbsp;€<span>/mois</span></p><ul class="liste-balise"><li>Fiche Google tenue à jour&nbsp;: horaires, fermetures, photos</li><li>Petites mises à jour du site, jusqu'à 30 minutes par mois</li><li>Un bilan simple chaque mois</li></ul></div>
<div class="formule vedette"><h3>Visibilité</h3><p class="prix-montant">129&nbsp;€<span>/mois</span></p><ul class="liste-balise"><li>Tout l'Essentiel</li><li>Deux publications Google par mois</li><li>Aide à la réponse aux avis</li><li>Suivi de votre classement sur la carte, quartier par quartier</li><li>Vérification de ce que disent ChatGPT et Gemini de vous</li></ul></div>
<div class="formule"><h3>Croissance</h3><p class="prix-montant">249&nbsp;€<span>/mois</span></p><ul class="liste-balise"><li>Tout Visibilité</li><li>Le kit de publications réseaux sociaux</li><li>Une nouvelle page ou un article par mois</li><li>Un point de 30 minutes et un plan pour le mois suivant</li></ul></div>
</div>''',
   inclus=["Votre présence Google et IA entretenue, sans que vous y pensiez", "Des chiffres chaque mois : appels, itinéraires, visites, classement", "Un interlocuteur unique, joignable en français et en anglais"],
   pour_qui=["Les entreprises qui viennent de faire leur fiche ou leur site", "Les activités saisonnières qui veulent être prêtes avant chaque saison", "Celles qui veulent des résultats mesurés, pas des promesses"],
   etapes=[("Point de départ", "Je mesure votre situation le premier mois : c'est la référence."), ("Chaque mois", "Les actions de votre formule, faites et notées."), ("Le bilan", "Un résumé clair : ce qui a été fait, ce qui a bougé, la suite.")],
   faq=[("Que se passe-t-il si j'arrête ?", "Rien ne disparaît : votre fiche, votre site et vos comptes restent à vous. Seul l'entretien s'arrête."), ("Pourquoi 3 mois minimum ?", "Parce que le classement local met souvent deux à quatre mois à bouger. En dessous, on ne mesure pas grand-chose.")]),
 'en': dict(url='/en/services/monthly-support', court='Monthly support',
   title='Monthly Google and AI visibility support in Annecy · Le Baliseur',
   desc='Google profile kept up to date, reviews, posts, local ranking and AI answers tracked every month. Essential €49, Visibility €129, Growth €249 a month.',
   h1='Monthly support', accroche='Visibility needs looking after. I take care of it every month.',
   chapo="A Google profile nobody touches slowly slips: forgotten hours, dated photos, unanswered reviews. Monthly support keeps your presence up to date, measures your progress on the map and in AI answers, and tells you each month what has changed.",
   prix='from €49/month', prix_detail='Essential has no commitment. Visibility and Growth: 3 months minimum, then month to month.',
   extra='''<h2 class="titre-3">The three plans</h2>
<div class="formules">
<div class="formule"><h3>Essential</h3><p class="prix-montant">€49<span>/month</span></p><ul class="liste-balise"><li>Google profile kept up to date: hours, closures, photos</li><li>Small website updates, up to 30 minutes a month</li><li>A simple monthly report</li></ul></div>
<div class="formule vedette"><h3>Visibility</h3><p class="prix-montant">€129<span>/month</span></p><ul class="liste-balise"><li>Everything in Essential</li><li>Two Google posts a month</li><li>Help replying to reviews</li><li>Your map ranking tracked, area by area</li><li>A check on what ChatGPT and Gemini say about you</li></ul></div>
<div class="formule"><h3>Growth</h3><p class="prix-montant">€249<span>/month</span></p><ul class="liste-balise"><li>Everything in Visibility</li><li>The social media content kit</li><li>A new page or article every month</li><li>A 30-minute call and a plan for the next month</li></ul></div>
</div>''',
   inclus=["Your Google and AI presence looked after, without you thinking about it", "Numbers every month: calls, direction requests, visits, ranking", "One contact, available in English and French"],
   pour_qui=["Businesses that have just set up their profile or website", "Seasonal businesses that want to be ready before each season", "Anyone who wants measured results, not promises"],
   etapes=[("Starting point", "I measure where you stand in the first month: that's the baseline."), ("Every month", "The actions in your plan, done and logged."), ("The report", "A clear summary: what was done, what moved, what's next.")],
   faq=[("What happens if I stop?", "Nothing disappears: your profile, website and accounts stay yours. Only the upkeep stops."), ("Why 3 months minimum?", "Local rankings often take two to four months to move. Any shorter and there's little to measure.")]),
},
}

FAQ = {
'fr': [
 ("Le diagnostic est-il vraiment gratuit ?", "Oui. Je compare votre présence sur Google et dans les réponses des IA à celle de trois concurrents, et je vous envoie le résultat sous 72 h. Sans engagement : si vous ne donnez pas suite, vous gardez le diagnostic."),
 ("Ai-je besoin d'un site internet ?", "Pas toujours. Pour beaucoup de commerces et d'indépendants, une fiche Google complète rapporte plus vite qu'un site. Le diagnostic vous dit honnêtement par où commencer."),
 ("Combien de temps avant de voir des résultats ?", "La fiche Google est remise au point en une semaine environ, et les premiers effets se voient souvent dans les semaines qui suivent. Le classement sur la carte met en général deux à quatre mois à progresser nettement."),
 ("Pouvez-vous garantir la première place sur Google ?", "Non. Personne ne peut le garantir honnêtement, et méfiez-vous de ceux qui le promettent. Je travaille sur ce que Google et les IA prennent en compte, et je mesure les progrès chaque mois."),
 ("Comment apparaître dans ChatGPT, Gemini ou le mode IA de Google ?", "Les IA s'appuient sur les mêmes signaux que Google : une fiche complète, des fiches Bing et Apple Plans, des avis sur plusieurs plateformes, des informations identiques partout et un site clair. Personne ne peut garantir d'être cité, mais on peut devenir la réponse évidente."),
 ("Le site et la fiche m'appartiennent-ils ?", "Oui. Le nom de domaine est à votre nom, et vous restez propriétaire de votre fiche Google et de vos comptes. Je n'interviens qu'en tant que gestionnaire."),
 ("Que se passe-t-il si j'arrête le suivi mensuel ?", "Tout reste en place et à vous. La formule Essentiel est sans engagement ; Visibilité et Croissance demandent 3 mois minimum, parce que le classement local met du temps à bouger."),
 ("Travaillez-vous en anglais ?", "Oui, en français comme en anglais, et je peux faire la version anglaise de votre site pour vos clients touristes, expatriés ou frontaliers."),
 ("Quelle zone couvrez-vous ?", "Annecy et la Haute-Savoie. Je viens vous voir sur place pour présenter le diagnostic et décider ensemble, face à face ; le suivi peut ensuite se faire à distance si vous préférez."),
 ("Vos prix incluent-ils la TVA ?", "Le Baliseur est une micro-entreprise : la TVA n'est pas applicable (art. 293 B du CGI). Le prix affiché est le prix que vous payez."),
 ("Demandez-vous des avis Google en échange d'une remise ?", "Non, c'est interdit par les règles de Google. L'offre des cinq premiers clients porte sur un témoignage publié sur ce site, signalé comme celui d'un client fondateur."),
],
'en': [
 ("Is the audit really free?", "Yes. I compare your presence on Google and in AI answers with three competitors, and send you the results within 72 hours. No obligation: if you don't go further, you keep the audit."),
 ("Do I need a website?", "Not always. For many shops and independents, a complete Google profile pays off faster than a website. The audit tells you honestly where to start."),
 ("How long before I see results?", "Your Google profile is sorted in about a week, and the first effects often show in the following weeks. Map rankings usually take two to four months to improve clearly."),
 ("Can you guarantee first place on Google?", "No. Nobody can honestly guarantee it, so be wary of anyone who does. I work on what Google and AI tools take into account, and measure progress every month."),
 ("How do I appear in ChatGPT, Gemini or Google's AI Mode?", "AI tools rely on the same signals as Google: a complete profile, Bing and Apple Maps listings, reviews on several platforms, the same details everywhere and a clear website. Nobody can guarantee being named, but you can become the obvious answer."),
 ("Do the website and profile belong to me?", "Yes. The domain is in your name, and you remain the owner of your Google profile and accounts. I only act as a manager."),
 ("What happens if I stop the monthly support?", "Everything stays in place and stays yours. Essential has no commitment; Visibility and Growth have a 3-month minimum, because local rankings take time to move."),
 ("Do you work in English?", "Yes, in English and French, and I can create the English version of your site for tourist, expat or cross-border customers."),
 ("Which area do you cover?", "Annecy and Haute-Savoie. I come and see you in person to go through the audit and decide together, face to face; the follow-up can then be done remotely if you prefer."),
 ("Do your prices include VAT?", "Le Baliseur is a French micro-enterprise, so VAT is not applicable (art. 293 B of the French tax code). The price shown is the price you pay."),
 ("Do you ask for Google reviews in exchange for a discount?", "No, that's against Google's rules. The first-five-clients offer is for a testimonial published on this site, marked as coming from a founding client."),
],
}

URLS = {}
for k, v in SERV.items():
    URLS[k] = (v['fr']['url'], v['en']['url'])

made = []
for k, v in SERV.items():
    for lang in ('fr', 'en'):
        d = v[lang]; other = v['en' if lang == 'fr' else 'fr']['url']
        home = ('Accueil', '/') if lang == 'fr' else ('Home', '/en/')
        sl = ('Services', '/services/') if lang == 'fr' else ('Services', '/en/services/')
        price = re.sub(r'[^\d]', '', d['prix'].split('/')[0]) or None
        schema = [{"@context": "https://schema.org", "@type": "Service", "name": d['court'], "serviceType": d['court'],
                   "description": d['desc'], "provider": PROVIDER, "areaServed": AREA, "inLanguage": lang,
                   "offers": {"@type": "Offer", "price": price, "priceCurrency": "EUR"}},
                  fil(lang, [home, sl, (d['court'], d['url'])])]
        made.append(page(lang, d['url'], other, d['title'], d['desc'], service_main(lang, d), schema, current=sl[1]))

# pages index des services
for lang in ('fr', 'en'):
    url = '/services/' if lang == 'fr' else '/en/services/'
    other = '/en/services/' if lang == 'fr' else '/services/'
    cards = ''
    for k in ('google', 'site', 'social', 'suivi'):
        d = SERV[k][lang]
        cards += f'<a class="carte-service" href="{d["url"]}"><h2>{d["court"]}</h2><p class="prix-montant">{d["prix"]}</p><p>{esc(d["accroche"])}</p><span class="lien-fleche">{"En savoir plus" if lang=="fr" else "Learn more"} →</span></a>\n'
    h1 = 'Services' ; intro = ("Quatre façons de vous rendre visible, à combiner selon vos besoins. Tout commence par le diagnostic offert, qui dit honnêtement par où commencer." if lang == 'fr' else "Four ways to make you visible, combined to suit you. Everything starts with the free audit, which tells you honestly where to begin.")
    main = f'<section class="conteneur section">\n<h1 class="titre-1">{h1}</h1>\n<p class="chapo" style="margin:20px 0 40px">{esc(intro)}</p>\n<div class="grille-services">\n{cards}</div>\n</section>'
    title = ('Services de visibilité locale à Annecy : Google, IA, site, réseaux sociaux · Le Baliseur' if lang == 'fr' else 'Local visibility services in Annecy: Google, AI, websites, social media · Le Baliseur')
    desc = ('Fiche Google et IA, site vitrine, réseaux sociaux et suivi mensuel pour les entreprises d’Annecy et de Haute-Savoie. Prix affichés, diagnostic offert.' if lang == 'fr' else 'Google and AI visibility, business websites, social media and monthly support for businesses in Annecy and Haute-Savoie. Clear prices, free audit.')
    home = ('Accueil', '/') if lang == 'fr' else ('Home', '/en/')
    made.append(page(lang, url, other, title, desc, main, [fil(lang, [home, ('Services', url)])], current=url))

# FAQ
for lang in ('fr', 'en'):
    url = '/faq' if lang == 'fr' else '/en/faq'
    other = '/en/faq' if lang == 'fr' else '/faq'
    items = FAQ[lang]
    qa = ''.join(f'<details class="qr"><summary>{esc(q)}</summary><p>{esc(a)}</p></details>\n' for q, a in items)
    h1 = 'Questions fréquentes' if lang == 'fr' else 'Frequently asked questions'
    cta = ('<div class="faq-appel"><p>Une autre question&nbsp;? Écrivez-moi à <a href="mailto:chris@lebaliseur.fr">chris@lebaliseur.fr</a>, ou commencez par le <a href="/#diagnostic">diagnostic offert</a>.</p></div>' if lang == 'fr'
           else '<div class="faq-appel"><p>Another question? Email me at <a href="mailto:chris@lebaliseur.fr">chris@lebaliseur.fr</a>, or start with the <a href="/en/#audit">free audit</a>.</p></div>')
    main = f'<section class="conteneur section faq">\n<h1 class="titre-1">{h1}</h1>\n<div class="qrs">\n{qa}</div>\n{cta}\n</section>'
    schema = [{"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": lang,
               "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}]
    title = ('FAQ : prix, délais, Google et IA · Le Baliseur, Annecy' if lang == 'fr' else 'FAQ: prices, timings, Google and AI · Le Baliseur, Annecy')
    desc = ('Diagnostic gratuit, délais, garanties, apparaître dans ChatGPT, propriété du site : les réponses aux questions fréquentes sur Le Baliseur.' if lang == 'fr' else 'Free audit, timings, guarantees, appearing in ChatGPT, owning your website: answers to common questions about Le Baliseur.')
    made.append(page(lang, url, other, title, desc, main, schema, current=url))


# page Exemples (les maquettes elles-mêmes sont dans public/exemples/*.html)
EXEMPLES = {
'fr': dict(url='/exemples/', other='/en/examples/', h1='Exemples',
  intro="Trois sites imaginés pour des entreprises d'ici, pour voir à quoi pourrait ressembler le vôtre. Les entreprises sont fictives, les photos libres de droits.",
  bouton="Voir l'exemple", appel_titre='Envie du même pour votre entreprise ?', appel_texte="Tout commence par le diagnostic offert : je regarde votre présence actuelle et je vous dis honnêtement si un site est la priorité.", appel_bouton='Demander mon diagnostic offert', appel_lien='/#diagnostic',
  title="Exemples de sites : coach, restaurant, chambres d'hôtes · Le Baliseur, Annecy",
  desc="Trois exemples de sites vitrines réalisés par Le Baliseur pour des entreprises d'Annecy : coach de vie, restaurant et chambres d'hôtes.",
  items=[
   ('coach-de-vie', 'coach-portrait', 'center 25%', 'Bien-être et accompagnement', 'Coach de vie', "Un site calme qui rassure et donne envie de prendre contact : l'approche en trois étapes, des prix clairs et un appel découverte à réserver.", ['Appel découverte en un clic', 'Prix affichés', 'Avis Google mis en avant', 'Formulaire de contact']),
   ('restaurant', 'resto-salle', 'center 45%', 'Restauration', 'Restaurant', "La carte du moment, les horaires et l'accès en un coup d'œil, et la réservation sans passer par une plateforme.", ['Carte facile à mettre à jour', 'Réservation en ligne', "Horaires et plan d'accès", 'Pensé pour le téléphone']),
   ('chambres-hotes', 'bnb-lac', 'center 60%', 'Hébergement', "Chambres d'hôtes", "Des photos qui donnent envie, chaque chambre présentée avec son prix, et la réservation en direct, sans commission.", ['Réservation directe, sans frais', 'Une fiche par chambre', 'Les bonnes adresses du coin', 'Version anglaise possible']),
  ]),
'en': dict(url='/en/examples/', other='/exemples/', h1='Examples',
  intro="Three websites imagined for local businesses, to show what yours could look like. The businesses are fictional and the photos are royalty-free.",
  bouton='View the example (in French)', appel_titre='Want the same for your business?', appel_texte="It all starts with the free audit: I look at where you stand today and tell you honestly whether a website is the priority.", appel_bouton='Get my free audit', appel_lien='/en/#audit',
  title='Website examples: life coach, restaurant, B&B · Le Baliseur, Annecy',
  desc='Three example business websites by Le Baliseur for Annecy businesses: a life coach, a restaurant and a B&B.',
  items=[
   ('coach-de-vie', 'coach-portrait', 'center 25%', 'Wellbeing and coaching', 'Life coach', 'A calm site that reassures and makes people want to get in touch: a three-step approach, clear prices and a discovery call to book.', ['Discovery call in one click', 'Prices shown', 'Google reviews highlighted', 'Contact form']),
   ('restaurant', 'resto-salle', 'center 45%', 'Food and drink', 'Restaurant', 'The current menu, opening hours and directions at a glance, and table booking without a third-party platform.', ['Menu that is easy to update', 'Online booking', 'Hours and map', 'Built for phones']),
   ('chambres-hotes', 'bnb-lac', 'center 60%', 'Accommodation', 'B&B', 'Photos that make people want to stay, each room with its price, and direct booking with no commission.', ['Direct booking, no fees', 'A card for every room', 'Local tips', 'English version available']),
  ]),
}
for lang, E in EXEMPLES.items():
    rows = ''
    for slug, photo, pos, sur, h2, txt, feats in E['items']:
        lis = ''.join(f'<li>{esc(f)}</li>' for f in feats)
        rows += (f'<article class="exemple">\n'
                 f'<a class="exemple-visuel" href="/exemples/{slug}" tabindex="-1" aria-hidden="true"><span class="exemple-barre"><i></i><i></i><i></i></span>'
                 f'<img src="/assets/exemples/{photo}.jpg" alt="" loading="lazy" style="object-position:{pos}"></a>\n'
                 f'<div class="exemple-texte">\n<p class="surtitre">{esc(sur)}</p>\n<h2 class="titre-3">{esc(h2)}</h2>\n<p>{esc(txt)}</p>\n'
                 f'<ul class="etiquettes">{lis}</ul>\n'
                 f'<a class="bouton bouton-sombre" href="/exemples/{slug}">{esc(E["bouton"])} →</a>\n</div>\n</article>\n')
    main = (f'<section class="conteneur section">\n<h1 class="titre-1">{E["h1"]}</h1>\n'
            f'<p class="chapo" style="margin:20px 0 56px">{esc(E["intro"])}</p>\n<div class="exemples">\n{rows}</div>\n</section>\n'
            f'<section class="fond-blanc section">\n<div class="conteneur exemples-appel">\n<h2 class="titre-2">{esc(E["appel_titre"])}</h2>\n'
            f'<p class="chapo">{esc(E["appel_texte"])}</p>\n<a class="bouton bouton-signal" href="{E["appel_lien"]}">{E["appel_bouton"]}</a>\n</div>\n</section>')
    home = ('Accueil', '/') if lang == 'fr' else ('Home', '/en/')
    made.append(page(lang, E['url'], E['other'], E['title'], E['desc'], main, [fil(lang, [home, (E['h1'], E['url'])])], current=E['url']))


print('\n'.join(made))
