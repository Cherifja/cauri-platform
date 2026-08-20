import { useEffect, useState } from "react";
import { discover } from "../lib/api.js";

const FALLBACK_GRADIENTS = [
  "from-[#0E4D64] to-[#1B7A8C]",
  "from-[#1B4B6B] to-[#2E86AB]",
  "from-[#5C3B1E] to-[#8A5A2E]",
  "from-[#C1440E] to-[#E3A23C]",
  "from-[#3D5A1E] to-[#6B8E3D]",
];

function DestinationMedia({ spot, index }) {
  if (spot.video_url) {
    return (
      <video
        src={spot.video_url}
        controls
        className="w-full h-40 object-cover bg-black"
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  if (spot.photo_url) {
    return <img src={spot.photo_url} alt={spot.name} className="w-full h-40 object-cover" />;
  }
  const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  return (
    <div className={`h-28 flex items-center justify-center bg-gradient-to-br ${gradient}`}>
      <span className="text-4xl">{spot.icon || "📍"}</span>
    </div>
  );
}

export default function Discover() {
  const [spots, setSpots] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    discover
      .list()
      .then((data) => {
        setSpots(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="bg-cream min-h-full">
      <div className="px-5 md:px-8 pt-10 pb-8 bg-gradient-to-b from-ink to-ink2">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">À découvrir</p>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-cream">
            Le Bénin autour de votre séjour
          </h1>
        </div>
      </div>

      <div className="px-5 md:px-8 py-8 max-w-4xl mx-auto">
        {status === "loading" && <p className="text-sm text-ink2">Chargement…</p>}
        {status === "error" && (
          <p className="text-sm text-clay">Impossible de charger les destinations pour le moment.</p>
        )}
        {status === "ready" && spots.length === 0 && (
          <p className="text-sm text-ink2">Aucune destination pour l'instant.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spots.map((spot, index) => {
            const isOpen = openItem === spot.id;
            return (
              <div key={spot.id} className="rounded-xl overflow-hidden bg-white border border-sandDeep">
                <DestinationMedia spot={spot} index={index} />
                <button
                  onClick={() => setOpenItem(isOpen ? null : spot.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink900">{spot.name}</p>
                    <span className="text-ink2 text-xs">{isOpen ? "−" : "+"}</span>
                  </div>
                  {spot.short_desc && <p className="text-xs mt-1 text-ink2">{spot.short_desc}</p>}
                  {isOpen && spot.detail && (
                    <p className="text-xs mt-3 pt-3 border-t border-sandDeep leading-relaxed text-ink900">
                      {spot.detail}
                    </p>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
