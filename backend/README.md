# Backend de paiement — Cauri (Bénin)

Intégration Kkiapay avec répartition automatique commission / propriétaire.

## Installation

```bash
npm install
cp .env.example .env
# remplir .env avec vos clés depuis https://app.kkiapay.me/dashboard
npm run dev
```

Puis ouvrir `public/checkout.html` dans un navigateur (servi par un simple
serveur statique, ou via l'extension Live Server) pour tester le flux complet
en mode sandbox.

## Comment ça marche

1. **`POST /api/bookings/initiate`** — le serveur calcule le prix (jamais le
   client) et enregistre une réservation `pending` avec la commission déjà
   calculée.
2. Le **widget Kkiapay** collecte le paiement (Mobile Money ou carte).
3. **`POST /api/bookings/:id/confirm`** — dès que Kkiapay annonce un succès
   côté client, le serveur revérifie la transaction directement auprès de
   Kkiapay (`k.verify`) avec la clé privée, et recoupe le montant. C'est cette
   vérification serveur, jamais la réponse du navigateur, qui fait foi.
4. Une fois confirmée, la part due au propriétaire est ajoutée à un
   **ledger** (`owner_payouts`).

## ⚠️ Point important sur le reversement aux propriétaires

Kkiapay est un agrégateur de **collecte** : l'argent payé par le voyageur
arrive sur **votre** compte marchand Kkiapay, pas directement chez le
propriétaire. Kkiapay ne fait pas de "split payment" automatique vers un
tiers (contrairement à Stripe Connect).

Pour reverser sa part à chaque propriétaire, deux options réalistes :

- **Manuel au départ** : chaque semaine, consulter `GET
  /api/owners/:id/balance`, effectuer le virement Mobile Money vous-même,
  puis appeler `POST /api/owners/:id/mark-paid` pour clôturer le ledger.
- **Automatisé plus tard** : une fois les volumes plus importants, brancher
  l'API Mobile Money (MTN MoMo Disbursement API ou Moov) pour déclencher les
  virements automatiquement à partir du ledger, sur un job planifié
  (quotidien ou hebdomadaire).

Le ledger (`owner_payouts`) est la pièce qui rend ça fiable : chaque
réservation payée y laisse une trace, donc même en reversant manuellement au
début, rien ne se perd et vous avez un historique auditable par propriétaire.

## Sécurité

- Le prix est toujours recalculé côté serveur à partir du catalogue
  (`PROPERTIES`), jamais reçu tel quel du client.
- Chaque transaction est revérifiée auprès de Kkiapay avant validation.
- `KKIAPAY_PRIVATE_KEY` et `KKIAPAY_SECRET_KEY` ne doivent jamais être
  exposées côté client — uniquement `KKIAPAY_PUBLIC_KEY`.
