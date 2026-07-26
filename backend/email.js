const nodemailer = require("nodemailer");

// Utilise un compte Gmail comme expéditeur, via un "mot de passe
// d'application" (jamais le vrai mot de passe Gmail — voir .env.example
// pour la procédure de création). Simple et gratuit pour un volume
// d'emails modéré comme celui d'une plateforme qui démarre.
//
// Configuration explicite (plutôt que `service: "gmail"`) avec `family: 4`
// pour forcer IPv4 : sur Render (plan gratuit), les connexions sortantes
// en IPv6 échouent parfois silencieusement par timeout — le même problème
// rencontré avec la connexion directe à Supabase, résolu de la même façon.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  family: 4,
  connectionTimeout: 15000,
});

async function sendPasswordResetEmail({ to, name, resetUrl }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    // En développement local sans configuration email, on affiche le lien
    // dans les logs du serveur plutôt que d'échouer silencieusement.
    console.log(`[EMAIL NON ENVOYÉ - config manquante] Lien de réinitialisation pour ${to} : ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: `Cauri <${process.env.GMAIL_USER}>`,
    to,
    subject: "Réinitialisation de votre mot de passe Cauri",
    text: `Bonjour ${name},\n\nVous avez demandé à réinitialiser votre mot de passe sur Cauri.\n\nCliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.\n\n— Cauri`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#12233F;">Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe sur Cauri.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#C1440E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">
            Choisir un nouveau mot de passe
          </a>
        </p>
        <p style="color:#666;font-size:13px;">Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
