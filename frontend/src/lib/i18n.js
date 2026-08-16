export const LANGUAGES = ["fr", "en"];

const dict = {
  fr: {
    "header.login": "Se connecter",
    "header.menu.myBookings": "Mes réservations",
    "header.menu.discover": "À découvrir",
    "header.menu.ownerSpace": "Mon espace propriétaire",
    "header.menu.admin": "Administration",
    "header.menu.logout": "Déconnexion",

    "home.tagline": "Réservez • Payez • Arrivez seul",
    "home.title": "Votre logement au Bénin, trouvé et payé avant le décollage.",
    "home.subtitle": "Chaque annonce inclut un itinéraire Google Maps précis jusqu'à la porte.",
    "home.available": "Logements disponibles",
    "home.loading": "Chargement des logements…",
    "home.error": "Impossible de joindre le serveur pour le moment. Réessaie dans un instant.",
    "home.searchPlaceholder": "Rechercher un quartier (ex. Akpakpa, Fidjrossè, Cadjèhoun…)",
    "home.allCities": "Toutes les villes",
    "home.noResults": "Aucun logement ne correspond à cette recherche pour le moment.",
    "home.trust.title": "Réserver l'esprit tranquille",
    "home.trust.verified.title": "Logements vérifiés",
    "home.trust.verified.desc": "Chaque annonce est publiée par un propriétaire identifié sur la plateforme.",
    "home.trust.price.title": "Prix transparents",
    "home.trust.price.desc": "Le montant affiché est le montant payé, sans frais cachés à l'arrivée.",
    "home.trust.support.title": "Assistance disponible",
    "home.trust.support.desc": "Contact WhatsApp direct avec le propriétaire dès la réservation confirmée.",

    "property.perMonth": "/ mois",
    "property.guests": "voyageurs",
    "property.beds": "chambres",
    "property.verified": "Vérifié",
    "property.verifiedFull": "Logement vérifié",
    "property.book": "Réserver",
    "property.amenities": "Équipements",
    "property.airportDistance": "km de l'aéroport de Cotonou",
    "property.perMonthLong": "par mois",
    "property.openMaps": "Ouvrir l'itinéraire dans Google Maps",
    "property.reviews": "Avis des voyageurs",
    "property.noReviews": "Aucun avis pour l'instant.",
    "property.back": "Retour",
    "property.loading": "Chargement…",
    "property.notFound": "Logement introuvable.",
    "property.backHome": "Retour à l'accueil",

    "booking.title": "Confirmer et payer",
    "booking.loggedInAs": "Connecté en tant que",
    "booking.checkIn": "Date d'entrée",
    "booking.duration": "Durée",
    "booking.months": "mois",
    "booking.total": "Total payé par le voyageur",
    "booking.breakdown": "Répartition automatique (calculée côté serveur)",
    "booking.commission": "Commission plateforme (12%)",
    "booking.payout": "Reversé à",
    "booking.pay": "Payer",
    "booking.withKkiapay": "avec Kkiapay",
    "booking.opening": "Ouverture du paiement…",
    "booking.conflict":
      "Cette période chevauche une réservation existante — essaie une autre date d'entrée ou une durée différente.",
    "booking.dateRange": "Du {start} au {end}",
    "booking.backendError": "Impossible de joindre le serveur pour le moment.",
  },
  en: {
    "header.login": "Log in",
    "header.menu.myBookings": "My bookings",
    "header.menu.discover": "Discover",
    "header.menu.ownerSpace": "My owner dashboard",
    "header.menu.admin": "Admin",
    "header.menu.logout": "Log out",

    "home.tagline": "Book • Pay • Arrive alone",
    "home.title": "Your home in Benin, found and paid for before takeoff.",
    "home.subtitle": "Every listing includes a precise Google Maps route to the door.",
    "home.available": "Available homes",
    "home.loading": "Loading homes…",
    "home.error": "Can't reach the server right now. Try again in a moment.",
    "home.searchPlaceholder": "Search a neighborhood (e.g. Akpakpa, Fidjrossè, Cadjèhoun…)",
    "home.allCities": "All cities",
    "home.noResults": "No homes match this search yet.",
    "home.trust.title": "Book with peace of mind",
    "home.trust.verified.title": "Verified homes",
    "home.trust.verified.desc": "Every listing is published by an identified owner on the platform.",
    "home.trust.price.title": "Transparent pricing",
    "home.trust.price.desc": "The price shown is the price paid, no hidden fees on arrival.",
    "home.trust.support.title": "Support available",
    "home.trust.support.desc": "Direct WhatsApp contact with the owner as soon as your booking is confirmed.",

    "property.perMonth": "/ month",
    "property.guests": "guests",
    "property.beds": "bedrooms",
    "property.verified": "Verified",
    "property.verifiedFull": "Verified home",
    "property.book": "Book",
    "property.amenities": "Amenities",
    "property.airportDistance": "km from Cotonou airport",
    "property.perMonthLong": "per month",
    "property.openMaps": "Open directions in Google Maps",
    "property.reviews": "Traveler reviews",
    "property.noReviews": "No reviews yet.",
    "property.back": "Back",
    "property.loading": "Loading…",
    "property.notFound": "Home not found.",
    "property.backHome": "Back to home",

    "booking.title": "Confirm and pay",
    "booking.loggedInAs": "Logged in as",
    "booking.checkIn": "Check-in date",
    "booking.duration": "Duration",
    "booking.months": "months",
    "booking.total": "Total paid by traveler",
    "booking.breakdown": "Automatic split (calculated server-side)",
    "booking.commission": "Platform commission (12%)",
    "booking.payout": "Paid out to",
    "booking.pay": "Pay",
    "booking.withKkiapay": "with Kkiapay",
    "booking.opening": "Opening payment…",
    "booking.conflict":
      "This period overlaps an existing booking — try a different check-in date or duration.",
    "booking.dateRange": "From {start} to {end}",
    "booking.backendError": "Can't reach the server right now.",
  },
};

const STORAGE_KEY = "staybenin_lang";

export function getStoredLanguage() {
  if (typeof window === "undefined") return "fr";
  return localStorage.getItem(STORAGE_KEY) || "fr";
}

export function setStoredLanguage(lang) {
  localStorage.setItem(STORAGE_KEY, lang);
}

export function translate(lang, key) {
  return (dict[lang] && dict[lang][key]) || dict.fr[key] || key;
}
