-- Migration a executer dans le SQL Editor de Supabase (ta base existe deja).
CREATE TABLE IF NOT EXISTS discover_spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_desc TEXT,
  detail TEXT,
  icon TEXT,
  photo_url TEXT,
  video_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO discover_spots (id, name, short_desc, detail, icon, position) VALUES
  ($t$spot-1$t$, $t$Ganvié$t$, $t$La "Venise de l'Afrique", cité lacustre sur pilotis.$t$, $t$Bâti entièrement sur l'eau au milieu du lac Nokoué, Ganvié se visite en pirogue, souvent au lever du soleil quand les pêcheurs relèvent leurs filets.$t$, $t$🛶$t$, 1),
  ($t$spot-2$t$, $t$Route des Pêches$t$, $t$Bord de mer entre Cotonou et Ouidah, restaurants et plages.$t$, $t$Cette route longe l'océan Atlantique sur une vingtaine de kilomètres entre Cotonou et Ouidah, avec plages, restaurants et bars en bord de mer.$t$, $t$🌊$t$, 2),
  ($t$spot-3$t$, $t$Ouidah$t$, $t$Route des Esclaves, temples vaudou et patrimoine historique.$t$, $t$Ville chargée d'histoire, berceau du culte vaudou au Bénin. La Route des Esclaves relie le centre-ville à la Porte du Non-Retour, sur la plage.$t$, $t$🏛️$t$, 3),
  ($t$spot-4$t$, $t$Grand-Popo$t$, $t$Plages calmes et embouchure du fleuve Mono.$t$, $t$Plus tranquille que la Route des Pêches, Grand-Popo offre de longues plages peu fréquentées et une excursion en pirogue sur le fleuve Mono.$t$, $t$🏖️$t$, 4),
  ($t$spot-5$t$, $t$Parc national de la Pendjari$t$, $t$Safari et faune sauvage, au nord du pays.$t$, $t$Une des dernières grandes réserves de faune sauvage d'Afrique de l'Ouest : éléphants, lions, buffles, antilopes et de nombreuses espèces d'oiseaux.$t$, $t$🦁$t$, 5)
ON CONFLICT (id) DO NOTHING;
