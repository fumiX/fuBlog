export type OAuthUserInfoDto = {
  id_token: string;
  user: {
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    profilePicture?: Uint8Array;
  };
  isExisting: boolean;
};
