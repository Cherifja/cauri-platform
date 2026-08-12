export const AMENITIES = [
  "Climatisation",
  "Ventilateur",
  "Eau 24h/24",
  "Électricité stable",
  "Groupe électrogène",
  "Panneaux solaires",
  "Wifi",
  "Parking",
  "Cuisine équipée",
  "Agent de sécurité",
  "Proche des commerces",
];

export const PROPERTY_TYPES = [
  "Studio",
  "Chambre meublée",
  "Appartement meublé",
  "Villa",
  "Résidence meublée",
  "Hôtel",
  "Auberge",
];

// Coordonnees de l'aeroport international Cardinal Bernardin Gantin, Cotonou
const COTONOU_AIRPORT = { lat: 6.3572, lng: 2.3844 };

// Distance a vol d'oiseau (formule de Haversine), suffisante pour donner
// une idee utile au voyageur sans dependre d'un service de calcul d'itineraire.
export function distanceToCotonouAirportKm(lat, lng) {
  const R = 6371;
  const dLat = ((lat - COTONOU_AIRPORT.lat) * Math.PI) / 180;
  const dLng = ((lng - COTONOU_AIRPORT.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((COTONOU_AIRPORT.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
