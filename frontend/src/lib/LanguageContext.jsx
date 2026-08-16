import { createContext, useContext, useState, useCallback } from "react";
import { getStoredLanguage, setStoredLanguage, translate } from "./i18n.js";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getStoredLanguage());

  const changeLang = useCallback((next) => {
    setLang(next);
    setStoredLanguage(next);
  }, []);

  const t = useCallback((key) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
