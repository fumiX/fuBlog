import { HyperlinkDto } from "./HyperlinkDto.js";

export type AppSettingsDto = {
  appVersion: string | undefined;
  githubRepositorySlug: string | undefined;
  imprint: HyperlinkDto | undefined;
  isProduction: boolean;
  mainWebsite: HyperlinkDto | undefined;
  runMode: "development" | "production";
};
