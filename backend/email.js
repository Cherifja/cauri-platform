// Envoi via l'API HTTP de Brevo (anciennement Sendinblue), et non par SMTP :
// les hébergeurs gratuits comme Render bloquent souvent les connexions
// sortantes sur les ports SMTP (25/465/587) pour lutter contre le spam,
// ce qui provoquait des "Connection timeout" avec nodemailer. L'API HTTP
// passe par le port 443 (HTTPS), jamais bloqué.
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    // En développement local sans configuration email, on affiche le lien
    // dans les logs du serveur plutôt que d'échouer silencieusement.
    console.log(`[EMAIL NON ENVOYÉ - config manquante] Lien de réinitialisation pour ${to} : ${resetUrl}`);
    return;
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: "StayBenin", email: senderEmail },
      to: [{ email: to, name }],
      subject: "Réinitialisation de votre mot de passe StayBenin",
      textContent: `Bonjour ${name},\n\nVous avez demandé à réinitialiser votre mot de passe sur StayBenin.\n\nCliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.\n\n— StayBenin`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color:#12233F;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour ${name},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe sur StayBenin.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;background:#C1440E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">
              Choisir un nouveau mot de passe
            </a>
          </p>
          <p style="color:#666;font-size:13px;">Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Échec Brevo (${res.status}): ${body}`);
  }
}

module.exports = { sendPasswordResetEmail };
