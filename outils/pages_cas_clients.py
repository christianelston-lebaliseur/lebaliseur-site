# Pages « Cas clients » (FR et EN), appelées par generer-pages.py.
# Captures dans public/assets/cas-clients/<slug>/ (webp), produites par outils/captures_cas_clients.py.
import re

NB = '&nbsp;'
IMG = '/assets/cas-clients/psychologue-annecy'

def fig(src, w, h, alt, legende, apres=False, cls=''):
    return (f'<figure class="cas-capture{cls}"><img src="{IMG}/{src}.webp" width="{w}" height="{h}" alt="{alt}" loading="lazy" decoding="async">'
            f'<figcaption{" class=\"cas-apres\"" if apres else ""}>{legende}</figcaption></figure>')

def carte(probleme, fait, en=False):
    l1, l2 = ('The problem', 'What I did') if en else ('Le problème', 'Ce que j\'ai fait')
    return (f'<article class="cas-carte"><p class="cas-libelle">{l1}</p><p>{probleme}</p>'
            f'<p class="cas-libelle cas-apres">{l2}</p><p>{fait}</p></article>')

def caroline(D):
    t = D  # dimensions des captures {nom: (w, h)}
    return f'''<section class="conteneur section cas-entete">
<p class="surtitre">Cas client · Cabinet de psychologie, Annecy</p>
<h1 class="titre-1">Un site qui rassure, et une adresse enfin juste partout</h1>
<p class="chapo">Caroline Lillaz est psychologue clinicienne à Annecy. Son ancien site était difficile à lire sur téléphone et affichait encore une ancienne adresse. J'ai refait le site, et remis en cohérence sa fiche Google et ses annuaires.</p>
<dl class="cas-faits">
<div><dt>Cliente</dt><dd>Caroline Lillaz, psychologue</dd></div>
<div><dt>Mise en ligne</dt><dd>Novembre 2026</dd></div>
<div><dt>Prestations</dt><dd>Site vitrine, fiche Google, annuaires</dd></div>
</dl>
<p class="cas-actions"><a class="bouton bouton-signal" href="https://www.caroline-lillaz-psychologue.fr/" rel="noopener">Voir le site en ligne</a></p>
</section>

<section class="fond-blanc"><div class="conteneur section">
<h2 class="titre-2">Avant, après{NB}: sur téléphone</h2>
<p class="cas-intro">La plupart des patients découvrent un cabinet sur leur téléphone. C'est là que la différence compte le plus.</p>
<div class="cas-telephones">
{fig("avant-mobile-accueil", *t["avant-mobile-accueil"], "Ancien site sur téléphone : en-tête noir, texte gris pâle peu lisible", "Avant", cls=" cas-tel")}
{fig("apres-mobile-accueil", *t["apres-mobile-accueil"], "Nouveau site sur téléphone : photo du lac, nom lisible, bouton Prendre rendez-vous", "Après", True, " cas-tel")}
</div>
</div></section>

<section class="conteneur section">
<h2 class="titre-2">Ce qui a changé</h2>
<div class="cas-cartes">
{carte("La page contact affichait encore une ancienne adresse, différente de celle du cabinet.", "Une seule adresse, 12 avenue Gambetta, sur le site, la fiche Google et les annuaires.")}
{carte("Texte gris pâle sur fond gris, peu lisible, et aucun bouton clair pour prendre rendez-vous.", f"Un style calme et lisible, et un bouton «{NB}Prendre rendez-vous{NB}» sur chaque page, qui lance l'appel.")}
{carte(f"Toutes les pages portaient le même long titre{NB}: Google ne savait pas quoi montrer pour chaque recherche.", "Une page par motif de consultation (addictions, anxiété, burn-out, périnatalité…), chacune avec son titre, et les anciennes adresses redirigées pour garder le référencement.")}
</div>
</section>

<section class="fond-blanc"><div class="conteneur section">
<h2 class="titre-2">Avant, après{NB}: sur ordinateur</h2>
<div class="cas-ordis">
{fig("avant-ordi-accueil", *t["avant-ordi-accueil"], "Ancien site sur ordinateur : bandeau noir et titre presque invisible", "Avant · accueil")}
{fig("apres-ordi-accueil", *t["apres-ordi-accueil"], "Nouveau site sur ordinateur : photo du lac d'Annecy, nom et bouton de rendez-vous", "Après · accueil", True)}
{fig("avant-ordi-contact", *t["avant-ordi-contact"], "Ancienne page contact avec une ancienne adresse", "Avant · contact")}
{fig("apres-ordi-tarifs", *t["apres-ordi-tarifs"], "Nouvelle page Tarifs et accès avec l'adresse du cabinet", "Après · tarifs et accès", True)}
</div>
</div></section>

<section class="conteneur section">
<h2 class="titre-2">Les résultats</h2>
<p class="cas-intro">Le site est en ligne depuis novembre 2026. Les résultats arrivent dans deux à trois mois{NB}: visibilité sur Google, clics vers le site et appels depuis la fiche Google. Je les publierai ici, chiffres réels à l'appui.</p>
</section>

<section class="sombre cas-mot"><div class="conteneur section">
<figure>
<p class="surtitre">Le mot de Caroline</p>
<blockquote>«{NB}Je suis ravie du travail réalisé pour la création de mon site internet. Chris est une personne à l'écoute, très réactive et très professionnelle. Je recommande vivement.{NB}»</blockquote>
<figcaption>Caroline Lillaz, psychologue clinicienne à Annecy</figcaption>
</figure>
</div></section>

<section class="conteneur section cas-fin">
<div>
<h2 class="titre-2">Et votre entreprise, où en est-elle{NB}?</h2>
<p>Un score sur 100 et vos trois priorités, en une minute.</p>
</div>
<a class="bouton bouton-signal" href="/auto-diagnostic">Faire le test gratuit</a>
</section>'''

def caroline_en(D):
    t = D
    return f'''<section class="conteneur section cas-entete">
<p class="surtitre">Case study · Psychology practice, Annecy</p>
<h1 class="titre-1">A reassuring website, and the right address everywhere at last</h1>
<p class="chapo">Caroline Lillaz is a clinical psychologist in Annecy. Her old website was hard to read on a phone and still showed an old address. I rebuilt the site and brought her Google profile and directory listings back into line.</p>
<dl class="cas-faits">
<div><dt>Client</dt><dd>Caroline Lillaz, psychologist</dd></div>
<div><dt>Launched</dt><dd>November 2026</dd></div>
<div><dt>Services</dt><dd>Website, Google profile, directories</dd></div>
</dl>
<p class="cas-actions"><a class="bouton bouton-signal" href="https://www.caroline-lillaz-psychologue.fr/" rel="noopener">See the live site (in French)</a></p>
</section>

<section class="fond-blanc"><div class="conteneur section">
<h2 class="titre-2">Before and after{NB}: on a phone</h2>
<p class="cas-intro">Most patients discover a practice on their phone. That is where the difference matters most.</p>
<div class="cas-telephones">
{fig("avant-mobile-accueil", *t["avant-mobile-accueil"], "Old site on a phone: black header, pale grey text that is hard to read", "Before", cls=" cas-tel")}
{fig("apres-mobile-accueil", *t["apres-mobile-accueil"], "New site on a phone: photo of the lake, clear name, Book an appointment button", "After", True, " cas-tel")}
</div>
</div></section>

<section class="conteneur section">
<h2 class="titre-2">What changed</h2>
<div class="cas-cartes">
{carte("The contact page still showed an old address, different from the practice\'s.", "One address, 12 avenue Gambetta, on the website, the Google profile and the directories.", True)}
{carte("Pale grey text on a grey background, hard to read, and no clear button to book an appointment.", "A calm, readable style, and a Book an appointment button on every page that starts the call.", True)}
{carte("Every page had the same long title, so Google didn\'t know what to show for each search.", "One page per reason for consulting (addictions, anxiety, burnout, perinatal support…), each with its own title, and the old addresses redirected to keep the search rankings.", True)}
</div>
</section>

<section class="fond-blanc"><div class="conteneur section">
<h2 class="titre-2">Before and after{NB}: on a computer</h2>
<div class="cas-ordis">
{fig("avant-ordi-accueil", *t["avant-ordi-accueil"], "Old site on a computer: black banner and a title that is almost invisible", "Before · home")}
{fig("apres-ordi-accueil", *t["apres-ordi-accueil"], "New site on a computer: photo of Lake Annecy, name and appointment button", "After · home", True)}
{fig("avant-ordi-contact", *t["avant-ordi-contact"], "Old contact page showing an old address", "Before · contact")}
{fig("apres-ordi-tarifs", *t["apres-ordi-tarifs"], "New fees and directions page with the practice\'s address", "After · fees and directions", True)}
</div>
</div></section>

<section class="conteneur section">
<h2 class="titre-2">The results</h2>
<p class="cas-intro">The site has been live since November 2026. Results take two to three months to show{NB}: visibility on Google, clicks to the website and calls from the Google profile. I will publish them here, with the real numbers.</p>
</section>

<section class="sombre cas-mot"><div class="conteneur section">
<figure>
<p class="surtitre">In Caroline\'s words</p>
<blockquote>«{NB}Je suis ravie du travail réalisé pour la création de mon site internet. Chris est une personne à l\'écoute, très réactive et très professionnelle. Je recommande vivement.{NB}»</blockquote>
<figcaption>Caroline Lillaz, clinical psychologist in Annecy · “I\'m delighted with the work on my new website. Chris listens, responds quickly and is very professional. I highly recommend him.”</figcaption>
</figure>
</div></section>

<section class="conteneur section cas-fin">
<div>
<h2 class="titre-2">And your business{NB}: where does it stand?</h2>
<p>A score out of 100 and your three priorities, in about a minute.</p>
</div>
<a class="bouton bouton-signal" href="/en/self-check">Run the free check</a>
</section>'''

def generer(page, fil, dims):
    url = '/cas-clients/psychologue-annecy'
    title = 'Création de site pour une psychologue à Annecy · cas client Le Baliseur'
    desc = ("Cas client : création du site de Caroline Lillaz, psychologue à Annecy. Avant / après sur téléphone et ordinateur, "
            "fiche Google et annuaires remis en cohérence.")
    schema = [{"@context": "https://schema.org", "@type": "Article", "headline": "Un site qui rassure, et une adresse enfin juste partout",
               "about": "Création de site pour une psychologue à Annecy", "inLanguage": "fr", "datePublished": "2026-11-10",
               "author": {"@type": "Person", "name": "Chris Elston"}, "publisher": {"@type": "Organization", "name": "Le Baliseur", "url": "https://lebaliseur.fr/"},
               "image": "https://lebaliseur.fr" + IMG + "/apres-ordi-accueil.webp"},
              fil('fr', [('Accueil', '/'), ('Cas client : psychologue à Annecy', url)])]
    url_en = '/en/case-studies/psychologist-annecy'
    p = page('fr', url, url_en, title, desc, caroline(dims), schema)
    schema_en = [dict(schema[0], headline="A reassuring website, and the right address everywhere at last",
                      about="Website design for a psychologist in Annecy", inLanguage="en"),
                 fil('en', [('Home', '/en/'), ('Case study: psychologist in Annecy', url_en)])]
    p_en = page('en', url_en, url, 'Website design for a psychologist in Annecy · Le Baliseur case study',
                "Case study: Caroline Lillaz's new website, a psychologist in Annecy. Before and after on phone and computer, "
                "Google profile and directories brought back into line.", caroline_en(dims), schema_en)
    return [p, p_en]
