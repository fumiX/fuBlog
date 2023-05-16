import { ClientSettings } from "../settings.js";

// Origins that are allowed to call our site / pull data off of our site!
const corsWhiteList = [`${ClientSettings.BASE_URL}`, `http://127.0.0.1:${ClientSettings.PORT}`];

export const corsOptions = {
  origin: (origin: string | undefined, callback: (arg0: Error | null, arg1: boolean) => void): void => {
    const typedOrigin: string = origin !== undefined ? origin : "";
    if (corsWhiteList.includes(typedOrigin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed: " + typedOrigin), false);
    }
  },
  optionSuccessStatus: 200,
};
