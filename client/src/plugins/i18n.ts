import { createI18n } from "vue-i18n";
import de from "../i18n/de.json";
import en from "../i18n/en.json";

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false,
  locale: import.meta.env.VITE_I18N_LOCALE ?? "de",
  fallbackLocale: import.meta.env.VITE_I18N_FALLBACK_LOCALE ?? "en",
  messages: { de, en },
});

export const t = (key: string): string => {
  return key ? i18n.global.t(key) : key;
};
export const tc = (key: string, n: number): string => {
  return key ? i18n.global.t(key, { n }, n) : key;
};

export default i18n;
