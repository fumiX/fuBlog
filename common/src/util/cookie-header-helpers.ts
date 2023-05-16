import { Request, Response } from "express";

export class HttpHeader {
  public static Response = {
    /**
     * This header passes a refreshed OAuth token from the server
     * back to the client, as soon as the old one expired.
     */
    OAUTH_REFRESHED_ID_TOKEN: "X-OAuth-Token",
  };
  /**
   * Headers that are passed from the client to the server
   */
  public static Request = {
    AUTHORIZATION: "Authorization",
    OAUTH_ISSUER: "X-OAuth-Issuer",
    OAUTH_TYPE: "X-OAuth-Type",
  };
}
export class Cookies {
  private static REFRESH_TOKEN = "refresh";

  static setRefreshTokenCookie: (res: Response, newRefreshToken: string | undefined) => void = (res, newRefreshToken) => {
    if (newRefreshToken) {
      res.cookie(Cookies.REFRESH_TOKEN, newRefreshToken, { sameSite: "strict", secure: true, httpOnly: true });
    }
  };

  static getCookies: (req: Request) => { [key: string]: string } = (req) => {
    return Object.fromEntries(
      req
        .header("Cookie")
        ?.split(";")
        ?.map((it) => it.split("=", 2))
        ?.filter((it) => it && it.length === 2 && it.every((x) => x.trim().length > 0))
        ?.map((it) => [it[0].trim(), it[1].trim()]) ?? [],
    );
  };
}
