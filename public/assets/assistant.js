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
    accueil: "Hello! I'm Le Baliseur's AI assistant. Ask me anything about your Google profile, getting found locally or in AI answers. What kind of business do you run, and where?",
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
    accueil: 'Bonjour ! Je suis l’assistant IA du Baliseur. Posez-moi vos questions sur votre fiche Google, votre visibilité locale ou dans les IA. Quelle est votre activité, et dans quelle ville ?',
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
    '.ba-fil{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}',
    '.ba-msg{max-width:86%;padding:10px 13px;border-radius:12px;white-space:normal;word-wrap:break-word}',
    '.ba-msg.ba-ia{align-self:flex-start;background:#fff;border:1px solid var(--trait,#DAD6CC);border-bottom-left-radius:4px}',
    '.ba-msg.ba-moi{align-self:flex-end;background:var(--sapin,#24405A);color:#fff;border-bottom-right-radius:4px}',
    '.ba-msg a{color:inherit;text-decoration:underline}',
    '.ba-cta{align-self:flex-start;display:inline-block;text-decoration:none;border:0;cursor:pointer;background:var(--signal,#C8322B);color:#fff;font:700 15px/1 var(--cond,sans-serif);text-transform:uppercase;letter-spacing:.4px;padding:12px 16px;border-radius:6px}',
    '.ba-cta:hover{background:var(--rouge-fonce,#9E241E);color:#fff}',
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

  // ---------- État ----------
  var messages = [];
  try { messages = JSON.parse(sessionStorage.getItem(STOCKAGE) || '[]') || []; } catch (e) { messages = []; }
  function sauver() { try { sessionStorage.setItem(STOCKAGE, JSON.stringify(messages.slice(-30))); } catch (e) {} }

  // Texte de l'IA -> HTML sûr : échappement, liens vers lebaliseur.fr seulement, retours à la ligne.
  function echapper(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function enHtml(texte) {
    var s = echapper(texte.replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/^#+\s*/gm, ''));
    s = s.replace(/https:\/\/lebaliseur\.fr[^\s<)]*/g, function (u) { return '<a href="' + u + '">' + u.replace('https://', '') + '</a>'; });
    return s.replace(/\n/g, '<br>');
  }

  // Code bouton en fin de message : [[TEST|entreprise|ville]] ou [[RAPPEL]].
  function separer(texte) {
    var m = texte.match(/\[\[\s*(TEST|RAPPEL)\s*(?:\|([^|\]]*))?(?:\|([^|\]]*))?(?:\|([^\]]*))?\]\]/i);
    var propre = texte.replace(/\[\[[^\]]*\]\]/g, '').trim();
    if (!m) return { texte: propre };
    return { texte: propre, bouton: m[1].toUpperCase(), entreprise: (m[2] || '').trim(), ville: (m[3] || '').trim(), activite: (m[4] || '').trim() };
  }

  function bas() { fil.scrollTop = fil.scrollHeight; }

  function afficherIa(texte, actif) {
    var p = separer(texte);
    if (p.texte) {
      var b = el('div', { class: 'ba-msg ba-ia' });
      b.innerHTML = enHtml(p.texte);
      fil.appendChild(b);
    }
    if (p.bouton === 'TEST') {
      var u = new URL(T.lienTest, location.origin);
      if (p.entreprise) u.searchParams.set('business', p.entreprise.slice(0, 120));
      if (p.ville) u.searchParams.set('city', p.ville.slice(0, 60));
      if (p.activite) u.searchParams.set('category', p.activite.slice(0, 60));
      var lien = el('a', { class: 'ba-cta', href: u.pathname + u.search }, T.test);
      // Le test prend toute la page : la discussion se referme (elle reste sauvegardée).
      lien.addEventListener('click', function () { try { sessionStorage.removeItem(STOCKAGE + '-ouvert'); } catch (e) {} });
      fil.appendChild(lien);
    } else if (p.bouton === 'RAPPEL' && actif) {
      var c = el('button', { class: 'ba-cta', type: 'button' }, T.rappel);
      c.addEventListener('click', function () { c.remove(); formulaireRappel(); });
      fil.appendChild(c);
    }
    bas();
  }
  function afficherMoi(texte) {
    fil.appendChild(el('div', { class: 'ba-msg ba-moi' }, texte));
    bas();
  }

  function redessiner() {
    fil.innerHTML = '';
    afficherIa(T.accueil, false);
    messages.forEach(function (m, i) {
      if (m.role === 'user') afficherMoi(m.content);
      else afficherIa(m.content, i === messages.length - 1);
    });
  }

  // ---------- Envoi d'un message ----------
  var occupe = false;
  function envoyer(texte) {
    if (occupe || !texte.trim()) return;
    occupe = true;
    btnEnvoyer.disabled = true;
    messages.push({ role: 'user', content: texte.trim().slice(0, 800) });
    sauver();
    afficherMoi(texte.trim());
    var attente = el('div', { class: 'ba-attente' }, '…');
    fil.appendChild(attente);
    bas();
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages, langue: en ? 'en' : 'fr', page: location.pathname }),
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        attente.remove();
        var rep = d.reponse || d.erreur || T.erreur;
        if (d.reponse) { messages.push({ role: 'assistant', content: rep }); sauver(); }
        afficherIa(rep, true);
      })
      .catch(function () { attente.remove(); afficherIa(T.erreur, false); })
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
            messages.push({ role: 'assistant', content: T.merci });
            sauver();
            afficherIa(T.merci, false);
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
  btnNouveau.addEventListener('click', function () { messages = []; sauver(); redessiner(); zone.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panneau.classList.contains('ouvert')) fermer(); });
  saisie.addEventListener('submit', function (e) { e.preventDefault(); var v = zone.value; zone.value = ''; envoyer(v); });
  zone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saisie.requestSubmit ? saisie.requestSubmit() : saisie.dispatchEvent(new Event('submit')); }
  });
  // Rouvre le panneau d'une page à l'autre si la discussion était ouverte.
  try { if (sessionStorage.getItem(STOCKAGE + '-ouvert') === '1') ouvrir(); } catch (e) {}
})();
