// Envoi du formulaire de diagnostic sans recharger la page (FR / EN).
(function () {
  var form = document.getElementById('form-diagnostic');
  if (!form) return;
  var statut = document.getElementById('statut');
  var bouton = form.querySelector('button[type="submit"]');
  var en = (document.documentElement.lang || '').indexOf('en') === 0;

  var t = en ? {
    manque: 'Please fill in your name, business and a way to contact you, and tick the box.',
    envoi: 'Sending…',
    ok: "Thank you! Your request has been sent. I'll reply within 48 hours.",
    echec: "Sending didn't work. Please email me at chris@lebaliseur.fr."
  } : {
    manque: 'Merci de remplir votre nom, votre entreprise, un moyen de contact et de cocher la case.',
    envoi: 'Envoi en cours…',
    ok: 'Merci ! Votre demande est bien partie. Je vous réponds sous 48 h.',
    echec: "L'envoi n'a pas abouti. Écrivez-moi directement à chris@lebaliseur.fr."
  };

  function afficher(message, type) {
    statut.textContent = message;
    statut.className = 'statut large ' + type;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      afficher(t.manque, 'erreur');
      form.reportValidity();
      return;
    }
    bouton.disabled = true;
    afficher(t.envoi, '');
    var donnees = new FormData(form);
    try { var sc = sessionStorage.getItem('baliseur-score'); if (sc) donnees.append('score', sc); } catch (err) {}
    fetch(form.action, { method: 'POST', body: donnees, headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          afficher(t.ok, 'ok');
        } else {
          afficher(en ? t.echec : (res.d.erreur || t.echec), 'erreur');
        }
      })
      .catch(function () { afficher(t.echec, 'erreur'); })
      .finally(function () { bouton.disabled = false; });
  });
})();
