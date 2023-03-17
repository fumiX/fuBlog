export type UserInfo = {
  code: string;
  profile: {
    given_name: string;
    family_name: string;
    email: string;
    profilePicture?: Uint8Array;
  };
  tokens?: {
    access_token: string;
    id_token: string;
  };
};
