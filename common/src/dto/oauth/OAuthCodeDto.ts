import { OAuthType } from "@common/dto/oauth/OAuthType.js";

export type OAuthCodeDto = {
  code: string;
  issuer: string;
  type: OAuthType;
};
