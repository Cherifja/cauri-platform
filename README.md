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
