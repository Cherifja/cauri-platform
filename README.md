# Cauri — Plateforme de réservation de logements au Bénin

Projet complet : backend de paiement (Kkiapay) + frontend React (Vite).

## 🚀 Mettre le site en ligne

Si tu veux simplement rendre le site accessible sur internet, suis
**[DEPLOYMENT.md](./DEPLOYMENT.md)** — un guide pas-à-pas en langage simple,
sans connaissances techniques requises.

## Structure

```
cauri-platform/
├── backend/     → API Express + PostgreSQL + intégration Kkiapay
├── frontend/    → Site React (Vite + Tailwind + React Router)
├── render.yaml  → configuration pour déployer le backend sur Render
└── DEPLOYMENT.md → guide de mise en ligne pas-à-pas
```

## Démarrage en local (pour tester ou continuer le développement)

### 1. Base de données

Le backend utilise PostgreSQL (pas SQLite — ce choix a été fait pour que le
site fonctionne correctement une fois déployé, voir DEPLOYMENT.md). Deux
options en local :

- **Le plus simple** : crée un projet gratuit sur [supabase.com](https://supabase.com),
  exécute `backend/schema.sql` dans son éditeur SQL, et récupère l'URL de
  connexion (Project Settings > Database > Connection string).
- **En local pur** : installe PostgreSQL sur ta machine, crée une base, puis
  exécute `psql -f backend/schema.sql` dessus.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# renseigner DATABASE_URL (étape précédente) et tes clés Kkiapay (sandbox) dans .env
npm run dev
```

L'API tourne sur `http://localhost:4000`.

### 3. Frontend

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev
```

Le site est accessible sur `http://localhost:5173`. Il communique avec le
backend via `VITE_API_BASE` (par défaut `http://localhost:4000`).

## Ce qui est fonctionnel

- Recherche et liste des logements (chargés depuis la base, plus en dur)
- Fiche logement avec itinéraire Google Maps réel (aucune clé API requise)
- Sélection de dates avec vérification de disponibilité côté serveur : les
  dates déjà réservées (payées, ou en attente de paiement depuis moins de
  30 minutes) sont bloquées pour éviter les doubles réservations
- Réservation + paiement réel via le widget Kkiapay (Mobile Money + carte)
- Répartition automatique de la commission (12%) entre plateforme et propriétaire
- **Authentification réelle des propriétaires** : inscription, connexion,
  mots de passe hashés (bcrypt), sessions par token JWT (7 jours), routes
  propriétaire protégées côté serveur (`requireAuth`) — un propriétaire ne
  peut jamais consulter les annonces ou revenus d'un autre
- **Mot de passe oublié** : email de réinitialisation envoyé via l'API HTTP
  de Brevo (`BREVO_API_KEY` / `BREVO_SENDER_EMAIL`), lien à usage unique
  valable 1 heure
- **Photos et vidéo des annonces** : upload direct depuis le navigateur vers
  Supabase Storage (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` côté
  frontend), jusqu'à 8 photos + 1 vidéo par annonce, affichées en galerie
  sur la fiche logement
- **Comptes voyageurs** : inscription et connexion (`/inscription`, `/connexion`),
  requis avant de réserver — chaque réservation est automatiquement liée à
  l'identité du voyageur connecté (`traveler_id`), jamais à un email saisi
  librement ; après connexion, le voyageur est renvoyé exactement là où il
  s'était arrêté (ex. sa réservation en cours)
- **Avis voyageurs** : notes (1 à 5 étoiles) et commentaires affichés sur
  chaque fiche logement, avec note moyenne calculée automatiquement.
  Un avis ne peut être laissé que par un voyageur ayant réellement payé et
  terminé son séjour (vérifié côté serveur — impossible de laisser un avis
  sans réservation payée passée), un seul avis par réservation. Page
  "Mes réservations" (`/mes-reservations`) pour que le voyageur retrouve
  son historique et laisse ses avis
- **Recherche adaptée au Bénin** : recherche libre par quartier (Akpakpa,
  Fidjrossè, Cadjèhoun...) en plus du filtre par ville, quartier affiché
  sur chaque annonce
- **Fiches logement détaillées** : type de logement (Studio, Villa,
  Auberge...), liste d'équipements (climatisation, eau 24h/24, wifi,
  groupe électrogène, parking, sécurité...), point de repère local, et
  distance à vol d'oiseau jusqu'à l'aéroport de Cotonou
- **Section confiance et tourisme** sur la page d'accueil, mettant en avant
  Ganvié, la Route des Pêches, Ouidah, Grand-Popo et le parc de la Pendjari
- **Badge "Logement vérifié"** : espace d'administration (`/admin`, réservé
  aux comptes marqués `is_admin` en base) permettant d'activer/désactiver
  le badge d'un simple clic après vérification manuelle du propriétaire
- **Site bilingue français/anglais** : sélecteur FR/EN dans l'en-tête,
  préférence mémorisée sur l'appareil. Pages traduites en priorité pour
  l'instant : accueil, fiches logement, réservation (les pages internes —
  formulaires propriétaire, emails — restent en français, à traduire dans
  une prochaine passe si besoin)
- Espace propriétaire : publication d'annonces, suivi des revenus en attente de virement
- Prêt à déployer : base PostgreSQL (compatible hébergement serverless),
  configuration Render (`render.yaml`) et Vercel (`frontend/vercel.json`)
  fournies et testées

### Comptes de démonstration

Deux comptes propriétaires sont créés par `backend/schema.sql`
(mot de passe : `motdepasse123`) :
- `adjovi@example.com` — propriétaire de la Villa Ganvié et de l'Appart Cotonou
- `roger@example.com` — propriétaire de la Case Ouidah et du Bungalow Grand-Popo

## Ce qu'il reste à faire avant un vrai lancement

- Upload de vraies photos (actuellement les logements affichent un aperçu
  de carte stylisé, pas de photo)
- Passage de Kkiapay en mode production une fois le compte marchand validé
  (voir la section "Pour aller plus loin" de DEPLOYMENT.md)
- Nettoyage périodique (tâche planifiée) des réservations "pending" trop
  anciennes dans la table `bookings`, même si elles n'empêchent déjà plus
  la réservation de nouvelles dates après 30 minutes
- Authentification voyageur (actuellement seuls les propriétaires ont un
  compte ; les réservations n'exigent qu'un email facultatif)
- Passer Render sur un plan payant avant un vrai lancement pour éviter la
  mise en veille du backend après 15 minutes d'inactivité (plan gratuit)

Voir `backend/README.md` pour le détail du flux de paiement et du
fonctionnement du reversement aux propriétaires.
