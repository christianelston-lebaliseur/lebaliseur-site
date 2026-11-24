/* Le Baliseur : animation du téléphone de l'accueil.
   « Votre entreprise » part 3e, gagne avis, photos et fiche complète, monte à la 1re place, puis le badge tombe.
   Joue une fois, quand le téléphone est visible. Sans JavaScript ou avec « réduire les animations » :
   l'image finale (1re place) s'affiche directement, comme avant. */
(function () {
  'use strict';
  var html = document.documentElement;
  var tel = document.querySelector('.telephone');
  if (!tel || !html.classList.contains('tel-anim')) { html.classList.remove('tel-anim'); return; }

  var en = (html.lang || '').slice(0, 2) === 'en';
  var liste = tel.querySelector('.tel-resultats');
  var nous = tel.querySelector('.tel-premier');
  var recherche = tel.querySelector('.tel-recherche span');
  var badge = tel.parentNode.querySelector('.tel-badge') || document.querySelector('.tel-badge');
  var epingle = tel.querySelector('.tel-carte path[fill="#C8322B"]');
  if (!liste || !nous || !recherche) { html.classList.remove('tel-anim'); return; }

  var note = nous.querySelector('.tel-note');
  var etoiles = note && note.querySelector('.etoiles');
  var noteTexte = note && note.lastChild && note.lastChild.nodeType === 3 ? note.lastChild : null;
  var actions = nous.querySelector('.tel-actions');
  var texteRecherche = recherche.textContent;
  var sep = en ? '.' : ',';
  function ecrireNote(v) {
    if (noteTexte) noteTexte.textContent = noteTexte.textContent.replace(/\d[.,]\d/, v.toFixed(1).replace('.', sep));
  }
  function ecrireEtoiles(pleines) {
    if (etoiles) etoiles.innerHTML = '★★★★★'.slice(0, pleines) + (pleines < 5 ? '<span class="etoile-vide">★</span>' : '');
  }
  function numeroter() {
    Array.prototype.forEach.call(liste.children, function (li, i) {
      var r = li.querySelector('.tel-rang');
      if (r) r.textContent = String(i + 1);
    });
  }
  // Déplace une ligne en douceur (FLIP) : mesure, change l'ordre, puis anime l'écart.
  function deplacer(li, avant) {
    var lignes = Array.prototype.slice.call(liste.children);
    var hauts = lignes.map(function (x) { return x.getBoundingClientRect().top; });
    liste.insertBefore(li, avant);
    numeroter();
    lignes.forEach(function (x, i) {
      var d = hauts[i] - x.getBoundingClientRect().top;
      if (!d) return;
      x.style.transition = 'none';
      x.style.transform = 'translateY(' + d + 'px)';
      x.getBoundingClientRect();
      x.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
      x.style.transform = '';
    });
  }

  // État de départ : recherche vide, notre entreprise 3e, note 4,2, sans boutons ni badge.
  recherche.textContent = '';
  liste.appendChild(nous);
  nous.classList.remove('tel-premier');
  numeroter();
  ecrireNote(4.2);
  ecrireEtoiles(4);
  // Les boutons gardent leur place (pas de saut de hauteur) : les pastilles s'affichent par-dessus.
  if (actions) actions.style.visibility = 'hidden';
  var gains = document.createElement('span');
  gains.className = 'tel-gains';
  nous.querySelector('.tel-info').appendChild(gains);
  html.classList.add('tel-pret');

  var etapes = [];
  function a(ms, f) { etapes.push([ms, f]); }
  function gain(texte) {
    var s = document.createElement('span');
    s.textContent = texte;
    gains.appendChild(s);
  }

  // 1. La recherche s'écrit.
  for (var i = 1; i <= texteRecherche.length; i++) {
    (function (n) { a(250 + n * 55, function () { recherche.textContent = texteRecherche.slice(0, n); }); })(i);
  }
  var t = 250 + texteRecherche.length * 55 + 250;
  // 2. Les résultats apparaissent, notre entreprise 3e.
  a(t, function () { html.classList.add('tel-resultats-visibles'); });
  // 3. Le travail : avis, photos, fiche complète, la note monte.
  a(t + 900, function () { gain(en ? '+ reviews' : '+ avis'); ecrireNote(4.5); });
  a(t + 1550, function () { gain(en ? '+ photos' : '+ photos'); ecrireNote(4.7); });
  a(t + 2200, function () { gain(en ? '✓ profile' : '✓ fiche'); ecrireNote(4.9); ecrireEtoiles(5); });
  // 4. La montée : 2e, puis 1re.
  a(t + 2900, function () { deplacer(nous, liste.children[1]); });
  a(t + 3700, function () {
    deplacer(nous, liste.children[0]);
    nous.classList.add('tel-premier');
  });
  // 5. Les boutons de la fiche, l'épingle, le badge.
  a(t + 4400, function () {
    gains.remove();
    if (actions) actions.style.visibility = '';
    if (epingle) epingle.classList.add('tel-epingle-saut');
    html.classList.add('tel-badge-visible');
  });
  a(t + 5200, function () { html.classList.add('tel-fini'); });

  function jouer() {
    etapes.forEach(function (e) { setTimeout(e[1], e[0]); });
  }
  var obs = new IntersectionObserver(function (entrees) {
    if (entrees.some(function (e) { return e.isIntersecting; })) { obs.disconnect(); jouer(); }
  }, { threshold: 0.5 });
  obs.observe(tel);
})();
