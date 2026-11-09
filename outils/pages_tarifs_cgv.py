# Pages « Tarifs » et « Conditions générales » (FR/EN), appelées par generer-pages.py.
# Une seule source pour les prix : modifier ici, puis relancer outils/generer-pages.py.

def lignes(rows):
    return ''.join('<tr>' + ''.join(f'<td>{c}</td>' if i else f'<th scope="row">{c}</th>' for i, c in enumerate(r)) + '</tr>\n' for r in rows)

def tableau(caption, head, rows, accent=True):
    th = ''.join(f'<th scope="col">{h}</th>' for h in head)
    return (f'<div class="tableau-prix{"" if accent else " sans-accent"}"><table>\n<caption>{caption}</caption>\n<thead><tr>{th}</tr></thead>\n'
            f'<tbody>\n{lignes(rows)}</tbody>\n</table></div>')

NB = '&nbsp;'

TARIFS = {
'fr': dict(url='/tarifs', other='/en/pricing', court='Tarifs',
  title='Tarifs : création de site, fiche Google et suivi à Annecy · Le Baliseur',
  desc="Tous les prix du Baliseur : sites dès 490 €, fiche Google et IA 290 €, suivi dès 49 €/mois ou 350 €/an, hébergement inclus. −30 % pour les dix premiers clients.",
  body=lambda: f'''<section class="conteneur section legal tarifs">
<h1 class="titre-1">Tarifs</h1>
<p class="chapo">Des prix affichés, sans frais cachés. Tout est à votre nom&nbsp;: domaine, site, fiche Google et comptes. TVA non applicable, art. 293 B du CGI.</p>
<p class="encart-lancement"><strong>Tarif de lancement&nbsp;: −30{NB}% sur votre première prestation</strong> pour les dix premiers clients (site, visibilité ou réseaux sociaux), en échange d'un témoignage sincère.</p>
<h2>Sites internet</h2>
{tableau("Création de sites internet", ["Formule", "Ce qui est compris", "Prix", f"Lancement −30{NB}%"], [
  ["Site une page", "Une page complète, formulaire de contact, lien vers votre fiche Google", f"490{NB}€", f"340{NB}€"],
  ["Site vitrine", "Jusqu'à 5 pages, pack Visibilité Google &amp; IA inclus, 3 mois de suivi inclus", f"890{NB}€", f"620{NB}€"],
  ["Site sur mesure", "Jusqu'à 10 pages, design sur mesure, pack Visibilité Google &amp; IA inclus", f"dès 1{NB}290{NB}€", f"dès 900{NB}€"],
  ["Refonte", "Nouveau design pour un site existant, contenus repris", f"dès 590{NB}€", f"dès 410{NB}€"],
  ["Version anglaise", "Tout le site en anglais, pour les touristes, expatriés et frontaliers", f"+300{NB}€", f"+210{NB}€"],
])}
<p>Sur devis&nbsp;: réservation en ligne, boutique, espace membres, langues supplémentaires, rédaction importante. Création de logo en option, sur devis.</p>
<h2>Visibilité et réseaux sociaux</h2>
{tableau("Prestations ponctuelles", ["Prestation", "Ce qui est compris", "Prix", f"Lancement −30{NB}%"], [
  ["Visibilité Google &amp; IA", "Fiche Google complète et optimisée, fiches Bing et Apple Plans, mêmes coordonnées dans les annuaires", f"290{NB}€", f"200{NB}€"],
  ["Réseaux sociaux", "Facebook, Instagram et LinkedIn remis au point, modèles à vos couleurs", f"250{NB}€", f"180{NB}€"],
  ["Kit de publications", "Publications du mois prêtes à poster, en français et en anglais", f"dès 99{NB}€/mois", "—"],
])}
<h2>Suivis</h2>
{tableau("Formules de suivi", ["Formule", "Ce qui est compris", "Prix", "Engagement"], accent=False, rows=[
  ["Essentiel", "Une séance de mise à jour par mois (jusqu'à 1 heure), vérifications techniques, indexation Google", f"49{NB}€/mois", "Aucun, préavis d'un mois"],
  ["Visibilité", "Essentiel + gestion de la fiche Google, aide aux avis, suivi de votre visibilité Google et IA, bilan mensuel", f"99{NB}€/mois", "3 mois, puis mois par mois"],
  ["Croissance", "Visibilité + deux séances d'amélioration par mois, nouveaux contenus, veille concurrence, réseaux sociaux", f"179{NB}€/mois", "3 mois, puis mois par mois"],
  ["Suivi annuel", "Quatre interventions dans l'année, revue SEO et indexation chaque trimestre, visibilité dans les IA", f"350{NB}€/an", "12 mois, payés d'avance"],
])}
<p><strong>Inclus dans tous les suivis&nbsp;:</strong> l'hébergement de votre site, et un changement d'identité par an (nouveau logo, couleurs, typographies, photos et textes des pages existantes appliqués à votre site, votre fiche Google et vos réseaux). Une refonte complète, de nouvelles pages ou de nouvelles fonctions restent sur devis.</p>
<h2>Pack Lancement</h2>
<p>Pour les entreprises qui se créent&nbsp;: site, fiche Google et suivi, <strong>0{NB}€ au départ</strong>, puis 89{NB}€ par mois sur 24 mois (2{NB}136{NB}€ au total). Sur dossier, trois places par trimestre. Non cumulable avec le tarif de lancement. <a href="/services/pack-lancement">Découvrir le pack</a></p>
<h2>Conditions</h2>
<p>Sites et prestations ponctuelles&nbsp;: 50{NB}% à la commande, 50{NB}% à la livraison. Suivis&nbsp;: chaque mois, ou une fois par an pour le suivi annuel. Le détail est dans les <a href="/conditions-generales">conditions générales</a>.</p>
<p><a class="bouton bouton-signal" href="/#diagnostic">Demander mon diagnostic offert</a></p>
</section>'''),
'en': dict(url='/en/pricing', other='/tarifs', court='Pricing',
  title='Pricing: websites, Google profile and support in Annecy · Le Baliseur',
  desc='All Le Baliseur prices: websites from €490, Google & AI visibility €290, support from €49/month or €350/year, hosting included. 30% off for the first ten clients.',
  body=lambda: f'''<section class="conteneur section legal tarifs">
<h1 class="titre-1">Pricing</h1>
<p class="chapo">Prices shown upfront, with no hidden fees. Everything is in your name: domain, website, Google profile and accounts. VAT not applicable, art. 293 B of the French tax code.</p>
<p class="encart-lancement"><strong>Launch price: 30% off your first service</strong> for the first ten clients (website, visibility or social media), in exchange for an honest testimonial.</p>
<h2>Websites</h2>
{tableau("Website packages", ["Package", "What's included", "Price", "Launch −30%"], [
  ["One-page site", "One full page, contact form, link to your Google profile", "€490", "€340"],
  ["Business website", "Up to 5 pages, Google &amp; AI visibility pack included, 3 months of support included", "€890", "€620"],
  ["Bespoke website", "Up to 10 pages, bespoke design, Google &amp; AI visibility pack included", "from €1,290", "from €900"],
  ["Redesign", "New design for an existing site, content carried over", "from €590", "from €410"],
  ["English version", "The whole site in a second language", "+€300", "+€210"],
])}
<p>Quoted separately: online booking, shops, member areas, extra languages, substantial copywriting. Logo design available as an option, quoted separately.</p>
<h2>Visibility and social media</h2>
{tableau("One-off services", ["Service", "What's included", "Price", "Launch −30%"], [
  ["Google &amp; AI visibility", "Complete, optimised Google profile, Bing and Apple Maps listings, consistent directory details", "€290", "€200"],
  ["Social media", "Facebook, Instagram and LinkedIn sorted, templates in your colours", "€250", "€180"],
  ["Content kit", "Monthly posts ready to publish, in English and French", "from €99/month", "—"],
])}
<h2>Support plans</h2>
{tableau("Support plans", ["Plan", "What's included", "Price", "Commitment"], accent=False, rows=[
  ["Essential", "One update session a month (up to 1 hour), technical checks, Google indexing", "€49/month", "None, one month's notice"],
  ["Visibility", "Essential + Google profile management, review support, Google and AI visibility tracking, monthly report", "€99/month", "3 months, then month to month"],
  ["Growth", "Visibility + two improvement sessions a month, new content, competitor watch, social media", "€179/month", "3 months, then month to month"],
  ["Yearly support", "Four sessions a year, quarterly SEO and indexing review, AI visibility check", "€350/year", "12 months, paid upfront"],
])}
<p><strong>Included in every plan:</strong> hosting for your website, and one rebrand a year (a new logo, colours, fonts, photos and text on existing pages, applied to your site, Google profile and social media). A complete rebuild, new pages or new features are quoted separately.</p>
<h2>Starter pack</h2>
<p>For new businesses: website, Google profile and support, <strong>€0 upfront</strong>, then €89 a month over 24 months (€2,136 in total). By application, three places per quarter. Cannot be combined with the launch price. <a href="/en/services/starter-pack">See the pack</a></p>
<h2>Terms</h2>
<p>Websites and one-off services: 50% on order, 50% on delivery. Support: monthly, or yearly for the yearly plan. Full details in the <a href="/en/terms">terms of service</a>.</p>
<p><a class="bouton bouton-signal" href="/en/#audit">Get my free audit</a></p>
</section>'''),
}

MEDIATEUR_FR = "[À COMPLÉTER : nom et site du médiateur de la consommation]"
MEDIATEUR_EN = "[TO COMPLETE: name and website of the consumer mediator]"

CGV = {
'fr': dict(url='/conditions-generales', other='/en/terms', court='Conditions générales',
  title='Conditions générales de prestation · Le Baliseur',
  desc='Conditions générales de prestation de services du Baliseur : devis, prix, paiement, suivis, hébergement, propriété du site.',
  body=lambda: f'''<section class="conteneur section legal">
<h1 class="titre-1">Conditions générales de prestation</h1>
<p>En vigueur au 1<sup>er</sup> décembre 2026.</p>
<h2>1. Objet</h2>
<p>Les présentes conditions s'appliquent à toutes les prestations du Baliseur&nbsp;: création et refonte de sites internet, visibilité sur Google et dans les outils d'intelligence artificielle, réseaux sociaux, suivis mensuels et annuels, Pack Lancement. Le devis accepté et ses éventuelles conditions particulières prévalent sur les présentes conditions.</p>
<h2>2. Prestataire</h2>
<p>Chris Elston, entrepreneur individuel (micro-entreprise), nom commercial Le Baliseur, 1 parc de Provins, 74940 Annecy-le-Vieux. SIREN 881 403 604. <a href="mailto:chris@lebaliseur.fr">chris@lebaliseur.fr</a>, 06 03 44 27 46.</p>
<h2>3. Devis et commande</h2>
<p>Chaque prestation fait l'objet d'un devis gratuit, valable 30 jours. La commande est ferme à l'acceptation écrite du devis (signature ou e-mail) et, pour les sites et prestations ponctuelles, au paiement de l'acompte.</p>
<h2>4. Prix</h2>
<p>Les prix sont ceux de la page <a href="/tarifs">Tarifs</a> au jour du devis, en euros. TVA non applicable, art. 293 B du CGI. Le prix indiqué sur le devis accepté est ferme.</p>
<h2>5. Paiement</h2>
<p>Sites et prestations ponctuelles&nbsp;: 50{NB}% à la commande, 50{NB}% à la livraison. Suivis mensuels&nbsp;: chaque mois, d'avance. Suivi annuel&nbsp;: en une fois, d'avance. Les factures sont payables par virement ou prélèvement dans les 15 jours suivant leur date. Aucun escompte n'est accordé pour paiement anticipé.</p>
<p>Tout retard de paiement entraîne des pénalités au taux de trois fois le taux d'intérêt légal, exigibles sans rappel, ainsi que, pour les clients professionnels, une indemnité forfaitaire de 40{NB}€ pour frais de recouvrement (art. L441-10 et D441-5 du Code de commerce). En cas de retard de plus de 30 jours, les prestations en cours peuvent être suspendues après relance.</p>
<h2>6. Délais et collaboration</h2>
<p>Les délais (1 à 3 semaines pour un site selon le projet) courent à partir de la réception des contenus nécessaires&nbsp;: textes, photos, accès aux comptes. Le client s'engage à les fournir et à répondre aux propositions dans un délai raisonnable&nbsp;; un retard de sa part décale d'autant la livraison.</p>
<h2>7. Retours et changements pendant la création</h2>
<p>Pendant la création d'un site, les retours et changements de direction du client sont inclus, dans le périmètre du devis (nombre de pages et fonctions prévues). L'ajout de pages ou de fonctions non prévues fait l'objet d'un devis complémentaire.</p>
<h2>8. Suivis</h2>
<p>Une séance de mise à jour correspond à une heure de travail au plus, demandée par e-mail et réalisée sous cinq jours ouvrés. Les séances non utilisées sont reportables dans le même trimestre, puis perdues. Les suivis Visibilité et Croissance comportent un engagement de trois mois, puis se poursuivent mois par mois&nbsp;; ils sont résiliables avec un préavis d'un mois, par e-mail. Le suivi Essentiel est sans engagement. Le suivi annuel porte sur douze mois.</p>
<p>Tout suivi en cours inclut un changement d'identité par période de douze mois&nbsp;: application au site existant, à la fiche Google et aux réseaux d'un nouveau logo, de nouvelles couleurs, typographies et photos, et mise à jour des textes des pages existantes. La création d'un logo, une refonte complète, de nouvelles pages ou de nouvelles fonctions font l'objet d'un devis.</p>
<h2>9. Hébergement et nom de domaine</h2>
<p>L'hébergement du site est inclus tant qu'un suivi est en cours. Le nom de domaine est enregistré au nom du client, qui en règle le renouvellement. À l'arrêt du suivi, le site est transféré sur un compte au nom du client, sans frais.</p>
<h2>10. Propriété</h2>
<p>Après paiement complet, le site, les contenus créés pour le client et les comptes ouverts à son nom (Google, réseaux sociaux, hébergement) lui appartiennent. Le client garantit disposer des droits sur les textes, photos et logos qu'il fournit. Le Baliseur peut citer la réalisation comme référence, sauf refus écrit du client.</p>
<h2>11. Tarif de lancement et Pack Lancement</h2>
<p>Le tarif de lancement (−30{NB}% sur la première prestation ponctuelle) est réservé aux dix premiers clients, en échange d'un témoignage sincère et de l'autorisation de présenter les résultats. Le Pack Lancement est accordé sur dossier, pour 24 mois&nbsp;; ses conditions de sortie anticipée figurent dans le contrat du pack. Les deux offres ne sont pas cumulables.</p>
<h2>12. Responsabilité</h2>
<p>Le Baliseur est tenu d'une obligation de moyens. Le classement sur Google et la mention par les outils d'intelligence artificielle dépendent de services tiers&nbsp;: aucune position ne peut être garantie. Le Baliseur n'est pas responsable des interruptions ou changements de ces services tiers.</p>
<h2>13. Clients particuliers</h2>
<p>Le client particulier dispose d'un délai de rétractation de quatorze jours à compter de la commande conclue à distance ou hors établissement. S'il demande expressément que la prestation commence avant la fin de ce délai, il paie la part déjà réalisée en cas de rétractation. En cas de litige, il peut recourir gratuitement au médiateur de la consommation&nbsp;: {MEDIATEUR_FR}.</p>
<h2>14. Données personnelles</h2>
<p>Voir la page <a href="/confidentialite">Confidentialité</a>.</p>
<h2>15. Droit applicable</h2>
<p>Les présentes conditions sont soumises au droit français. Pour les clients professionnels, tout litige relève des tribunaux d'Annecy, après une tentative de règlement amiable.</p>
</section>'''),
'en': dict(url='/en/terms', other='/conditions-generales', court='Terms of service',
  title='Terms of service · Le Baliseur',
  desc="Le Baliseur's terms of service: quotes, prices, payment, support plans, hosting and ownership of your website.",
  body=lambda: f'''<section class="conteneur section legal">
<h1 class="titre-1">Terms of service</h1>
<p>In force from 1 December 2026. The French version, <a href="/conditions-generales" lang="fr">Conditions générales de prestation</a>, is the legally binding one.</p>
<h2>1. Scope</h2>
<p>These terms apply to all Le Baliseur services: website design and redesign, visibility on Google and in AI tools, social media, monthly and yearly support, and the starter pack. An accepted quote and any specific terms in it take precedence over these terms.</p>
<h2>2. Provider</h2>
<p>Chris Elston, sole trader (micro-entreprise), trading as Le Baliseur, 1 parc de Provins, 74940 Annecy-le-Vieux, France. SIREN 881 403 604. <a href="mailto:chris@lebaliseur.fr">chris@lebaliseur.fr</a>, +33 6 03 44 27 46.</p>
<h2>3. Quotes and orders</h2>
<p>Every service starts with a free quote, valid for 30 days. An order is confirmed when the quote is accepted in writing (signature or email) and, for websites and one-off services, when the deposit is paid.</p>
<h2>4. Prices</h2>
<p>Prices are those on the <a href="/en/pricing">Pricing</a> page on the date of the quote, in euros. VAT not applicable, art. 293 B of the French tax code. The price on an accepted quote is fixed.</p>
<h2>5. Payment</h2>
<p>Websites and one-off services: 50% on order, 50% on delivery. Monthly support: each month, in advance. Yearly support: once, in advance. Invoices are payable by bank transfer or direct debit within 15 days of their date. No discount is given for early payment.</p>
<p>Late payment incurs penalties at three times the French statutory interest rate, payable without reminder, and, for business clients, a fixed €40 recovery fee (art. L441-10 and D441-5 of the French Commercial Code). If payment is more than 30 days late, ongoing work may be paused after a reminder.</p>
<h2>6. Timing and cooperation</h2>
<p>Lead times (1 to 3 weeks for a website, depending on the project) start once the necessary content is received: text, photos, account access. The client agrees to provide these and to reply to proposals within a reasonable time; any delay on their side moves delivery back accordingly.</p>
<h2>7. Feedback and changes during the build</h2>
<p>While a website is being built, the client's feedback and changes of direction are included, within the scope of the quote (number of pages and planned features). Extra pages or features are quoted separately.</p>
<h2>8. Support plans</h2>
<p>An update session means up to one hour of work, requested by email and done within five working days. Unused sessions can be carried over within the same quarter, then lapse. The Visibility and Growth plans have a three-month minimum, then continue month to month; they can be cancelled with one month's notice by email. The Essential plan has no commitment. The yearly plan runs for twelve months.</p>
<p>Every active plan includes one rebrand per twelve-month period: applying a new logo, colours, fonts and photos to the existing site, Google profile and social media, and updating the text on existing pages. Logo design, a complete rebuild, new pages or new features are quoted separately.</p>
<h2>9. Hosting and domain name</h2>
<p>Website hosting is included while a support plan is active. The domain name is registered in the client's name, and the client pays for its renewal. When support ends, the website is transferred to an account in the client's name, free of charge.</p>
<h2>10. Ownership</h2>
<p>Once paid in full, the website, the content created for the client and the accounts opened in their name (Google, social media, hosting) belong to the client. The client confirms they hold the rights to the text, photos and logos they supply. Le Baliseur may show the work as a reference unless the client objects in writing.</p>
<h2>11. Launch price and starter pack</h2>
<p>The launch price (30% off the first one-off service) is reserved for the first ten clients, in exchange for an honest testimonial and permission to publish their results. The starter pack is granted by application, for 24 months; its early-exit terms are set out in the pack contract. The two offers cannot be combined.</p>
<h2>12. Liability</h2>
<p>Le Baliseur has a best-efforts obligation. Rankings on Google and mentions by AI tools depend on third-party services: no position can be guaranteed. Le Baliseur is not liable for outages or changes to those third-party services.</p>
<h2>13. Private customers</h2>
<p>Private customers have fourteen days to withdraw from an order made at a distance or off premises. If they expressly ask for work to start before that period ends, they pay for the part already done if they withdraw. In a dispute, they can use the consumer mediator free of charge: {MEDIATEUR_EN}.</p>
<h2>14. Personal data</h2>
<p>See the <a href="/en/privacy">Privacy</a> page.</p>
<h2>15. Governing law</h2>
<p>These terms are governed by French law. For business clients, any dispute falls under the courts of Annecy, after an attempt at amicable settlement.</p>
</section>'''),
}

def generer(page, fil):
    made = []
    for jeu in (TARIFS, CGV):
        for lang in ('fr', 'en'):
            d = jeu[lang]
            home = ('Accueil', '/') if lang == 'fr' else ('Home', '/en/')
            made.append(page(lang, d['url'], d['other'], d['title'], d['desc'], d['body'](), [fil(lang, [home, (d['court'], d['url'])])], current=d['url']))
    return made
