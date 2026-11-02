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

// Barre « test gratuit » en bas de l'écran sur mobile : visible après le héros,
// cachée quand le bandeau du test, le formulaire ou le pied de page sont à l'écran.
(function () {
  var barre = document.querySelector('.barre-test');
  if (!barre || !('IntersectionObserver' in window)) return;
  var lien = barre.querySelector('a');
  var cibles = ['.heros', '.bandeau-test', '#diagnostic', '#audit', '.pied']
    .map(function (s) { return document.querySelector(s); }).filter(Boolean);
  var visibles = new Set();
  var obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) { if (e.isIntersecting) visibles.add(e.target); else visibles.delete(e.target); });
    var montrer = visibles.size === 0;
    barre.classList.toggle('visible', montrer);
    barre.setAttribute('aria-hidden', montrer ? 'false' : 'true');
    lien.tabIndex = montrer ? 0 : -1;
  });
  cibles.forEach(function (c) { obs.observe(c); });
})();
