// Cloudflare Pages Function : POST /api/contact
// Transmet la demande de diagnostic par e-mail via l'API Brevo. Rien n'est stocké.
//
// Variables d'environnement à définir dans Cloudflare Pages (Settings > Variables and Secrets) :
//   BREVO_API_KEY   clé API Brevo (en "Secret")
//   MAIL_FROM       adresse d'expédition validée dans Brevo, ex. site@lebaliseur.fr
//   MAIL_TO         adresse qui reçoit les demandes, ex. chris@lebaliseur.fr

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });

const nettoyer = (v, max = 300) => String(v || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);

const echapper = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ erreur: 'Requête invalide.' }, 400);
  }

  // Champ piège anti-robots : rempli = robot, on fait semblant d'accepter.
  if (nettoyer(form.get('site_web'))) return json({ ok: true });

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
  return json({ ok: true });
}

export const onRequest = () => json({ erreur: 'Méthode non autorisée.' }, 405);
