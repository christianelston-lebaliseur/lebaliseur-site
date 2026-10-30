// Worker Cloudflare : sert le site (dossier public/) et traite POST /api/contact.
// Le formulaire est transmis par e-mail via l'API Brevo. Rien n'est stocké.
//
// Variables à définir dans le Worker (Settings > Variables and Secrets) :
//   BREVO_API_KEY   clé API Brevo (en "Secret")
//   MAIL_FROM       adresse d'expédition validée dans Brevo, ex. site@lebaliseur.fr
//   MAIL_TO         adresse qui reçoit les demandes, ex. chris@lebaliseur.fr
//   TURNSTILE_SECRET    clé secrète Turnstile (en "Secret") : la vérification se fait dès qu'elle existe
//   TURNSTILE_SITE_KEY  facultatif : remplace la clé publique ci-dessous
//
// Adresse officielle : toutes les autres adresses (www, lebaliseur.com) redirigent vers https://lebaliseur.fr.

const DOMAINE = 'lebaliseur.fr';
// Clé publique du widget Turnstile « Le Baliseur formulaire » (publique par nature : elle apparaît dans la page).
const CLE_PUBLIQUE_TURNSTILE = '0x4AAAAAAFs0x_cTD2DB_uTU';
const AUTRES_DOMAINES = ['www.lebaliseur.fr', 'lebaliseur.com', 'www.lebaliseur.com'];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const nettoyer = (v, max = 300) => String(v || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

const echapper = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (AUTRES_DOMAINES.includes(url.hostname)) {
      url.hostname = DOMAINE;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return json({ erreur: 'Méthode non autorisée.' }, 405);
      return traiterContact(request, env);
    }
    let reponse = await env.ASSETS.fetch(request);
    // Adresses de test (workers.dev) : jamais indexées, pour éviter un doublon du site.
    if (url.hostname.endsWith('.workers.dev')) {
      reponse = new Response(reponse.body, reponse);
      reponse.headers.set('X-Robots-Tag', 'noindex');
    }
    // Anti-robots sur le formulaire, si la clé Turnstile est configurée.
    const type = reponse.headers.get('Content-Type') || '';
    if (url.hostname === DOMAINE && type.includes('text/html')) {
      const cle = echapper(String(env.TURNSTILE_SITE_KEY || CLE_PUBLIQUE_TURNSTILE));
      reponse = new HTMLRewriter()
        .on('form#form-diagnostic button[type="submit"]', {
          element(el) {
            el.before(`<div class="cf-turnstile large" data-sitekey="${cle}" data-language="auto"></div>`, { html: true });
          },
        })
        .on('head', {
          element(el) {
            el.append('<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>', { html: true });
          },
        })
        .transform(reponse);
    }
    return reponse;
  },
};

async function traiterContact(request, env) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ erreur: 'Requête invalide.' }, 400);
  }

  // Champ piège anti-robots : rempli = robot, on fait semblant d'accepter.
  if (nettoyer(form.get('site_web'))) return json({ ok: true });

  // Vérification Turnstile (si la clé secrète est configurée).
  if (env.TURNSTILE_SECRET) {
    const jeton = String(form.get('cf-turnstile-response') || '');
    let valide = false;
    if (jeton) {
      try {
        const corps = new FormData();
        corps.append('secret', env.TURNSTILE_SECRET);
        corps.append('response', jeton);
        const ip = request.headers.get('CF-Connecting-IP');
        if (ip) corps.append('remoteip', ip);
        const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: corps });
        valide = (await r.json()).success === true;
      } catch {}
    }
    if (!valide) {
      return json({ erreur: 'La vérification anti-robots a échoué. Rechargez la page et réessayez, ou écrivez-moi à chris@lebaliseur.fr.' }, 400);
    }
  }

  const d = {
    nom: nettoyer(form.get('nom'), 120),
    entreprise: nettoyer(form.get('entreprise'), 160),
    contact: nettoyer(form.get('contact'), 160),
    site: nettoyer(form.get('site'), 300),
    besoin: nettoyer(form.get('besoin'), 120),
    rgpd: form.get('rgpd') === 'oui',
  };

  if (!d.nom || !d.entreprise || !d.contact || !d.rgpd) {
    return json({ erreur: 'Merci de remplir les champs obligatoires et de cocher la case de consentement.' }, 400);
  }

  if (!env.BREVO_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) {
    return json({ erreur: "Le formulaire n'est pas encore activé. Écrivez-moi à chris@lebaliseur.fr." }, 503);
  }

  const lignes = [
    ['Nom', d.nom],
    ['Entreprise', d.entreprise],
    ['Contact', d.contact],
    ['Site', d.site || '(aucun)'],
    ['Besoin', d.besoin],
    ['Score auto-diagnostic', /^\d{1,3}$/.test(nettoyer(form.get('score'), 3)) ? nettoyer(form.get('score'), 3) + '/100' : '(non fait)'],
    ['Langue du site', nettoyer(form.get('langue'), 5) === 'en' ? 'anglais' : 'français'],
  ];
  const html = '<h2>Nouvelle demande de diagnostic</h2><table>' +
    lignes.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${echapper(v)}</td></tr>`).join('') +
    '</table><p>Consentement RGPD : oui</p>';

  const contactEstEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contact);

  const reponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Le Baliseur (site)', email: env.MAIL_FROM },
      to: [{ email: env.MAIL_TO }],
      ...(contactEstEmail ? { replyTo: { email: d.contact, name: d.nom } } : {}),
      subject: `Diagnostic : ${d.entreprise}`,
      htmlContent: html,
    }),
  });

  if (!reponse.ok) {
    return json({ erreur: "L'envoi n'a pas abouti. Écrivez-moi directement à chris@lebaliseur.fr." }, 502);
  }

  // Accusé de réception au prospect (si un e-mail a été donné). Un échec ici ne bloque pas la demande.
  if (contactEstEmail) {
    const en = nettoyer(form.get('langue'), 5) === 'en';
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Chris Elston · Le Baliseur', email: env.MAIL_FROM },
          to: [{ email: d.contact, name: d.nom }],
          replyTo: { email: env.MAIL_TO, name: 'Chris Elston' },
          subject: en ? 'Your free audit request: received' : 'Votre demande de diagnostic : bien reçue',
          htmlContent: accuseReception(d, en),
          textContent: accuseReception(d, en, true),
        }),
      });
    } catch {}
  }
  return json({ ok: true });
}

function accuseReception(d, en, texte = false) {
  const nom = texte ? d.nom : echapper(d.nom);
  const entreprise = texte ? d.entreprise : echapper(d.entreprise);
  const test = en ? 'https://lebaliseur.fr/en/self-check' : 'https://lebaliseur.fr/auto-diagnostic';
  const p = en ? [
    `Hello ${nom},`,
    `Thank you for your request. I'm now looking at how ${entreprise} shows up on Google and in AI answers, and I'll send you your free audit within 72 hours.`,
    `If you haven't done it yet, the online self-check takes two minutes: ${test}`,
    'Any questions? Just reply to this email.',
  ] : [
    `Bonjour ${nom},`,
    `Merci pour votre demande. Je regarde la présence de ${entreprise} sur Google et dans les réponses des IA, et je vous envoie votre diagnostic offert sous 72 h.`,
    `Si vous ne l'avez pas encore fait, l'auto-diagnostic en ligne prend deux minutes : ${test}`,
    'Une question ? Répondez simplement à ce message.',
  ];
  const signature = ['Chris Elston', en ? 'Le Baliseur · Annecy' : 'Le Baliseur · Annecy', 'lebaliseur.fr'];
  if (texte) return p.join('\n\n') + '\n\n' + signature.join('\n');
  const lien = (s) => s.replace(test, `<a href="${test}">${test.replace('https://', '')}</a>`);
  return '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1C2420;max-width:560px">' +
    p.map((x) => `<p>${lien(x)}</p>`).join('') +
    `<p style="margin-top:24px;border-top:3px solid #F2B23A;padding-top:12px"><strong>${signature[0]}</strong><br>${signature[1]}<br><a href="https://lebaliseur.fr" style="color:#24493A">${signature[2]}</a></p></div>`;
}
