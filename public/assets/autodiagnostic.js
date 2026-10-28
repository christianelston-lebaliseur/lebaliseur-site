// Auto-diagnostic de visibilité locale (FR / EN). Tout se passe dans le navigateur, rien n'est envoyé.
(function () {
  var racine = document.getElementById('autodiag');
  if (!racine) return;
  var en = (document.documentElement.lang || '').indexOf('en') === 0;

  var Q = [
    { poids: 15, fr: ['Votre fiche Google (Google Business Profile) est-elle revendiquée et validée ?', 'Sans fiche validée, vous n\'apparaissez pas sur la carte, ou avec des informations que vous ne contrôlez pas.', 'Revendiquer et valider votre fiche Google'],
      en: ['Have you claimed and verified your Google Business Profile?', 'Without a verified profile, you either don\'t appear on the map or appear with details you don\'t control.', 'Claim and verify your Google Business Profile'] },
    { poids: 10, fr: ['La catégorie principale et les horaires sont-ils exacts, jours fériés compris ?', 'La catégorie décide des recherches où vous apparaissez ; des horaires faux font fuir les clients.', 'Choisir la bonne catégorie et tenir les horaires à jour'],
      en: ['Are your main category and opening hours correct, including bank holidays?', 'Your category decides which searches you appear in, and wrong hours send customers elsewhere.', 'Pick the right category and keep your hours up to date'] },
    { poids: 5, fr: ['Avez-vous au moins 10 photos de moins de 6 mois sur votre fiche ?', 'Les fiches avec des photos récentes attirent plus de clics et d\'itinéraires.', 'Ajouter des photos récentes de qualité'],
      en: ['Do you have at least 10 photos on your profile taken in the last 6 months?', 'Profiles with recent photos get more clicks and direction requests.', 'Add good, recent photos'] },
    { poids: 15, fr: ['Avez-vous reçu au moins un avis Google ces 3 derniers mois ?', 'Des avis récents rassurent les clients et comptent pour Google.', 'Mettre en place une demande d\'avis simple et régulière'],
      en: ['Have you received at least one Google review in the last 3 months?', 'Recent reviews reassure customers and count for Google.', 'Set up a simple, regular way to ask for reviews'] },
    { poids: 10, fr: ['Répondez-vous aux avis, y compris aux négatifs ?', 'Une réponse montre que vous êtes présent et rassure ceux qui lisent les avis.', 'Répondre à chaque avis, poliment et rapidement'],
      en: ['Do you reply to reviews, including negative ones?', 'A reply shows you\'re there and reassures people reading your reviews.', 'Reply to every review, politely and quickly'] },
    { poids: 15, fr: ['Votre nom, adresse et téléphone sont-ils identiques partout (site, Google, PagesJaunes, réseaux) ?', 'Des informations différentes d\'un annuaire à l\'autre font baisser votre classement sur la carte.', 'Harmoniser nom, adresse et téléphone dans les annuaires'],
      en: ['Are your name, address and phone number identical everywhere (website, Google, directories, social media)?', 'Details that differ between directories pull your map ranking down.', 'Make your name, address and phone match across directories'] },
    { poids: 15, fr: ['Votre site s\'affiche-t-il vite et se lit-il facilement sur téléphone ?', 'La plupart des recherches locales se font sur téléphone ; un site lent perd le client.', 'Rendre le site rapide et lisible sur mobile'],
      en: ['Does your website load quickly and read easily on a phone?', 'Most local searches happen on a phone, and a slow site loses the customer.', 'Make your website fast and easy to read on mobile'] },
    { poids: 5, fr: ['Votre site a-t-il une page par service, avec votre ville dans les titres ?', 'Une page claire par service aide Google à vous proposer pour la bonne recherche.', 'Créer une page par service, avec votre ville'],
      en: ['Does your website have a page for each service, with your town in the titles?', 'A clear page per service helps Google show you for the right search.', 'Create one page per service, mentioning your town'] },
    { poids: 10, fr: ['Si vous demandez à ChatGPT ou Gemini « meilleur [votre métier] à [votre ville] », votre entreprise est-elle citée ?', 'De plus en plus de clients posent la question à une IA, qui ne cite que deux ou trois noms.', 'Être cité par les IA : fiches Bing et Apple, avis sur plusieurs plateformes, pages claires'],
      en: ['If you ask ChatGPT or Gemini "best [your trade] in [your town]", is your business named?', 'More and more customers ask an AI, and it only names two or three businesses.', 'Get named by AI tools: Bing and Apple listings, reviews on several platforms, clear pages'] }
  ];

  var T = en ? {
    oui: 'Yes', non: 'No', nsp: 'Not sure', q: 'Question', sur: 'of',
    voir: 'See my score', recommencer: 'Start again', manque: 'Answer every question to see your score.',
    score: 'Your visibility score', priorites: 'Your three priorities',
    nsp_note: 'You weren\'t sure about some answers. The free audit will check them for you.',
    niveaux: [['Off the trail', 'Customers searching for what you do are very unlikely to find you. The good news: the basics are quick to fix.'],
              ['On the way', 'The basics are there, but competitors are probably ahead of you on the map. A few targeted fixes can change that.'],
              ['Well marked', 'You\'re in good shape. The next gains come from comparing yourself closely with your top competitors.']],
    cta: 'Get my free audit', avertissement: 'Indicative score based on your answers. The free audit checks your real ranking against three competitors.'
  } : {
    oui: 'Oui', non: 'Non', nsp: 'Je ne sais pas', q: 'Question', sur: 'sur',
    voir: 'Voir mon score', recommencer: 'Recommencer', manque: 'Répondez à toutes les questions pour voir votre score.',
    score: 'Votre score de visibilité', priorites: 'Vos trois priorités',
    nsp_note: 'Vous n\'étiez pas sûr de certaines réponses : le diagnostic offert les vérifiera pour vous.',
    niveaux: [['Hors sentier', 'Les clients qui cherchent ce que vous faites ont peu de chances de vous trouver. Bonne nouvelle : les bases se corrigent vite.'],
              ['Sur le chemin', 'Les bases sont là, mais vos concurrents vous devancent sans doute sur la carte. Quelques corrections ciblées peuvent changer la donne.'],
              ['Bien balisé', 'Vous êtes en bonne forme. Les prochains gains viendront d\'une comparaison précise avec vos meilleurs concurrents.']],
    cta: 'Demander mon diagnostic offert', avertissement: 'Score indicatif, calculé à partir de vos réponses. Le diagnostic offert vérifie votre classement réel face à trois concurrents.'
  };

  var form = document.createElement('form');
  form.className = 'autodiag-questions';
  form.noValidate = true;
  Q.forEach(function (q, i) {
    var txt = en ? q.en : q.fr;
    var fs = document.createElement('fieldset');
    fs.className = 'question';
    var lg = document.createElement('legend');
    lg.innerHTML = '<span class="question-num">' + T.q + ' ' + (i + 1) + ' ' + T.sur + ' ' + Q.length + '</span>';
    lg.appendChild(document.createTextNode(txt[0]));
    fs.appendChild(lg);
    var choix = document.createElement('div');
    choix.className = 'choix';
    [['oui', T.oui], ['non', T.non], ['nsp', T.nsp]].forEach(function (c) {
      var l = document.createElement('label');
      l.innerHTML = '<input type="radio" name="q' + i + '" value="' + c[0] + '"><span>' + c[1] + '</span>';
      choix.appendChild(l);
    });
    fs.appendChild(choix);
    form.appendChild(fs);
  });
  var actions = document.createElement('div');
  actions.className = 'autodiag-actions';
  actions.innerHTML = '<button type="submit" class="bouton bouton-sombre">' + T.voir + '</button><p class="statut erreur" role="status" aria-live="polite"></p>';
  form.appendChild(actions);
  racine.appendChild(form);

  var resultat = document.createElement('section');
  resultat.className = 'autodiag-resultat';
  resultat.hidden = true;
  resultat.setAttribute('tabindex', '-1');
  racine.appendChild(resultat);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var reponses = [], manque = false;
    Q.forEach(function (q, i) {
      var r = form.querySelector('input[name="q' + i + '"]:checked');
      if (!r) manque = true;
      reponses.push(r ? r.value : null);
    });
    var statut = form.querySelector('.statut');
    if (manque) { statut.textContent = T.manque; return; }
    statut.textContent = '';

    var score = 0, aCorriger = [], incertain = false;
    Q.forEach(function (q, i) {
      if (reponses[i] === 'oui') score += q.poids;
      else { aCorriger.push(q); if (reponses[i] === 'nsp') incertain = true; }
    });
    aCorriger.sort(function (a, b) { return b.poids - a.poids; });
    var niveau = score >= 80 ? 2 : score >= 50 ? 1 : 0;
    var couleurs = ['#C2410C', '#F2B23A', '#24493A'];

    try { sessionStorage.setItem('baliseur-score', String(score)); } catch (err) {}

    var prio = aCorriger.slice(0, 3).map(function (q) {
      var t = en ? q.en : q.fr;
      return '<li><strong>' + t[2] + '</strong><span>' + t[1] + '</span></li>';
    }).join('');

    resultat.innerHTML =
      '<div class="jauge-entete"><p class="surtitre" style="margin:0">' + T.score + '</p>' +
      '<p class="jauge-score"><span>' + score + '</span>/100</p>' +
      '<p class="jauge-niveau" style="color:' + (niveau === 1 ? '#8A5A00' : couleurs[niveau]) + '">' + T.niveaux[niveau][0] + '</p></div>' +
      '<div class="jauge" role="img" aria-label="' + score + '/100"><div class="jauge-remplie" style="width:' + score + '%;background:' + couleurs[niveau] + '"></div>' +
      '<span class="jauge-repere" style="left:50%"></span><span class="jauge-repere" style="left:80%"></span></div>' +
      '<div class="jauge-legende" aria-hidden="true"><span>' + T.niveaux[0][0] + '</span><span>' + T.niveaux[1][0] + '</span><span>' + T.niveaux[2][0] + '</span></div>' +
      '<p class="jauge-texte">' + T.niveaux[niveau][1] + '</p>' +
      (prio ? '<h2 class="titre-3">' + T.priorites + '</h2><ol class="priorites">' + prio + '</ol>' : '') +
      (incertain ? '<p class="jauge-note">' + T.nsp_note + '</p>' : '') +
      '<div class="autodiag-actions"><a class="bouton bouton-signal" href="' + (en ? '/en/#audit' : '/#diagnostic') + '">' + T.cta + '</a>' +
      '<button type="button" class="bouton bouton-contour" id="recommencer">' + T.recommencer + '</button></div>' +
      '<p class="jauge-note">' + T.avertissement + '</p>';
    resultat.hidden = false;
    resultat.focus();
    resultat.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('recommencer').addEventListener('click', function () {
      form.reset();
      resultat.hidden = true;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
