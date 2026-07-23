# Mettre Cauri en ligne — guide étape par étape

Ce guide suppose que tu ne connais pas la programmation. Suis les étapes
dans l'ordre. Ça prend environ 30 à 45 minutes la première fois.

Tu vas utiliser 4 services, tous gratuits pour démarrer :
- **GitHub** — pour héberger le code du site
- **Supabase** — la base de données (remplace le fichier local qu'on utilisait en test)
- **Render** — pour faire tourner le "cerveau" du site (le backend)
- **Vercel** — pour afficher le site lui-même (le frontend)

---

## Étape 1 — Mettre le code sur GitHub

1. Va sur [github.com](https://github.com) et crée un compte gratuit si tu n'en as pas.
2. Clique sur le bouton vert **"New"** (ou le **+** en haut à droite → "New repository").
3. Nomme le dépôt `cauri-platform`, laisse-le en **Public** ou **Private** (peu importe), ne coche aucune case, clique **"Create repository"**.
4. Sur la page qui s'affiche, clique sur **"uploading an existing file"**.
5. Glisse-dépose tous les dossiers et fichiers que je t'ai fournis (`backend`, `frontend`, `README.md`, `render.yaml`) dans la zone.
6. En bas de page, clique **"Commit changes"**.

Ton code est maintenant en ligne sur GitHub — c'est la source que Render et Vercel vont lire.

---

## Étape 2 — Créer la base de données (Supabase)

1. Va sur [supabase.com](https://supabase.com) et crée un compte gratuit.
2. Clique **"New project"**. Choisis un nom (ex. `cauri`), un mot de passe pour la base (note-le quelque part, tu en auras besoin), et une région proche du Bénin (ex. Europe).
3. Attends 1 à 2 minutes que le projet se crée.
4. Une fois dedans, va dans le menu à gauche : **SQL Editor**.
5. Clique **"New query"**, ouvre le fichier `backend/schema.sql` que je t'ai fourni, copie tout son contenu, colle-le dans l'éditeur, puis clique **"Run"**.
6. Tu dois voir des messages "Success" — ça a créé toutes les tables et les 4 logements de départ.
7. Va dans **Project Settings** (icône engrenage) → **Database** → section **Connection string** → onglet **URI**. Copie cette adresse (elle commence par `postgresql://`). Garde-la de côté, c'est ta `DATABASE_URL`.

---

## Étape 3 — Mettre en ligne le backend (Render)

1. Va sur [render.com](https://render.com) et crée un compte gratuit (tu peux te connecter directement avec ton compte GitHub, c'est plus simple).
2. Clique **"New"** → **"Blueprint"**.
3. Choisis le dépôt `cauri-platform` que tu as créé à l'étape 1. Render va détecter automatiquement le fichier `render.yaml`.
4. Il va te demander de remplir quelques valeurs (marquées "sync: false") :
   - `DATABASE_URL` → colle l'adresse Supabase de l'étape 2
   - `KKIAPAY_PUBLIC_KEY`, `KKIAPAY_PRIVATE_KEY`, `KKIAPAY_SECRET_KEY` → tes clés depuis [app.kkiapay.me](https://app.kkiapay.me) (menu Développeurs). Si tu n'as pas encore de compte Kkiapay, tu peux mettre des valeurs provisoires et les changer plus tard.
   - `FRONTEND_URL` → laisse vide pour l'instant, on le remplira à l'étape 5
5. Clique **"Apply"**. Render va installer et démarrer ton backend automatiquement (2-3 minutes).
6. Une fois terminé, note l'adresse de ton service — elle ressemble à `https://cauri-backend.onrender.com`. C'est ton **URL backend**.

Pour vérifier que ça marche : ouvre `https://cauri-backend.onrender.com/health` dans ton navigateur, tu dois voir `{"ok":true}`.

⚠️ Sur le plan gratuit de Render, le backend s'endort après 15 minutes d'inactivité et met ~30 secondes à se réveiller au premier visiteur suivant. C'est normal pour un test ; passe à un plan payant avant un vrai lancement si ça gêne les voyageurs.

---

## Étape 4 — Mettre en ligne le site (Vercel)

1. Va sur [vercel.com](https://vercel.com) et connecte-toi avec ton compte GitHub.
2. Clique **"Add New"** → **"Project"**.
3. Choisis le dépôt `cauri-platform`.
4. Dans **"Root Directory"**, clique **"Edit"** et sélectionne le dossier `frontend`.
5. Ouvre la section **"Environment Variables"** et ajoute :
   - Nom : `VITE_API_BASE` — Valeur : l'URL de ton backend Render (ex. `https://cauri-backend.onrender.com`)
6. Clique **"Deploy"**. Ça prend 1-2 minutes.
7. Une fois terminé, Vercel te donne une adresse — ex. `https://cauri-platform.vercel.app`. **C'est l'adresse de ton site**, celle que tu peux partager.

---

## Étape 5 — Autoriser le site à parler au backend

1. Retourne sur Render → ton service `cauri-backend` → **Environment**.
2. Modifie la variable `FRONTEND_URL` avec l'adresse Vercel obtenue à l'étape 4 (ex. `https://cauri-platform.vercel.app`).
3. Enregistre — Render redémarre automatiquement le service.

---

## Vérification finale

Ouvre l'adresse Vercel dans ton navigateur : tu dois voir la page d'accueil avec les 4 logements. Essaie de te connecter à l'espace propriétaire avec `adjovi@example.com` / `motdepasse123` pour confirmer que tout communique correctement.

---

## Pour aller plus loin

- **Nom de domaine personnalisé** (ex. `cauri.bj`) : achetable chez un registrar comme Namecheap ou OVH, puis à connecter dans les réglages "Domains" de Vercel (pour le site) — quelques clics, Vercel guide pas à pas.
- **Passer Kkiapay en production** : une fois ton compte marchand validé, change `KKIAPAY_SANDBOX` à `false` dans Render et remplace `sandbox: true` par `sandbox: false` dans `frontend/src/pages/Booking.jsx` (ligne du widget), puis redéploie.
- Si quelque chose ne fonctionne pas, le premier réflexe est de vérifier les **logs** : sur Render, onglet "Logs" du service ; sur Vercel, onglet "Deployments" → clique sur le déploiement → "Runtime Logs".
