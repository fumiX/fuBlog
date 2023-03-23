import { ExternalUserInfo } from "@fumix/fu-blog-common";

export type UserInfo = {
  code: string;
  profile: ExternalUserInfo;
  tokens?: {
    access_token: string;
    id_token: string;
  };
};
