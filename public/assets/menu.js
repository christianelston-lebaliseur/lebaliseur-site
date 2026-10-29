// Menu mobile : ouvre et ferme la navigation principale
(function () {
  var bouton = document.querySelector('.menu-bouton');
  var entete = document.querySelector('.entete');
  if (!bouton || !entete) return;
  var libelle = bouton.querySelector('span');
  function basculer(ouvrir) {
    entete.classList.toggle('menu-ouvert', ouvrir);
    bouton.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
    libelle.textContent = ouvrir ? bouton.dataset.fermer : bouton.dataset.ouvrir;
  }
  bouton.addEventListener('click', function () { basculer(!entete.classList.contains('menu-ouvert')); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && entete.classList.contains('menu-ouvert')) { basculer(false); bouton.focus(); }
  });
  entete.querySelectorAll('.nav a').forEach(function (a) {
    a.addEventListener('click', function () { basculer(false); });
  });
})();
