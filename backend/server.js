require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { kkiapay } = require("@kkiapay-org/nodejs-sdk");
const { query, queryOne } = require("./db");
const { sendPasswordResetEmail } = require("./email");

const app = express();
app.use(
  cors({
    // En production, restreint aux origines listées dans FRONTEND_URL
    // (séparées par des virgules si plusieurs). En local, tout est autorisé
    // pour ne pas bloquer le développement.
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : true,
  })
);
app.use(express.json());
app.use(express.static("public"));

// Utilisé par Render (et tout hébergeur) pour vérifier que le service est en vie.
app.get("/health", (req, res) => res.json({ ok: true }));

const COMMISSION_RATE = Number(process.env.COMMISSION_RATE || 0.12);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const PENDING_HOLD_MINUTES = 30;

const k = kkiapay({
  privatekey: process.env.KKIAPAY_PRIVATE_KEY,
  publickey: process.env.KKIAPAY_PUBLIC_KEY,
  secretkey: process.env.KKIAPAY_SECRET_KEY,
  sandbox: process.env.KKIAPAY_SANDBOX === "true",
});

/* ------------------------------------------------------------------ */
/* Authentification                                                    */
/* ------------------------------------------------------------------ */

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentification requise" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session invalide ou expirée" });
  }
}

function issueToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, mot de passe et nom sont requis" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await queryOne("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
  if (existing) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, 'owner')`,
    [id, normalizedEmail, passwordHash, name]
  );

  const user = { id, email: normalizedEmail, name, role: "owner" };
  res.status(201).json({ token: issueToken(user), user });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  const row = await queryOne("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
  if (!row) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

  const validPassword = await bcrypt.compare(password, row.password_hash);
  if (!validPassword) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

  const user = { id: row.id, email: row.email, name: row.name, role: row.role };
  res.json({ token: issueToken(user), user });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

const RESET_TOKEN_TTL_MINUTES = 60;

/**
 * Demande de réinitialisation. Répond toujours de la même façon, que
 * l'email existe ou non, pour ne pas révéler quels comptes existent
 * (protection standard contre l'énumération d'utilisateurs).
 */
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });

  const user = await queryOne("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);

  if (user) {
    // Le jeton envoyé par email est aléatoire et n'est jamais stocké tel
    // quel en base : seul son empreinte (hash) y est conservée, comme pour
    // un mot de passe. Ainsi, même un accès à la base ne permet pas de
    // fabriquer un lien de réinitialisation valide.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [user.id, tokenHash, expiresAt]
    );

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0];
    const resetUrl = `${frontendUrl}/proprietaire/reinitialiser-mot-de-passe?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
    } catch (err) {
      console.error("Échec d'envoi de l'email de réinitialisation:", err.message);
      // On ne révèle pas l'échec technique au client, toujours pour la
      // même raison que ci-dessus (ne pas confirmer/infirmer l'existence
      // du compte, et ne pas exposer de détails d'infrastructure).
    }
  }

  res.json({
    message: "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
  });
});

/**
 * Confirme la réinitialisation : vérifie le jeton (non expiré, non déjà
 * utilisé), met à jour le mot de passe, puis invalide le jeton.
 */
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Jeton et nouveau mot de passe requis" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await queryOne(
    `SELECT * FROM password_reset_tokens
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
    [tokenHash]
  );

  if (!record) {
    return res.status(400).json({ error: "Ce lien de réinitialisation est invalide ou a expiré" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, record.user_id]);
  await query("UPDATE password_reset_tokens SET used_at = now() WHERE id = $1", [record.id]);

  res.json({ ok: true });
});

/**
 * Enregistre le numéro Mobile Money du propriétaire, où il souhaite
 * recevoir ses versements. Ce numéro n'est pas encore utilisé
 * automatiquement (le versement reste manuel pour l'instant, voir
 * owner_payouts) — il sert à préparer l'automatisation future via
 * Kkiapay Push, une fois sa documentation API confirmée.
 */
app.post("/api/auth/mobile-money", requireAuth, async (req, res) => {
  const { mobileMoneyNumber } = req.body;

  // Format international simple : indicatif + numéro, chiffres uniquement,
  // ex. 22997000000. On ne valide pas l'opérateur (MTN/Moov) ici.
  if (!mobileMoneyNumber || !/^[0-9]{8,15}$/.test(mobileMoneyNumber)) {
    return res.status(400).json({
      error: "Numéro invalide. Utilise le format international sans espaces ni +, ex. 22997000000",
    });
  }

  await query("UPDATE users SET mobile_money_number = $1 WHERE id = $2", [
    mobileMoneyNumber,
    req.user.id,
  ]);

  res.json({ ok: true, mobileMoneyNumber });
});

/* ------------------------------------------------------------------ */
/* Logements                                                           */
/* ------------------------------------------------------------------ */

function getPropertyBySlug(slug) {
  return queryOne("SELECT * FROM properties WHERE slug = $1", [slug]);
}

app.get("/api/properties", async (req, res) => {
  const rows = await query("SELECT * FROM properties ORDER BY created_at DESC");
  res.json(rows);
});

app.get("/api/properties/:slug", async (req, res) => {
  const property = await getPropertyBySlug(req.params.slug);
  if (!property) return res.status(404).json({ error: "Logement introuvable" });
  res.json(property);
});

app.post("/api/properties", requireAuth, async (req, res) => {
  const { title, city, pricePerNight, guests, beds, lat, lng, tag, description } = req.body;
  const ownerId = req.user.id;
  const ownerName = req.user.name;

  if (!title || !city || !pricePerNight) {
    return res.status(400).json({ error: "Champs obligatoires manquants" });
  }

  const id = crypto.randomUUID();
  const slug = `${title}-${id.slice(0, 6)}`
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await query(
    `INSERT INTO properties (id, slug, title, city, price_per_night, guests, beds, lat, lng, tag, description, owner_id, owner_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [id, slug, title, city, Number(pricePerNight), Number(guests) || 1, Number(beds) || 1, Number(lat) || 6.37, Number(lng) || 2.39, tag || "Nouveau", description || "", ownerId, ownerName]
  );

  res.status(201).json({ id, slug });
});

/* ------------------------------------------------------------------ */
/* Disponibilité et réservation                                        */
/* ------------------------------------------------------------------ */

async function activeBookingsForProperty(slug) {
  return query(
    `SELECT check_in, check_out FROM bookings
     WHERE property_id = $1
       AND (
         status = 'paid'
         OR (status = 'pending' AND created_at >= now() - ($2 || ' minutes')::interval)
       )`,
    [slug, PENDING_HOLD_MINUTES]
  );
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function nightsBetween(checkIn, checkOut) {
  const msPerNight = 24 * 60 * 60 * 1000;
  return Math.round((new Date(checkOut) - new Date(checkIn)) / msPerNight);
}

app.get("/api/properties/:slug/availability", async (req, res) => {
  const property = await getPropertyBySlug(req.params.slug);
  if (!property) return res.status(404).json({ error: "Logement introuvable" });

  const rows = await activeBookingsForProperty(property.slug);
  res.json({
    blockedRanges: rows.map((r) => ({
      checkIn: r.check_in.toISOString().slice(0, 10),
      checkOut: r.check_out.toISOString().slice(0, 10),
    })),
  });
});

app.post("/api/bookings/initiate", async (req, res) => {
  const { propertyId, checkIn, checkOut, travelerEmail } = req.body;
  const property = await getPropertyBySlug(propertyId);

  if (!property || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Requete invalide" });
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) {
    return res.status(400).json({ error: "Dates invalides : la date de depart doit suivre l'arrivee" });
  }

  const existing = await activeBookingsForProperty(property.slug);
  const hasConflict = existing.some((b) =>
    rangesOverlap(checkIn, checkOut, b.check_in.toISOString().slice(0, 10), b.check_out.toISOString().slice(0, 10))
  );
  if (hasConflict) {
    return res.status(409).json({ error: "Ces dates ne sont plus disponibles pour ce logement" });
  }

  const amountTotal = property.price_per_night * nights;
  const commissionAmount = Math.round(amountTotal * COMMISSION_RATE);
  const payoutAmount = amountTotal - commissionAmount;
  const bookingId = crypto.randomUUID();

  await query(
    `INSERT INTO bookings
      (id, property_id, owner_id, traveler_email, check_in, check_out, nights, amount_total, commission_amount, payout_amount, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')`,
    [bookingId, property.slug, property.owner_id, travelerEmail || null, checkIn, checkOut, nights, amountTotal, commissionAmount, payoutAmount]
  );

  res.json({ bookingId, amountTotal, nights, publicKey: process.env.KKIAPAY_PUBLIC_KEY });
});

app.post("/api/bookings/:id/confirm", async (req, res) => {
  const { id } = req.params;
  const { transactionId } = req.body;

  const booking = await queryOne("SELECT * FROM bookings WHERE id = $1", [id]);
  if (!booking) return res.status(404).json({ error: "Reservation introuvable" });
  if (booking.status === "paid") return res.json({ status: "paid" }); // idempotent

  try {
    const transaction = await k.verify(transactionId);
    const amountMatches = Number(transaction.amount) === booking.amount_total;
    const isSuccess = transaction.status === "SUCCESS";

    if (!isSuccess || !amountMatches) {
      await query("UPDATE bookings SET status = 'failed', kkiapay_transaction_id = $1 WHERE id = $2", [transactionId, id]);
      return res.status(402).json({ error: "Paiement non confirme ou montant incorrect" });
    }

    await query(
      `UPDATE bookings SET status = 'paid', kkiapay_transaction_id = $1, paid_at = now() WHERE id = $2`,
      [transactionId, id]
    );

    await query(
      `INSERT INTO owner_payouts (owner_id, booking_id, amount, status) VALUES ($1, $2, $3, 'owed')`,
      [booking.owner_id, booking.id, booking.payout_amount]
    );

    res.json({
      status: "paid",
      amountTotal: booking.amount_total,
      commission: booking.commission_amount,
      payoutDueToOwner: booking.payout_amount,
    });
  } catch (err) {
    console.error("Erreur de verification Kkiapay:", err.message);
    res.status(500).json({ error: "Verification du paiement impossible pour le moment" });
  }
});

/* ------------------------------------------------------------------ */
/* Espace propriétaire                                                 */
/* ------------------------------------------------------------------ */

app.get("/api/owners/me/properties", requireAuth, async (req, res) => {
  const rows = await query("SELECT * FROM properties WHERE owner_id = $1 ORDER BY created_at DESC", [req.user.id]);
  res.json(rows);
});

app.get("/api/owners/me/balance", requireAuth, async (req, res) => {
  const rows = await query("SELECT * FROM owner_payouts WHERE owner_id = $1 AND status = 'owed'", [req.user.id]);
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  res.json({ ownerId: req.user.id, amountOwed: total, bookings: rows });
});

app.post("/api/owners/me/mark-paid", requireAuth, async (req, res) => {
  await query(
    `UPDATE owner_payouts SET status = 'transferred', transferred_at = now() WHERE owner_id = $1 AND status = 'owed'`,
    [req.user.id]
  );
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API paiement en ecoute sur le port ${PORT}`);
  if (!JWT_SECRET || JWT_SECRET === "change_moi_en_production") {
    console.warn(
      "ATTENTION: JWT_SECRET n'est pas défini ou utilise la valeur par défaut. " +
        "Définis une vraie valeur secrète dans .env avant tout déploiement réel."
    );
  }
});
