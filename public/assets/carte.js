// Carte de classement local (exemple fictif) : grille de points autour d'une entreprise du centre d'Annecy.
(function () {
  var hote = document.getElementById('carte-classement');
  if (!hote) return;
  var en = (document.documentElement.lang || '').indexOf('en') === 0;
  var NS = 'http://www.w3.org/2000/svg';
  var N = 7, PAS = 70, MARGE = 70, TAILLE = MARGE * 2 + PAS * (N - 1);
  var centre = (N - 1) / 2;

  // Lac d'Annecy, schématisé (au sud-est du centre-ville).
  var lac = [[300, 300], [350, 285], [395, 300], [430, 340], [455, 400], [478, 470], [500, 560], [430, 560], [400, 480], [365, 420], [318, 375], [292, 335]];
  var villes = [['Pringy', 281, 32, 'middle'], ['Annecy-le-Vieux', 455, 177, 'middle'], ['Cran-Gevrier', 140, 247, 'middle'], ['Seynod', 175, 457, 'middle'], ['Sevrier', 300, 530, 'middle'], ['Veyrier-du-Lac', 552, 317, 'end']];

  function dansLac(x, y) {
    var dedans = false;
    for (var i = 0, j = lac.length - 1; i < lac.length; j = i++) {
      var xi = lac[i][0], yi = lac[i][1], xj = lac[j][0], yj = lac[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) dedans = !dedans;
    }
    return dedans;
  }

  // Classements fictifs : bons près de l'entreprise, moins bons vers Seynod où un concurrent domine.
  function classement(i, j, apres) {
    var d = Math.sqrt(Math.pow(i - centre, 2) + Math.pow(j - centre, 2));
    var biais = (j > centre && i < centre) ? 3 : 0;
    var r = apres ? 1 + d * 1.1 + biais * 0.4 : 2 + d * 4.2 + biais;
    return Math.max(1, Math.round(r));
  }
  function teinte(r) {
    if (r <= 3) return ['#24493A', '#FFFFFF'];
    if (r <= 10) return ['#F2B23A', '#1C2420'];
    if (r <= 20) return ['#E8894A', '#1C2420'];
    return ['#B3261E', '#FFFFFF'];
  }

  function el(nom, attrs, parent) {
    var e = document.createElementNS(NS, nom);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var svg = el('svg', { viewBox: '0 0 ' + TAILLE + ' ' + TAILLE, role: 'img', class: 'carte-svg' });
  var titre = el('title', {}, svg);
  el('rect', { width: TAILLE, height: TAILLE, rx: 12, fill: '#E4E8E1' }, svg);
  // quelques routes schématiques
  ['M0,250 C150,240 220,270 281,281', 'M281,281 C320,200 400,140 560,90', 'M281,281 C230,350 180,420 60,560', 'M281,0 C285,120 280,200 281,281'].forEach(function (d) { el('path', { d: d, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 6, 'stroke-linecap': 'round' }, svg); });
  el('polygon', { points: lac.map(function (p) { return p.join(','); }).join(' '), fill: '#A9C7D3' }, svg);
  var lacTexte = el('text', { x: 420, y: 430, 'text-anchor': 'middle', fill: '#4E7486', 'font-size': 14, 'font-style': 'italic', transform: 'rotate(62 420 430)' }, svg);
  lacTexte.textContent = en ? 'Lake Annecy' : "Lac d'Annecy";

  var points = el('g', {}, svg);
  var cercles = [];
  for (var j = 0; j < N; j++) {
    for (var i = 0; i < N; i++) {
      var x = MARGE + i * PAS, y = MARGE + j * PAS;
      if (dansLac(x, y)) continue;
      var g = el('g', {}, points);
      var c = el('circle', { cx: x, cy: y, r: 22, stroke: '#FFFFFF', 'stroke-width': 3 }, g);
      var t = el('text', { x: x, y: y + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700 }, g);
      cercles.push({ i: i, j: j, c: c, t: t, centre: i === centre && j === centre });
    }
  }
  // l'entreprise : anneau autour du point central
  el('circle', { cx: MARGE + centre * PAS, cy: MARGE + centre * PAS, r: 29, fill: 'none', stroke: '#1C2420', 'stroke-width': 4 }, svg);
  villes.forEach(function (v) {
    var t = el('text', { x: v[1], y: v[2], 'text-anchor': v[3], fill: '#3E4A44', 'font-size': 14, 'font-weight': 600, stroke: '#E4E8E1', 'stroke-width': 5, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, svg);
    t.textContent = v[0];
  });
  var ici = el('text', { x: MARGE + centre * PAS, y: MARGE + centre * PAS - 35, 'text-anchor': 'middle', fill: '#1C2420', 'font-size': 14, 'font-weight': 700, stroke: '#E4E8E1', 'stroke-width': 5, 'paint-order': 'stroke' }, svg);
  ici.textContent = en ? 'Your business' : 'Votre entreprise';

  hote.appendChild(svg);

  var boutons = document.querySelectorAll('[data-carte]');
  var resume = document.getElementById('carte-resume');

  function afficher(apres) {
    var top3 = 0;
    cercles.forEach(function (p) {
      var r = classement(p.i, p.j, apres);
      var col = teinte(r);
      p.c.setAttribute('fill', col[0]);
      p.t.setAttribute('fill', col[1]);
      p.t.textContent = r > 20 ? '20+' : String(r);
      if (r <= 3) top3++;
    });
    var total = cercles.length;
    titre.textContent = en
      ? 'Fictional example: ranking from ' + total + ' search points around a business in central Annecy. Top 3 on ' + top3 + ' of ' + total + ' points.'
      : 'Exemple fictif : classement depuis ' + total + ' points de recherche autour d’une entreprise du centre d’Annecy. Top 3 sur ' + top3 + ' points sur ' + total + '.';
    if (resume) resume.innerHTML = en
      ? '<strong>' + top3 + ' of ' + total + '</strong> search points in the top 3'
      : '<strong>' + top3 + ' sur ' + total + '</strong> points de recherche dans le top 3';
    boutons.forEach(function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-carte') === 'apres') === apres)); });
  }
  boutons.forEach(function (b) { b.addEventListener('click', function () { afficher(b.getAttribute('data-carte') === 'apres'); }); });
  afficher(false);
})();
