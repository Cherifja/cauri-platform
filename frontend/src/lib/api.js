export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
export const COMMISSION_RATE = 0.12;

function getToken() {
  return localStorage.getItem("cauri_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

export const auth = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/api/auth/me"),
  forgotPassword: (email) =>
    request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token, password) =>
    request("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),
  saveSession: ({ token, user }) => {
    localStorage.setItem("cauri_token", token);
    localStorage.setItem("cauri_user", JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem("cauri_token");
    localStorage.removeItem("cauri_user");
  },
  getStoredUser: () => {
    const raw = localStorage.getItem("cauri_user");
    return raw ? JSON.parse(raw) : null;
  },
  isLoggedIn: () => Boolean(getToken()),
};

export const api = {
  listProperties: () => request("/api/properties"),
  getProperty: (slug) => request(`/api/properties/${slug}`),
  getAvailability: (slug) => request(`/api/properties/${slug}/availability`),
  createProperty: (payload) =>
    request("/api/properties", { method: "POST", body: JSON.stringify(payload) }), // payload peut inclure photoUrls (tableau) et videoUrl
  deleteProperty: (slug) => request(`/api/properties/${slug}`, { method: "DELETE" }),
  ownerProperties: () => request("/api/owners/me/properties"),
  ownerBalance: () => request("/api/owners/me/balance"),
  saveMobileMoneyNumber: (mobileMoneyNumber) =>
    request("/api/auth/mobile-money", { method: "POST", body: JSON.stringify({ mobileMoneyNumber }) }),
  saveWhatsappNumber: (whatsappNumber) =>
    request("/api/auth/whatsapp-number", { method: "POST", body: JSON.stringify({ whatsappNumber }) }),
  initiateBooking: (payload) =>
    request("/api/bookings/initiate", { method: "POST", body: JSON.stringify(payload) }),
  confirmBooking: (bookingId, transactionId) =>
    request(`/api/bookings/${bookingId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ transactionId }),
    }),
  getReviews: (slug) => request(`/api/properties/${slug}/reviews`),
  myBookings: () => request("/api/bookings/mine"),
  submitReview: (bookingId, { rating, comment }) =>
    request(`/api/bookings/${bookingId}/review`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }),
};

export function fmt(n) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " F CFA";
}

export function splitCommission(total) {
  const commission = total * COMMISSION_RATE;
  return { commission, payout: total - commission };
}

export function mapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export const admin = {
  listProperties: () => request("/api/admin/properties"),
  setVerified: (slug, verified) =>
    request(`/api/admin/properties/${slug}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ verified }),
    }),
  createDiscoverSpot: (payload) =>
    request("/api/admin/discover", { method: "POST", body: JSON.stringify(payload) }),
  updateDiscoverSpot: (id, payload) =>
    request(`/api/admin/discover/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteDiscoverSpot: (id) => request(`/api/admin/discover/${id}`, { method: "DELETE" }),
};

export const discover = {
  list: () => request("/api/discover"),
};
