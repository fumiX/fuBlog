import de from "../i18n/de.json";
import en from "../i18n/en.json";
import { createI18n } from "vue-i18n";

const i18n = createI18n({
  legacy: false,
  locale: import.meta.env.VITE_I18N_LOCALE || "de",
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE || "en",
  messages: { de, en },
});

export default i18n;
