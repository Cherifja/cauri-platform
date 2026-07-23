const TAG_COLORS = {
  Lagune: "#1D6F6F",
  "Centre-ville": "#C1440E",
  Culture: "#E3A23C",
  Plage: "#1B3358",
};

export default function MapPreview({ tag, className = "h-40" }) {
  const accent = TAG_COLORS[tag] || "#1D6F6F";
  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, #12233F 0%, #1B3358 60%, ${accent} 140%)` }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 100">
        {[...Array(6)].map((_, i) => (
          <path
            key={i}
            d={`M0 ${10 + i * 15} Q 50 ${i * 12} 100 ${15 + i * 14} T 200 ${10 + i * 15}`}
            stroke="#F1E6D2"
            strokeWidth="0.6"
            fill="none"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full border-2 bg-clay border-cream" />
          <div className="w-0.5 h-6 bg-clay opacity-60" />
        </div>
      </div>
    </div>
  );
}
