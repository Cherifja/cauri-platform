export function StarDisplay({ rating, size = "text-sm" }) {
  const rounded = Math.round(rating);
  return (
    <span className={size} style={{ color: "#E3A23C" }}>
      {"★".repeat(rounded)}
      <span style={{ opacity: 0.3 }}>{"★".repeat(5 - rounded)}</span>
    </span>
  );
}

export function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="text-2xl leading-none"
          style={{ color: n <= value ? "#E3A23C" : "#E4D2B2" }}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
