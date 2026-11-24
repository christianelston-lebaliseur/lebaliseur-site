# Page « Pourquoi Le Baliseur » (FR/EN), appelée par generer-pages.py.
# Comparaison par catégories (faire soi-même, freelance en ligne, agence traditionnelle), jamais de concurrents nommés.
# Règle : rien d'invérifiable sur les autres ; les prix chiffrés ne concernent que Le Baliseur (voir pages_tarifs_cgv.py).
import re

def esc(t):  # espaces insécables français devant : ; ? ! »
    return re.sub(r' ([:;?!»])', r'&nbsp;\1', t).replace('« ', '«&nbsp;')

def tableau(caption, head, rows, fr=True):
    e = esc if fr else (lambda t: t)
    th = ''.join(f'<th scope="col"{" class=\"lb\"" if i == 1 else ""}>{e(h)}</th>' for i, h in enumerate(head))
    body = ''.join('<tr>' + ''.join((f'<th scope="row">{e(c)}</th>' if i == 0 else f'<td{" class=\"lb\"" if i == 1 else ""}>{e(c)}</td>')
                                    for i, c in enumerate(r)) + '</tr>\n' for r in rows)
    return (f'<div class="tableau-comparatif" tabindex="0" role="region" aria-label="{caption}"><table>\n<caption>{caption}</caption>\n'
            f'<thead><tr>{th}</tr></thead>\n<tbody>\n{body}</tbody>\n</table></div>')

def cartes(items, fr=True):
    e = esc if fr else (lambda t: t)
    return '<div class="cas-cartes cartes-choix">\n' + '\n'.join(
        f'<article class="cas-carte"><p class="cas-libelle cas-apres">{e(t)}</p><p>{e(d)}</p></article>' for t, d in items) + '\n</div>'

def ul(items, fr=True):
    e = esc if fr else (lambda t: t)
    return '<ul class="liste-balise">\n' + '\n'.join(f'<li>{e(i)}</li>' for i in items) + '\n</ul>'

P = {
'fr': dict(
  url='/pourquoi-le-baliseur', other='/en/why-le-baliseur', court='Pourquoi Le Baliseur',
  title='Agence web, freelance ou Wix : que choisir à Annecy ? · Le Baliseur',
  desc="Comparatif honnête pour créer votre site à Annecy : faire soi-même (Wix, Squarespace), freelance en ligne, agence web traditionnelle ou Le Baliseur. Prix, délais, propriété, Google et IA.",
  surtitre='Comparatif · création de site à Annecy',
  h1='Agence, freelance ou faire soi-même : que choisir ?',
  chapo="Pour un commerce ou un indépendant à Annecy, il y a quatre façons d'avoir un site. Aucune n'est la bonne pour tout le monde. Voici, le plus honnêtement possible, ce que chacune vous apporte, y compris quand Le Baliseur n'est pas le bon choix.",
  h_tableau='Le comparatif',
  intro_tableau="Pour les autres options, les prix et les délais varient beaucoup d'un prestataire à l'autre : je décris ce qu'on rencontre le plus souvent, sans chiffres que je ne pourrais pas vérifier. Pour Le Baliseur, les prix sont ceux de la page Tarifs.",
  caption='Comparatif des façons de créer un site pour une petite entreprise',
  head=['', 'Le Baliseur', 'Faire soi-même (Wix, Squarespace…)', 'Freelance en ligne', 'Agence web traditionnelle'],
  rows=[
    ['Prix', 'Prix affichés : site une page 490 €, site vitrine 890 €', 'Abonnement mensuel à la plateforme, plus votre temps', 'Très variable selon le profil et le pays', 'Sur devis, en général plus élevé (une équipe à rémunérer)'],
    ['Interlocuteur', 'Une seule personne, Chris, du diagnostic au suivi', 'Vous, avec l\'aide en ligne de la plateforme', 'Une personne, souvent à distance', 'Un commercial, puis un chef de projet et une équipe'],
    ['Délai', '1 à 3 semaines selon le projet', 'Selon le temps que vous y consacrez', 'Variable selon la disponibilité', 'Souvent plusieurs semaines, parfois quelques mois'],
    ['Fiche Google, Bing, Apple Plans', 'Incluses avec le site vitrine, mêmes coordonnées dans les annuaires', 'À faire vous-même', 'Rarement incluses, à vérifier', 'Souvent en option ou dans une offre SEO à part'],
    ['Visibilité dans les IA (ChatGPT, Gemini…)', 'Prévue dès la création, puis suivie chaque mois', 'À faire vous-même', 'Rarement prévue', 'Selon l\'agence'],
    ['Propriété', 'Domaine, site et comptes à votre nom', 'Site lié à la plateforme, difficile à déménager', 'À vérifier dans le contrat', 'À vérifier dans le contrat'],
    ['Après la mise en ligne', 'Suivi dès 49 €/mois sans engagement, hébergement inclus', 'Vous gérez tout', 'Au cas par cas', 'Contrat de maintenance'],
    ['Changements d\'avis', 'Inclus pendant la création ; un changement d\'identité par an inclus dans les suivis', 'Libres, mais à faire vous-même', 'Souvent facturés en plus', 'Souvent facturés en plus'],
    ['Connaissance du terrain', 'Basé à Annecy, rendez-vous sur place en Haute-Savoie', '—', 'Souvent ailleurs', 'Selon l\'agence'],
    ['Langues', 'Français et anglais, pour les touristes, expatriés et frontaliers', 'Selon vos compétences', 'Selon le profil', 'Selon l\'agence'],
  ],
  h_choisir='Quelle option pour quelle situation',
  choisir=[
    ('Faire soi-même', "Si vous aimez construire, avez du temps et un petit budget. Comptez quand même la fiche Google, les annuaires et le suivi : c'est souvent là que ça coince."),
    ('Freelance en ligne', "Si vous avez un besoin précis (un logo, une page) et savez exactement ce que vous voulez. Vérifiez à qui appartiennent le domaine et les comptes."),
    ('Agence web traditionnelle', "Si vous avez un grand projet : boutique en ligne avec beaucoup de produits, application, campagnes publicitaires, plusieurs métiers à coordonner."),
    ('Le Baliseur', "Si vous êtes une petite entreprise d'Annecy ou de Haute-Savoie et voulez être trouvé sur Google, sur la carte et dans les IA, avec une seule personne qui s'occupe de tout."),
  ],
  h_pas_pour='Quand Le Baliseur n\'est pas le bon choix',
  pas_pour=[
    "Une boutique en ligne avec un grand catalogue, ou une application sur mesure",
    "La gestion de campagnes publicitaires payantes (Google Ads, Meta)",
    "Un grand compte qui a besoin d'une équipe de plusieurs personnes en parallèle",
    "Les particuliers : je travaille uniquement avec des entreprises et des indépendants",
  ],
  pas_pour_fin="Dans ces cas, je vous le dis dès le diagnostic, et je vous oriente si je peux.",
  h_faq='Questions fréquentes',
  faq=[
    ("Agence web ou freelance pour créer un site à Annecy ?", "Une agence apporte une équipe et un cadre, un freelance de la souplesse et souvent un prix plus bas. Le Baliseur est une agence d'une seule personne : un interlocuteur unique comme avec un freelance, avec des prix affichés et un suivi Google et IA comme dans une agence."),
    ("Wix ou un professionnel pour une petite entreprise ?", "Wix ou Squarespace conviennent si vous avez le temps de tout faire, site, fiche Google, annuaires et suivi. Un professionnel vous fait gagner ce temps et évite les erreurs qui coûtent des clients : coordonnées différentes d'un site à l'autre, fiche incomplète, site lent sur téléphone."),
    ("Combien coûte un site avec Le Baliseur ?", "Un site une page coûte 490 €, un site vitrine jusqu'à 5 pages 890 €, fiche Google et 3 mois de suivi inclus. Le suivi commence à 49 € par mois, sans engagement. Tous les prix sont sur la page Tarifs."),
    ("Est-ce que le site m'appartient ?", "Oui. Le domaine, le site et les comptes (Google, réseaux sociaux) sont à votre nom. Si vous arrêtez le suivi, le site est transféré gratuitement sur un compte à votre nom."),
    ("Pouvez-vous garantir la première place sur Google ou dans ChatGPT ?", "Non, et personne ne peut le promettre honnêtement. Je travaille sur ce que Google et les IA utilisent pour choisir : une fiche complète, des informations cohérentes partout, des avis récents et un site clair."),
  ],
  h_fin='Vous hésitez encore ?',
  fin="Le diagnostic est offert : je compare votre présence à celle de trois concurrents directs, sur Google et dans les IA, et je vous réponds sous 24 h.",
  bouton='Demander mon diagnostic offert', lien='/#diagnostic',
  bouton2='Voir les tarifs', lien2='/tarifs',
),
'en': dict(
  url='/en/why-le-baliseur', other='/pourquoi-le-baliseur', court='Why Le Baliseur',
  title='Web agency, freelancer or Wix: which is right in Annecy? · Le Baliseur',
  desc='An honest comparison for getting a website in Annecy: doing it yourself (Wix, Squarespace), an online freelancer, a traditional web agency or Le Baliseur. Prices, timings, ownership, Google and AI.',
  surtitre='Comparison · websites in Annecy',
  h1='Agency, freelancer or do it yourself: which to choose?',
  chapo="For a shop or independent business in Annecy, there are four ways to get a website. None of them suits everyone. Here, as honestly as I can put it, is what each one gives you, including when Le Baliseur isn't the right choice.",
  h_tableau='The comparison',
  intro_tableau="For the other options, prices and timings vary a lot from one provider to the next, so I describe what you'll usually come across, without figures I can't check. Le Baliseur's prices are the ones on the Pricing page.",
  caption='Comparison of the ways a small business can get a website',
  head=['', 'Le Baliseur', 'Do it yourself (Wix, Squarespace…)', 'Online freelancer', 'Traditional web agency'],
  rows=[
    ['Price', 'Published prices: one-page site €490, business website €890', 'A monthly platform subscription, plus your time', 'Varies widely with the profile and country', 'Quoted, usually higher (a team to pay)'],
    ['Who you deal with', 'One person, Chris, from audit to support', 'You, with the platform\'s online help', 'One person, often remote', 'A salesperson, then a project manager and a team'],
    ['Timing', '1 to 3 weeks, depending on the project', 'Depends on the time you put in', 'Depends on availability', 'Often several weeks, sometimes a few months'],
    ['Google profile, Bing, Apple Maps', 'Included with the business website, consistent details across directories', 'Up to you', 'Rarely included, worth checking', 'Often an extra or a separate SEO package'],
    ['Visibility in AI (ChatGPT, Gemini…)', 'Built in from the start, then tracked monthly', 'Up to you', 'Rarely planned for', 'Depends on the agency'],
    ['Ownership', 'Domain, website and accounts in your name', 'Tied to the platform, hard to move', 'Check the contract', 'Check the contract'],
    ['After launch', 'Support from €49/month, no commitment, hosting included', 'You handle everything', 'Case by case', 'Maintenance contract'],
    ['Changing your mind', 'Included during the build; one rebrand a year included in support plans', 'Free, but you do it', 'Often charged extra', 'Often charged extra'],
    ['Local knowledge', 'Based in Annecy, meetings in person across Haute-Savoie', '—', 'Often elsewhere', 'Depends on the agency'],
    ['Languages', 'French and English, for tourists, expats and cross-border workers', 'Depends on your skills', 'Depends on the profile', 'Depends on the agency'],
  ],
  h_choisir='Which option for which situation',
  choisir=[
    ('Do it yourself', "If you enjoy building, have the time and a small budget. Don't forget the Google profile, directories and upkeep: that's often where it stalls."),
    ('Online freelancer', "If you have a specific need (a logo, one page) and know exactly what you want. Check who owns the domain and the accounts."),
    ('Traditional web agency', "If you have a large project: an online shop with many products, an app, ad campaigns, several specialists to coordinate."),
    ('Le Baliseur', "If you're a small business in Annecy or Haute-Savoie and want to be found on Google, on the map and in AI answers, with one person looking after it all."),
  ],
  h_pas_pour="When Le Baliseur isn't the right choice",
  pas_pour=[
    "An online shop with a large catalogue, or a bespoke app",
    "Running paid ad campaigns (Google Ads, Meta)",
    "A large organisation that needs a team of several people working in parallel",
    "Private individuals: I only work with businesses and independents",
  ],
  pas_pour_fin="If that's you, I'll say so at the audit stage, and point you elsewhere if I can.",
  h_faq='Common questions',
  faq=[
    ("Web agency or freelancer for a website in Annecy?", "An agency brings a team and a process; a freelancer brings flexibility and often a lower price. Le Baliseur is a one-person agency: a single point of contact, like a freelancer, with published prices and Google and AI support, like an agency."),
    ("Wix or a professional for a small business?", "Wix or Squarespace work if you have time to do everything: website, Google profile, directories and upkeep. A professional saves you that time and avoids mistakes that cost customers: different details on different sites, an incomplete profile, a site that's slow on phones."),
    ("How much does a website from Le Baliseur cost?", "A one-page site is €490 and a business website of up to 5 pages is €890, with the Google profile and 3 months of support included. Support starts at €49 a month with no commitment. All prices are on the Pricing page."),
    ("Do I own the website?", "Yes. The domain, website and accounts (Google, social media) are in your name. If you stop support, the site is transferred to an account in your name, free of charge."),
    ("Can you guarantee first place on Google or in ChatGPT?", "No, and nobody can honestly promise it. I work on what Google and AI tools use to choose: a complete profile, consistent details everywhere, recent reviews and a clear website."),
  ],
  h_fin='Still not sure?',
  fin="The audit is free: I compare your presence with three direct competitors, on Google and in AI answers, and reply within 24 hours.",
  bouton='Get my free audit', lien='/en/#audit',
  bouton2='See pricing', lien2='/en/pricing',
),
}

def corps(d, fr):
    e = esc if fr else (lambda t: t)
    qa = ''.join(f'<details class="qr"><summary>{e(q)}</summary><p>{e(a)}</p></details>\n' for q, a in d['faq'])
    return f'''<section class="conteneur section cas-entete">
<p class="surtitre">{e(d["surtitre"])}</p>
<h1 class="titre-1">{e(d["h1"])}</h1>
<p class="chapo">{e(d["chapo"])}</p>
</section>

<section class="fond-blanc"><div class="conteneur section">
<h2 class="titre-2">{e(d["h_tableau"])}</h2>
<p class="cas-intro">{e(d["intro_tableau"])}</p>
<p class="astuce-glisser">{"Faites glisser le tableau pour voir les autres options →" if fr else "Swipe the table to see the other options →"}</p>
{tableau(d["caption"], d["head"], d["rows"], fr)}
</div></section>

<section class="conteneur section">
<h2 class="titre-2">{e(d["h_choisir"])}</h2>
{cartes(d["choisir"], fr)}
</section>

<section class="sombre"><div class="conteneur section pourquoi-pas">
<h2 class="titre-2">{e(d["h_pas_pour"])}</h2>
<div>
{ul(d["pas_pour"], fr)}
<p>{e(d["pas_pour_fin"])}</p>
</div>
</div></section>

<section class="conteneur section faq">
<h2 class="titre-2">{e(d["h_faq"])}</h2>
<div class="qrs">
{qa}</div>
</section>

<section class="fond-blanc"><div class="conteneur section cas-fin">
<div>
<h2 class="titre-2" style="margin:0">{e(d["h_fin"])}</h2>
<p>{e(d["fin"])}</p>
</div>
<p class="heros-actions"><a class="bouton bouton-signal" href="{d["lien"]}">{d["bouton"]}</a> <a class="bouton bouton-contour" href="{d["lien2"]}">{d["bouton2"]}</a></p>
</div></section>'''

def generer(page, fil):
    made = []
    for lang in ('fr', 'en'):
        d = P[lang]
        home = ('Accueil', '/') if lang == 'fr' else ('Home', '/en/')
        schema = [
            {"@context": "https://schema.org", "@type": "WebPage", "name": d['h1'], "description": d['desc'], "inLanguage": lang,
             "url": "https://lebaliseur.fr" + d['url'],
             "about": {"@type": "ProfessionalService", "name": "Le Baliseur", "url": "https://lebaliseur.fr/",
                       "areaServed": [{"@type": "City", "name": "Annecy"}, {"@type": "AdministrativeArea", "name": "Haute-Savoie"}]},
             "dateModified": "2026-11-24"},
            {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": lang,
             "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in d['faq']]},
            fil(lang, [home, (d['court'], d['url'])]),
        ]
        made.append(page(lang, d['url'], d['other'], d['title'], d['desc'], corps(d, lang == 'fr'), schema, current=d['url']))
    return made
