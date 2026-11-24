/* Le Baliseur : bulle de discussion (assistant IA).
   La conversation reste dans le navigateur (sessionStorage) ; le serveur n'enregistre rien.
   Le Worker n'ajoute ce script que si l'assistant est activé (voir src/worker.js). */
(function () {
  'use strict';
  if (window.__baliseurAssistant) return;
  window.__baliseurAssistant = true;

  var script = document.currentScript;
  var CLE_TURNSTILE = (script && script.getAttribute('data-turnstile')) || '';
  var en = (document.documentElement.lang || '').slice(0, 2) === 'en';
  var STOCKAGE = 'baliseur-assistant';
  var T = en ? {
    ouvrir: 'Questions? Ask our AI assistant', court: 'Questions?', suite: ' Ask our assistant',
    titre: 'Le Baliseur assistant',
    sous: 'AI assistant · replies in seconds',
    accueil: 'Hello and welcome to Le Baliseur! How can I help you today? Pick a topic below or type your question.',
    place: 'Type your question…',
    envoyer: 'Send',
    fermer: 'Close',
    note: 'AI assistant: answers may contain mistakes. Please don’t share sensitive information. Nothing is stored.',
    test: 'Run my free check',
    rappel: 'Ask Chris to call me back',
    erreur: 'Connection problem. Please try again.',
    nom: 'Your name', entreprise: 'Business', contact: 'Email or phone',
    rgpd: 'I agree to be contacted by Le Baliseur about this request.',
    envoyerForm: 'Send my request', merci: 'Thanks! Chris will get back to you within 24 hours.',
    manque: 'Please fill in all fields and tick the box.',
    nouveau: 'New conversation',
    lienTest: '/en/self-check',
  } : {
    ouvrir: 'Une question ? Demandez à l’assistant', court: 'Une question ?', suite: ' Demandez à l’assistant',
    titre: 'L’assistant du Baliseur',
    sous: 'Assistant IA · réponse en quelques secondes',
    accueil: 'Bonjour et bienvenue chez Le Baliseur ! Comment puis-je vous aider aujourd’hui ? Choisissez un sujet ci-dessous ou écrivez votre question.',
    place: 'Écrivez votre question…',
    envoyer: 'Envoyer',
    fermer: 'Fermer',
    note: 'Assistant IA : ses réponses peuvent contenir des erreurs. Ne partagez pas d’informations sensibles. Rien n’est enregistré.',
    test: 'Faire mon test gratuit',
    rappel: 'Être rappelé par Chris',
    erreur: 'Problème de connexion. Réessayez.',
    nom: 'Votre nom', entreprise: 'Entreprise', contact: 'E-mail ou téléphone',
    rgpd: 'J’accepte d’être recontacté par Le Baliseur au sujet de cette demande.',
    envoyerForm: 'Envoyer ma demande', merci: 'Merci ! Chris vous recontacte sous 24 h.',
    manque: 'Merci de remplir tous les champs et de cocher la case.',
    nouveau: 'Nouvelle conversation',
    lienTest: '/auto-diagnostic',
  };

  // ---------- Styles (autonomes, aux couleurs du site) ----------
  var css = [
    '.ba-bulle{position:fixed;right:20px;bottom:20px;z-index:60;display:flex;align-items:center;gap:10px;border:2px solid #fff;border-radius:999px;padding:12px 18px 12px 14px;background:var(--ardoise,#0E1A26);color:#fff;font:600 15px/1.2 var(--corps,system-ui,sans-serif);box-shadow:0 10px 30px -8px rgba(0,0,0,.55);cursor:pointer}',
    '.ba-bulle:hover{background:var(--nuit-2,#16293A)}',
    '.ba-bulle{opacity:0;transform:translateY(12px);pointer-events:none;transition:opacity .3s ease,transform .3s ease}',
    '.ba-bulle.visible{opacity:1;transform:none;pointer-events:auto}',
    '@media (prefers-reduced-motion:reduce){.ba-bulle{transition:none}}',
    '.ba-bulle svg{width:22px;height:22px;flex:none}',
    '.ba-panneau{position:fixed;right:20px;bottom:20px;z-index:61;width:min(380px,calc(100vw - 24px));height:min(600px,calc(100vh - 40px));display:none;flex-direction:column;background:var(--calcaire,#F4F2ED);color:var(--ardoise,#0E1A26);border:1px solid var(--trait,#DAD6CC);border-radius:14px;overflow:hidden;box-shadow:0 24px 60px -20px rgba(0,0,0,.55);font:400 15px/1.5 var(--corps,system-ui,sans-serif)}',
    '.ba-panneau.ouvert{display:flex}',
    '.ba-tete{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--ardoise,#0E1A26);color:#fff;border-bottom:4px solid var(--signal,#C8322B)}',
    '.ba-tete strong{display:block;font:700 18px/1.1 var(--cond,sans-serif);text-transform:uppercase;letter-spacing:.3px}',
    '.ba-tete small{display:block;color:var(--sur-sombre,#B9C5D0);font-size:12px;margin-top:3px}',
    '.ba-tete .ba-actions{margin-left:auto;display:flex;gap:4px}',
    '.ba-tete button{background:transparent;border:0;color:#fff;cursor:pointer;font-size:13px;padding:6px 8px;border-radius:6px}',
    '.ba-tete button:hover{background:rgba(255,255,255,.12)}',
    '.ba-fil{position:relative;flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}',
    '.ba-msg{max-width:86%;padding:10px 13px;border-radius:12px;white-space:normal;word-wrap:break-word}',
    '.ba-msg.ba-ia{align-self:flex-start;background:#fff;border:1px solid var(--trait,#DAD6CC);border-bottom-left-radius:4px}',
    '.ba-msg.ba-moi{align-self:flex-end;background:var(--sapin,#24405A);color:#fff;border-bottom-right-radius:4px}',
    '.ba-msg a{color:inherit;text-decoration:underline}',
    '.ba-cta{align-self:flex-start;display:inline-block;text-decoration:none;border:0;cursor:pointer;background:var(--signal,#C8322B);color:#fff;font:700 15px/1 var(--cond,sans-serif);text-transform:uppercase;letter-spacing:.4px;padding:12px 16px;border-radius:6px}',
    '.ba-cta:hover{background:var(--rouge-fonce,#9E241E);color:#fff}',
    '.ba-options{align-self:stretch;display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-start}',
    '.ba-option{border:1.5px solid var(--sapin,#24405A);background:#fff;color:var(--sapin,#24405A);border-radius:999px;padding:8px 13px;font:600 14px/1.2 var(--corps,system-ui,sans-serif);cursor:pointer;text-align:left}',
    '.ba-option:hover,.ba-option:focus-visible{background:var(--sapin,#24405A);color:#fff}',
    '.ba-attente{align-self:flex-start;color:var(--gris,#3E4954);font-size:14px;padding:4px 2px}',
    '.ba-form{align-self:stretch;background:#fff;border:1px solid var(--trait,#DAD6CC);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px}',
    '.ba-form input[type=text]{font:inherit;padding:9px 10px;border:1px solid var(--bord-champ,#A9A59B);border-radius:6px;background:#fff;color:inherit}',
    '.ba-form label.ba-case{display:flex;gap:8px;align-items:flex-start;font-size:13px;color:var(--gris,#3E4954)}',
    '.ba-form .ba-err{color:var(--rouge-fonce,#9E241E);font-size:13px;margin:0}',
    '.ba-saisie{display:flex;gap:8px;padding:10px;border-top:1px solid var(--trait,#DAD6CC);background:#fff}',
    '.ba-saisie textarea{flex:1;resize:none;font:inherit;padding:9px 10px;border:1px solid var(--bord-champ,#A9A59B);border-radius:8px;min-height:42px;max-height:120px;color:inherit}',
    '.ba-saisie button{border:0;border-radius:8px;padding:0 14px;background:var(--ardoise,#0E1A26);color:#fff;font-weight:600;cursor:pointer}',
    '.ba-saisie button:disabled{opacity:.5;cursor:wait}',
    '.ba-note{margin:0;padding:6px 12px 10px;font-size:11.5px;color:var(--gris,#3E4954);background:#fff}',
    '@media (max-width:760px){.ba-bulle{bottom:84px;right:12px;padding:10px 14px 10px 12px;font-size:14px}.ba-bulle .ba-long{display:none}.ba-panneau{right:0;bottom:0;width:100vw;height:100dvh;max-height:100vh;border-radius:0;border:0}}',
    '@media print{.ba-bulle,.ba-panneau{display:none!important}}',
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- Éléments ----------
  function el(tag, attrs, texte) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === 'class') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (texte != null) e.textContent = texte;
    return e;
  }

  var bulle = el('button', { class: 'ba-bulle', type: 'button', 'aria-label': T.ouvrir, 'aria-expanded': 'false' });
  bulle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>';
  bulle.appendChild(el('span', null, T.court));

  var panneau = el('section', { class: 'ba-panneau', role: 'dialog', 'aria-label': T.titre });
  var tete = el('div', { class: 'ba-tete' });
  var titres = el('div');
  titres.appendChild(el('strong', null, T.titre));
  titres.appendChild(el('small', null, T.sous));
  tete.appendChild(titres);
  var actions = el('div', { class: 'ba-actions' });
  var btnNouveau = el('button', { type: 'button', title: T.nouveau }, '↺');
  var btnFermer = el('button', { type: 'button', title: T.fermer, 'aria-label': T.fermer }, '✕');
  actions.appendChild(btnNouveau);
  actions.appendChild(btnFermer);
  tete.appendChild(actions);

  var fil = el('div', { class: 'ba-fil', 'aria-live': 'polite' });
  var saisie = el('form', { class: 'ba-saisie' });
  var zone = el('textarea', { rows: '1', placeholder: T.place, 'aria-label': T.place, maxlength: '800' });
  var btnEnvoyer = el('button', { type: 'submit' }, T.envoyer);
  saisie.appendChild(zone);
  saisie.appendChild(btnEnvoyer);
  panneau.appendChild(tete);
  panneau.appendChild(fil);
  panneau.appendChild(saisie);
  panneau.appendChild(el('p', { class: 'ba-note' }, T.note));
  document.body.appendChild(bulle);
  document.body.appendChild(panneau);

  // ---------- Textes des parcours (le site les gère : mêmes réponses à chaque fois) ----------
  var L = function (fr, anglais) { return en ? anglais : fr; };
  var LIENS = {
    test: L('/auto-diagnostic', '/en/self-check'),
    tarifs: L('/tarifs', '/en/pricing'),
    exemples: L('/exemples/', '/en/examples/'),
    cas: L('/cas-clients/psychologue-annecy', '/en/case-studies/psychologist-annecy'),
    fiche: L('/services/fiche-google-ia', '/en/services/google-ai-visibility'),
    site: L('/services/site-vitrine', '/en/services/website'),
    pack: L('/services/pack-lancement', '/en/services/starter-pack'),
    suivi: L('/services/suivi-mensuel', '/en/services/monthly-support'),
  };
  var MENU = [
    ['m:google', L('📍 Ma fiche Google', '📍 My Google profile')],
    ['m:site', L('💻 Un nouveau site internet', '💻 A new website')],
    ['m:ia', L('🤖 Ma visibilité dans les IA', '🤖 My visibility in AI answers')],
    ['m:score', L('📊 Connaître mon score', '📊 Get my score')],
    ['m:tarifs', L('💶 Les tarifs', '💶 Prices')],
    ['m:chris', L('📞 Parler à Chris', '📞 Talk to Chris')],
  ];
  var SUITE = [
    ['a:test', L('📊 Faire le test gratuit', '📊 Run the free check')],
    ['a:rappel', L('📞 Être rappelé', '📞 Get a call back')],
    ['a:menu', L('↩ Autre question', '↩ Something else')],
  ];

  // Fiche Google : 10 questions, 100 points. [libellé FR, libellé EN, points]
  var G = [
    { q: L('Avez-vous revendiqué et validé votre fiche Google (Google Business Profile) ?', 'Is your Google Business Profile claimed and verified?'), max: 15,
      o: [['Oui', 'Yes', 15], ['Je ne sais pas', 'Not sure', 5], ['Je n’ai pas de fiche', 'I don’t have one', -1]],
      g: L('Revendiquez et validez votre fiche : tant que ce n’est pas fait, n’importe qui peut y proposer des modifications.', 'Claim and verify your profile: until you do, anyone can suggest changes to it.') },
    { q: L('Votre catégorie principale est-elle exacte, avec des catégories secondaires ?', 'Is your main category exact, with secondary categories added?'), max: 10,
      o: [['Oui, les deux', 'Yes, both', 10], ['La principale seulement', 'Main one only', 5], ['Je ne sais pas', 'Not sure', 0]],
      g: L('Choisissez la catégorie principale la plus précise possible, puis ajoutez 2 ou 3 catégories secondaires.', 'Pick the most precise main category possible, then add 2 or 3 secondary ones.') },
    { q: L('Vos horaires sont-ils à jour, jours fériés et vacances compris ?', 'Are your hours up to date, including bank holidays and closures?'), max: 10,
      o: [['Oui', 'Yes', 10], ['Horaires habituels seulement', 'Usual hours only', 5], ['Non', 'No', 0]],
      g: L('Ajoutez vos horaires exceptionnels : Google ne vous affichera plus ouvert quand vous êtes fermé.', 'Add special hours so Google never shows you as open when you are closed.') },
    { q: L('Avez-vous ajouté des photos ces 6 derniers mois ?', 'Have you added photos in the last 6 months?'), max: 10,
      o: [['10 ou plus', '10 or more', 10], ['Entre 1 et 9', '1 to 9', 5], ['Aucune', 'None', 0]],
      g: L('Ajoutez une dizaine de photos récentes : devanture, intérieur, équipe et vos plus belles réalisations.', 'Add about ten recent photos: shopfront, inside, team and your best work.') },
    { q: L('Combien d’avis Google avez-vous ?', 'How many Google reviews do you have?'), max: 10,
      o: [['Plus de 50', 'Over 50', 10], ['20 à 50', '20 to 50', 6], ['5 à 19', '5 to 19', 3], ['Moins de 5', 'Under 5', 0]],
      g: L('Demandez un avis à chaque client satisfait, avec un lien direct ou un QR code, sans rien offrir en échange.', 'Ask every happy customer for a review with a direct link or QR code, without offering anything in return.') },
    { q: L('Quelle est votre note moyenne ?', 'What is your average rating?'), max: 10,
      o: [['4,5 ou plus', '4.5 or more', 10], ['Entre 4 et 4,4', '4 to 4.4', 6], ['Moins de 4', 'Under 4', 2], ['Pas encore d’avis', 'No reviews yet', 0]],
      g: L('Répondez calmement aux avis négatifs et invitez vos clients fidèles à partager leur expérience.', 'Reply calmly to negative reviews and invite loyal customers to share their experience.') },
    { q: L('Répondez-vous aux avis, positifs comme négatifs ?', 'Do you reply to reviews, good and bad?'), max: 10,
      o: [['Toujours ou presque', 'Always or nearly', 10], ['Parfois', 'Sometimes', 5], ['Jamais', 'Never', 0]],
      g: L('Répondez à chaque avis sous une semaine : Google et vos futurs clients le remarquent.', 'Reply to every review within a week: Google and future customers both notice.') },
    { q: L('Votre description et la liste de vos services sont-elles remplies ?', 'Are your description and list of services filled in?'), max: 10,
      o: [['Les deux', 'Both', 10], ['L’une des deux', 'One of them', 5], ['Aucune', 'Neither', 0]],
      g: L('Écrivez 2 ou 3 phrases avec vos services et votre ville, et listez vos prestations principales.', 'Write 2 or 3 sentences with your services and town, and list your main services.') },
    { q: L('Votre fiche a-t-elle un lien vers votre site et vers la prise de rendez-vous ?', 'Does your profile link to your website and to booking?'), max: 10,
      o: [['Les deux', 'Both', 10], ['Le site seulement', 'Website only', 5], ['Aucun', 'Neither', 0]],
      g: L('Ajoutez le lien de votre site et de réservation : on peut alors agir directement depuis Google.', 'Add your website and booking links so people can act straight from Google.') },
    { q: L('Avez-vous publié une actualité ou une offre sur votre fiche ce mois-ci ?', 'Have you posted an update or offer on your profile this month?'), max: 5,
      o: [['Oui', 'Yes', 5], ['Non', 'No', 0]],
      g: L('Publiez une actualité ou une offre par mois pour montrer que vous êtes actif.', 'Post one update or offer a month to show you are active.') },
  ];
  var BANDES = [
    [90, L('Excellent', 'Excellent'), L('Votre fiche fait partie des meilleures. L’étape suivante : transformer ces vues en appels et en réservations, avec un site rapide et bien relié à votre fiche.', 'Your profile is among the best. Next step: turning those views into calls and bookings, with a fast website linked to your profile.'), LIENS.site],
    [70, L('Solide', 'Strong'), L('Vous êtes devant la plupart des entreprises locales. Un suivi régulier vous garde en tête : publications, photos et réponses aux avis, dès 49 €/mois.', 'You are ahead of most local businesses. Regular care keeps you there: posts, photos and review replies, from €49/month.'), LIENS.suivi],
    [40, L('En bonne voie', 'Getting there'), L('Les bases sont là, mais vous laissez passer des clients. Une remise au point de la fiche (290 €, Bing, Apple Plans et annuaires compris) fait souvent la différence.', 'The basics are there, but you are missing customers. A profile overhaul (€290, including Bing, Apple Maps and directories) often makes the difference.'), LIENS.fiche],
    [0, L('Peu visible', 'Hard to find'), L('Les clients qui cherchent près de chez vous trouvent sûrement vos concurrents d’abord. La mise en place complète de la fiche (290 €) est le meilleur point de départ.', 'Customers searching nearby probably find your competitors first. A complete profile setup (€290) is the best place to start.'), LIENS.fiche],
  ];

  // ---------- État ----------
  var messages = [];   // {role, content, options?, interne?}
  var etat = {};       // { g: index de la question en cours, r: [points…] }
  try {
    var sauve = JSON.parse(sessionStorage.getItem(STOCKAGE) || '{}') || {};
    if (Array.isArray(sauve)) sauve = { messages: sauve };
    messages = sauve.messages || [];
    etat = sauve.etat || {};
  } catch (e) { messages = []; etat = {}; }
  function sauver() { try { sessionStorage.setItem(STOCKAGE, JSON.stringify({ messages: messages.slice(-40), etat: etat })); } catch (e) {} }

  // Texte -> HTML sûr : échappement, liens vers lebaliseur.fr et chemins du site, retours à la ligne.
  function echapper(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function enHtml(texte) {
    var s = echapper(texte.replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/^#+\s*/gm, ''));
    s = s.replace(/https:\/\/lebaliseur\.fr[^\s<)]*/g, function (u) { return '<a href="' + u + '">' + u.replace('https://', '') + '</a>'; });
    s = s.replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, '<a href="$2">$1</a>');
    return s.replace(/\n/g, '<br>');
  }
  // Codes laissés par l'IA en fin de message : [[TEST|entreprise|ville|activité]], [[RAPPEL]], [[MENU]].
  function separer(texte) {
    var m = texte.match(/\[\[\s*(TEST|RAPPEL|MENU)\s*(?:\|([^|\]]*))?(?:\|([^|\]]*))?(?:\|([^\]]*))?\]\]/i);
    var propre = texte.replace(/\[\[[^\]]*\]\]/g, '').trim();
    if (!m) return { texte: propre };
    return { texte: propre, code: m[1].toUpperCase(), entreprise: (m[2] || '').trim(), ville: (m[3] || '').trim(), activite: (m[4] || '').trim() };
  }
  function lienTest(p) {
    var u = new URL(LIENS.test, location.origin);
    if (p && p.entreprise) u.searchParams.set('business', p.entreprise.slice(0, 120));
    if (p && p.ville) u.searchParams.set('city', p.ville.slice(0, 60));
    if (p && p.activite) u.searchParams.set('category', p.activite.slice(0, 60));
    return u.pathname + u.search;
  }
  function bas() { fil.scrollTop = fil.scrollHeight; }

  // ---------- Affichage ----------
  function boutonTest(p) {
    var a = el('a', { class: 'ba-cta', href: lienTest(p) }, T.test);
    // Le test prend toute la page : la discussion se referme (elle reste sauvegardée).
    a.addEventListener('click', function () { try { sessionStorage.removeItem(STOCKAGE + '-ouvert'); } catch (e) {} });
    return a;
  }
  function afficherIa(m, actif) {
    var p = separer(m.content), b = null;
    if (p.texte) {
      b = el('div', { class: 'ba-msg ba-ia' });
      b.innerHTML = enHtml(p.texte);
      fil.appendChild(b);
    }
    if (p.code === 'TEST') fil.appendChild(boutonTest(p));
    if (actif) {
      var opts = m.options || (p.code === 'RAPPEL' ? [['a:rappel', T.rappel], ['a:menu', SUITE[2][1]]] : p.code === 'MENU' ? MENU : null);
      if (opts) afficherOptions(opts);
    }
    bas();
    // Long message (le score par exemple) : on montre son début plutôt que sa fin.
    if (b && b.offsetHeight > fil.clientHeight - 140) fil.scrollTop = b.offsetTop - 12;
  }
  function afficherOptions(opts) {
    var z = el('div', { class: 'ba-options' });
    opts.forEach(function (o) {
      var b = el('button', { type: 'button', class: 'ba-option' }, o[1]);
      b.addEventListener('click', function () { z.remove(); choisir(o[0], o[1]); });
      z.appendChild(b);
    });
    fil.appendChild(z);
  }
  function afficherMoi(texte) { fil.appendChild(el('div', { class: 'ba-msg ba-moi' }, texte)); bas(); }
  function redessiner() {
    fil.innerHTML = '';
    if (!messages.length) dire(T.accueil, MENU);
    else messages.forEach(function (m, i) { if (m.role === 'user') afficherMoi(m.content); else afficherIa(m, i === messages.length - 1); });
  }
  // Message du site (pas de l'IA), avec des boutons éventuels.
  function dire(texte, options) {
    var m = { role: 'assistant', content: texte };
    if (options) m.options = options;
    messages.push(m);
    sauver();
    afficherIa(m, true);
  }
  function enleverOptions() { Array.prototype.forEach.call(fil.querySelectorAll('.ba-options'), function (z) { z.remove(); }); }

  // ---------- Parcours ----------
  function choisir(id, libelle) {
    enleverOptions();
    messages.push({ role: 'user', content: libelle });
    afficherMoi(libelle);
    var x = id.split(':');
    if (x[0] === 'g') return repondreFiche(+x[1], +x[2]);
    if (x[0] === 's') return parcoursSite(x[1], x[2]);
    if (x[0] === 'i') return parcoursIa(x[1]);
    switch (id) {
      case 'm:google':
        etat.g = 0; etat.r = [];
        dire(L('Voyons où en est votre fiche Google, en 10 questions rapides. Touchez simplement votre réponse.', 'Let’s see where your Google profile stands, in 10 quick questions. Just tap your answer.'));
        return questionFiche();
      case 'm:site':
        return dire(L('Avec plaisir. Avez-vous déjà un site internet ?', 'Happy to help. Do you already have a website?'),
          [['s:existe:oui', L('Oui, à refaire', 'Yes, it needs redoing')], ['s:existe:non', L('Non, pas encore', 'Not yet')]]);
      case 'm:ia':
        return dire(L('De plus en plus de clients demandent à ChatGPT, Gemini ou au mode IA de Google « qui me recommandes-tu à Annecy ? ». Les IA citent les entreprises qu’elles comprennent bien : fiche Google complète, avis, site clair et bien structuré, présence dans les bons annuaires.\nAvez-vous déjà essayé de demander à une IA de recommander une entreprise comme la vôtre ?',
          'More and more customers ask ChatGPT, Gemini or Google’s AI mode “who do you recommend in Annecy?”. AI assistants name the businesses they understand well: a complete Google profile, reviews, a clear, well-built website and listings in the right directories.\nHave you ever asked an AI to recommend a business like yours?'),
          [['i:absent', L('Oui, je n’y suis pas', 'Yes, I’m not mentioned')], ['i:present', L('Oui, j’y suis', 'Yes, I’m mentioned')], ['i:jamais', L('Jamais essayé', 'Never tried')]]);
      case 'm:score':
      case 'a:test':
        return dire(L('Le test gratuit analyse pour de vrai votre fiche Google, votre position sur la carte face à vos concurrents, votre site et ce que répondent les IA. Une minute environ, un score sur 100 et vos trois priorités.[[TEST]]', 'The free check really analyses your Google profile, your position on the map against competitors, your website and what AI assistants answer. About a minute, a score out of 100 and your three priorities.[[TEST]]'), [['a:rappel', T.rappel], ['a:menu', SUITE[2][1]]]);
      case 'm:tarifs':
        return dire(L('Les prix sont affichés, sans surprise :\n• Fiche Google et visibilité dans les IA : 290 €\n• Site une page : 490 € · site vitrine jusqu’à 5 pages : 890 €, fiche Google incluse · refonte dès 590 €\n• Suivi mensuel : 49, 99 ou 179 €/mois, hébergement inclus\n• Pack Lancement (entreprises qui démarrent) : 89 €/mois sur 24 mois, rien à payer au départ, sur dossier\nTout le détail : [la page Tarifs](' + LIENS.tarifs + ').',
          'Prices are shown up front:\n• Google profile and AI visibility: €290\n• One-page site: €490 · business website up to 5 pages: €890, Google profile included · redesign from €590\n• Monthly support: €49, €99 or €179/month, hosting included\n• Starter Pack (new businesses): €89/month over 24 months, nothing to pay upfront, subject to approval\nFull details: [the Pricing page](' + LIENS.tarifs + ').'), SUITE);
      case 'm:chris':
      case 'a:rappel':
        dire(L('Avec plaisir. Laissez vos coordonnées : Chris vous rappelle sous 24 h, gratuitement et sans engagement.', 'Happy to. Leave your details and Chris will call you back within 24 hours, free and with no commitment.'));
        return formulaireRappel();
      case 'a:menu':
        return dire(L('Que puis-je faire d’autre pour vous ? Choisissez un sujet ou écrivez votre question.', 'What else can I help with? Pick a topic or type your question.'), MENU);
    }
  }

  function questionFiche() {
    var i = etat.g, q = G[i];
    dire(L('Question ', 'Question ') + (i + 1) + '/10 · ' + q.q, q.o.map(function (o, j) { return ['g:' + i + ':' + j, en ? o[1] : o[0]]; }));
  }
  function repondreFiche(i, j) {
    if (etat.g !== i || !G[i]) return dire(L('Reprenons depuis le début ?', 'Shall we start again?'), MENU);
    var pts = G[i].o[j][2];
    if (pts < 0) { // Pas de fiche du tout.
      etat.g = null;
      return dire(L('Sans fiche Google, vous n’apparaissez ni sur la carte ni dans les réponses des IA : c’est la première chose à faire. Chris peut la créer et la remplir entièrement (290 €, Bing, Apple Plans et annuaires compris). Voir [le détail](' + LIENS.fiche + ').',
        'Without a Google profile you don’t appear on the map or in AI answers: it’s the first thing to fix. Chris can create and complete it for you (€290, including Bing, Apple Maps and directories). See [the details](' + LIENS.fiche + ').'), SUITE);
    }
    etat.r[i] = pts;
    etat.g = i + 1;
    if (etat.g < G.length) return questionFiche();
    etat.g = null;
    var total = etat.r.reduce(function (a, b) { return a + b; }, 0);
    var bande = BANDES.filter(function (b) { return total >= b[0]; })[0];
    var gains = G.map(function (q, k) { return { k: k, perdu: q.max - etat.r[k] }; })
      .filter(function (x) { return x.perdu > 0; })
      .sort(function (a, b) { return b.perdu - a.perdu; }).slice(0, 3)
      .map(function (x, n) { return (n + 1) + '. ' + G[x.k].g; });
    var texte = L('Votre score : ', 'Your score: ') + total + '/100 · ' + bande[1] + '\n\n' +
      (gains.length ? L('Vos 3 actions les plus rapides :\n', 'Your 3 quickest wins:\n') + gains.join('\n') + '\n\n' : '') +
      bande[2] + ' [' + L('En savoir plus', 'Learn more') + '](' + bande[3] + ')\n\n' +
      L('Ce score repose sur vos réponses. Le test gratuit mesure votre fiche pour de vrai, face à vos concurrents.', 'This score is based on your answers. The free check measures your profile for real, against your competitors.');
    dire(texte, SUITE);
  }

  function parcoursSite(etape, val) {
    etat.site = etat.site || {};
    if (etape === 'existe') {
      etat.site.existe = val;
      return dire(L('Que doit-il faire en priorité ?', 'What should it do first and foremost?'),
        [['s:but:appels', L('Faire appeler', 'Get calls')], ['s:but:resa', L('Prendre des réservations', 'Take bookings')], ['s:but:vitrine', L('Présenter mes services', 'Show my services')], ['s:but:vente', L('Vendre en ligne', 'Sell online')]]);
    }
    if (etape === 'but') {
      etat.site.but = val;
      if (val === 'vente') return dire(L('La vente en ligne demande un devis sur mesure (catalogue, paiement, livraison). Le plus simple : que Chris vous rappelle pour en parler.', 'Selling online needs a tailored quote (catalogue, payment, delivery). The simplest is for Chris to call you back to discuss it.'), SUITE);
      return dire(L('Votre activité démarre-t-elle ?', 'Are you just starting your business?'),
        [['s:debut:oui', L('Oui, je démarre', 'Yes, I’m starting')], ['s:debut:non', L('Non, je suis installé', 'No, I’m established')]]);
    }
    if (etape === 'debut') {
      if (val === 'oui') return dire(L('Le Pack Lancement est fait pour vous : site, fiche Google et suivi, sans rien payer au départ (89 €/mois sur 24 mois, sur dossier). Voir [le Pack Lancement](' + LIENS.pack + ') et [un site réalisé](' + LIENS.cas + ').',
        'The Starter Pack is made for you: website, Google profile and support, with nothing to pay upfront (€89/month over 24 months, subject to approval). See [the Starter Pack](' + LIENS.pack + ') and [a finished site](' + LIENS.cas + ').'), SUITE);
      var refonte = etat.site.existe === 'oui';
      var focus = { appels: L('un bouton d’appel sur chaque page', 'a call button on every page'), resa: L('la réservation en un clic', 'one-tap booking'), vitrine: L('une page par service, bien comprise par Google', 'one page per service, well understood by Google') }[etat.site.but] || '';
      return dire(L('Je vous conseille ' + (refonte ? 'une refonte (dès 590 €) ou ' : '') + 'un site vitrine jusqu’à 5 pages (890 €, fiche Google incluse), pensé pour le téléphone, avec ' + focus + '. Un site une page existe aussi à 490 €. Délai : une à trois semaines. Voir [des exemples](' + LIENS.exemples + ') et [le site de Caroline, psychologue](' + LIENS.cas + ').',
        'I’d suggest ' + (refonte ? 'a redesign (from €590) or ' : '') + 'a business website up to 5 pages (€890, Google profile included), built for phones, with ' + focus + '. A one-page site is also available at €490. Delivery: one to three weeks. See [examples](' + LIENS.exemples + ') and [Caroline’s site, a psychologist](' + LIENS.cas + ').'), SUITE);
    }
  }

  function parcoursIa(val) {
    var debut = {
      absent: L('C’est fréquent, et ça se corrige.', 'That’s common, and it can be fixed.'),
      present: L('Très bien ! Le but est maintenant d’y rester et de passer devant.', 'Great! Now the goal is to stay there and move up.'),
      jamais: L('Essayez : demandez « qui me recommandes-tu pour [votre activité] à [votre ville] ? ».', 'Try it: ask “who do you recommend for [your trade] in [your town]?”.'),
    }[val] || '';
    dire(debut + ' ' + L('Le test gratuit pose la question aux IA pour vous et montre qui elles citent. Pour être recommandé, Chris travaille votre fiche Google, vos avis, les annuaires que les IA consultent et un site qu’elles comprennent (290 € pour la fiche et la visibilité dans les IA). Voir [le détail](' + LIENS.fiche + ').',
      'The free check asks the AIs for you and shows who they name. To get recommended, Chris works on your Google profile, reviews, the directories AIs rely on and a website they understand (€290 for the profile and AI visibility). See [the details](' + LIENS.fiche + ').'), SUITE);
  }

  // ---------- Question libre : envoyée à l'IA ----------
  var occupe = false;
  function envoyer(texte) {
    if (occupe || !texte.trim()) return;
    occupe = true;
    btnEnvoyer.disabled = true;
    enleverOptions();
    etat.g = null;
    messages.push({ role: 'user', content: texte.trim().slice(0, 800) });
    sauver();
    afficherMoi(texte.trim());
    var attente = el('div', { class: 'ba-attente' }, '…');
    fil.appendChild(attente);
    bas();
    var pourIa = messages.map(function (m) { return { role: m.role, content: m.content }; });
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: pourIa, langue: en ? 'en' : 'fr', page: location.pathname }),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        attente.remove();
        if (d.reponse) {
          var m = { role: 'assistant', content: d.reponse };
          if (!/\[\[/.test(d.reponse)) m.options = SUITE;
          messages.push(m); sauver(); afficherIa(m, true);
        } else afficherIa({ content: d.erreur || T.erreur }, false);
      })
      .catch(function () { attente.remove(); afficherIa({ content: T.erreur }, false); })
      .then(function () { occupe = false; btnEnvoyer.disabled = false; zone.focus(); });
  }

  // ---------- Formulaire de rappel (réutilise /api/contact) ----------
  function formulaireRappel() {
    var f = el('form', { class: 'ba-form', novalidate: '' });
    var nom = el('input', { type: 'text', placeholder: T.nom, 'aria-label': T.nom, autocomplete: 'name', maxlength: '120' });
    var ent = el('input', { type: 'text', placeholder: T.entreprise, 'aria-label': T.entreprise, autocomplete: 'organization', maxlength: '160' });
    var con = el('input', { type: 'text', placeholder: T.contact, 'aria-label': T.contact, autocomplete: 'email', maxlength: '160' });
    var caseLbl = el('label', { class: 'ba-case' });
    var rgpd = el('input', { type: 'checkbox' });
    caseLbl.appendChild(rgpd);
    caseLbl.appendChild(el('span', null, T.rgpd));
    var ts = el('div');
    var err = el('p', { class: 'ba-err', role: 'alert' });
    var ok = el('button', { class: 'ba-cta', type: 'submit' }, T.envoyerForm);
    [nom, ent, con, caseLbl, ts, err, ok].forEach(function (x) { f.appendChild(x); });
    fil.appendChild(f);
    bas();
    nom.focus();

    var jeton = '';
    if (CLE_TURNSTILE && window.turnstile) {
      try { window.turnstile.render(ts, { sitekey: CLE_TURNSTILE, size: 'flexible', callback: function (t) { jeton = t; } }); } catch (e) {}
    }

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!nom.value.trim() || !ent.value.trim() || !con.value.trim() || !rgpd.checked) { err.textContent = T.manque; return; }
      ok.disabled = true;
      err.textContent = '';
      var d = new FormData();
      d.append('nom', nom.value);
      d.append('entreprise', ent.value);
      d.append('contact', con.value);
      d.append('besoin', en ? 'Call back (website assistant)' : 'Rappel demandé (assistant du site)');
      d.append('rgpd', 'oui');
      d.append('langue', en ? 'en' : 'fr');
      try { var sc = sessionStorage.getItem('baliseur-score'); if (sc) d.append('score', sc); } catch (x) {}
      if (jeton) d.append('cf-turnstile-response', jeton);
      fetch('/api/contact', { method: 'POST', body: d })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (r) {
          if (r.ok) {
            f.remove();
            dire(T.merci, [['a:menu', SUITE[2][1]]]);
          } else {
            err.textContent = r.erreur || T.erreur;
            ok.disabled = false;
            if (window.turnstile) try { window.turnstile.reset(ts); } catch (x) {}
          }
        })
        .catch(function () { err.textContent = T.erreur; ok.disabled = false; });
    });
  }

  // ---------- Ouverture / fermeture ----------
  function ouvrir() {
    panneau.classList.add('ouvert');
    bulle.style.display = 'none';
    bulle.setAttribute('aria-expanded', 'true');
    bulle.classList.add('visible');
    if (!fil.childNodes.length) redessiner();
    zone.focus();
    try { sessionStorage.setItem(STOCKAGE + '-ouvert', '1'); } catch (e) {}
  }
  function fermer() {
    panneau.classList.remove('ouvert');
    bulle.style.display = '';
    bulle.setAttribute('aria-expanded', 'false');
    bulle.focus();
    try { sessionStorage.removeItem(STOCKAGE + '-ouvert'); } catch (e) {}
  }
  bulle.addEventListener('click', ouvrir);
  // Le bouton apparaît après le premier écran (défilement) ou au bout de 10 secondes, pour laisser l'accroche respirer.
  function montrer() { bulle.classList.add('visible'); window.removeEventListener('scroll', auDefilement); }
  function auDefilement() { if (window.scrollY > 300) montrer(); }
  window.addEventListener('scroll', auDefilement, { passive: true });
  setTimeout(montrer, 10000);
  auDefilement();
  btnFermer.addEventListener('click', fermer);
  btnNouveau.addEventListener('click', function () { messages = []; etat = {}; sauver(); redessiner(); zone.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panneau.classList.contains('ouvert')) fermer(); });
  saisie.addEventListener('submit', function (e) { e.preventDefault(); var v = zone.value; zone.value = ''; envoyer(v); });
  zone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saisie.requestSubmit ? saisie.requestSubmit() : saisie.dispatchEvent(new Event('submit')); }
  });
  // Rouvre le panneau d'une page à l'autre si la discussion était ouverte.
  try { if (sessionStorage.getItem(STOCKAGE + '-ouvert') === '1') ouvrir(); } catch (e) {}
})();
