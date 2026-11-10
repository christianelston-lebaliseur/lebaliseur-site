# Pages « Cas clients » (FR), appelées par generer-pages.py.
# Captures dans public/assets/cas-clients/<slug>/ (webp), produites par outils/captures_cas_clients.py.
import re

NB = '&nbsp;'
IMG = '/assets/cas-clients/psychologue-annecy'

def fig(src, w, h, alt, legende, apres=False, cls=''):
    return (f'<figure class="cas-capture{cls}"><img src="{IMG}/{src}.webp" width="{w}" height="{h}" alt="{alt}" loading="lazy" decoding="async">'
            f'<figcaption{" class=\"cas-apres\"" if apres else ""}>{legende}</figcaption></figure>')

def carte(probleme, fait):
    return (f'<article class="cas-carte"><p class="cas-libelle">Le problème</p><p>{probleme}</p>'
            f'<p class="cas-libelle cas-apres">Ce que j\'ai fait</p><p>{fait}</p></article>')

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
    p = page('fr', url, '/en/', title, desc, caroline(dims), schema)
    # Page en français seulement : pas d'alternative anglaise déclarée.
    s = open(p).read()
    s = re.sub(r'<link rel="alternate" hreflang="en"[^>]*>\n', '', s)
    open(p, 'w').write(s)
    return [p]
