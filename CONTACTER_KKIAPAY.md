# Message à envoyer à Kkiapay

## Où l'envoyer
Email : support@kkiapay.me
Ou via le chat du site : https://kkiapay.me (bouton "Ask a question")

## Ce qu'il faut savoir avant d'écrire
- "Kkiapay Push" est leur produit de versement en masse vers plusieurs
  comptes Mobile Money — c'est exactement ce qu'il te faut pour reverser
  automatiquement leur part aux propriétaires après chaque réservation.
- Il est facturé par abonnement (100 à 5000 transactions / 30 jours,
  de 7 500 à 125 000 F CFA selon le volume).
- Ce qu'on ne sait pas encore : s'il existe une vraie API (appelable
  automatiquement depuis notre site) ou si c'est uniquement un envoi de
  fichier via leur tableau de bord. C'est la question clé à poser.

## Message à copier-coller (en français)

Objet : Documentation API pour versements automatisés (Kkiapay Push)

Bonjour,

Je développe une plateforme de réservation de logements au Bénin
(paiement des voyageurs déjà intégré via le SDK Kkiapay standard). Je
souhaiterais automatiser le versement de la part due à mes propriétaires
partenaires vers leur compte Mobile Money, directement après chaque
réservation payée.

J'ai vu que Kkiapay Push permet l'envoi groupé vers plusieurs bénéficiaires
Mobile Money. Pourriez-vous me confirmer :

1. Existe-t-il une API REST permettant de déclencher ces versements
   automatiquement depuis mon propre serveur (sans passer par l'upload
   manuel de fichier sur votre tableau de bord) ?
2. Si oui, où puis-je trouver la documentation technique complète de
   cette API (endpoints, authentification, format des requêtes) ?
3. Est-il possible de tester cette fonctionnalité en mode sandbox avant
   de souscrire à un abonnement payant ?
4. Quel est le délai typique entre le déclenchement d'un versement et sa
   réception par le bénéficiaire sur son compte Mobile Money ?

Merci d'avance pour votre retour.

Cordialement,
[Ton nom]
[Nom de ta plateforme]

---

## Une fois la réponse reçue

Reviens avec ce que Kkiapay t'a répondu (documentation, exemples de
requêtes, etc.) — je m'occuperai de brancher ça directement sur le
`owner_payouts` déjà en place dans le backend, pour que le versement se
déclenche automatiquement après chaque réservation confirmée.
