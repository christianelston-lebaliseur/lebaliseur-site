// Envoi du formulaire de diagnostic sans recharger la page.
(function () {
  var form = document.getElementById('form-diagnostic');
  if (!form) return;
  var statut = document.getElementById('statut');
  var bouton = form.querySelector('button[type="submit"]');

  function afficher(message, type) {
    statut.textContent = message;
    statut.className = 'statut large ' + type;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      afficher('Merci de remplir votre nom, votre entreprise, un moyen de contact et de cocher la case.', 'erreur');
      form.reportValidity();
      return;
    }
    bouton.disabled = true;
    afficher('Envoi en cours…', '');
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          afficher('Merci ! Votre demande est bien partie. Je vous réponds sous 48 h.', 'ok');
        } else {
          afficher(res.d.erreur || "L'envoi n'a pas abouti. Écrivez-moi directement à chris@lebaliseur.fr.", 'erreur');
        }
      })
      .catch(function () {
        afficher("L'envoi n'a pas abouti. Écrivez-moi directement à chris@lebaliseur.fr.", 'erreur');
      })
      .finally(function () { bouton.disabled = false; });
  });
})();
