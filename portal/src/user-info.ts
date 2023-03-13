export type UserInfo = {
  code: string;
  token: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: Uint8Array;
  };
};
