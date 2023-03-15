export type UserInfo = {
  code: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: Uint8Array;
  };
  tokens?: {
    access_token: string;
    id_token: string;
  };
};
