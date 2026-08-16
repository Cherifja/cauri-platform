import { useLanguage } from "../lib/LanguageContext.jsx";

export default function PaymentMethods() {
  const { t } = useLanguage();

  const METHODS = [
    { label: t("payments.card"), desc: t("payments.cardDesc") },
    { label: t("payments.mobileMoney"), desc: t("payments.mobileMoneyDesc") },
    { label: t("payments.transfer"), desc: t("payments.transferDesc") },
    { label: t("payments.secure"), desc: t("payments.secureDesc") },
  ];

  return (
    <div className="bg-ink">
      <div className="px-5 md:px-8 py-8 md:py-14 max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] mb-2 text-gold">{t("payments.tagline")}</p>
        <h2 className="text-2xl md:text-3xl leading-snug mb-6 md:mb-8 font-display font-semibold text-cream md:max-w-xl">
          {t("payments.title")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-6">
          {METHODS.map((m) => (
            <div key={m.label} className="border-t border-ink2 pt-3">
              <p className="text-sm font-medium mb-1 text-cream">{m.label}</p>
              <p className="text-xs leading-relaxed text-sandDeep">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
