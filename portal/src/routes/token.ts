import { faker } from "@faker-js/faker/locale/de";
import express, { Router } from "express";
import { userInfosById } from "../index.js";
import { UserInfo } from "../user-info.js";
import { createJwtToken } from "../util/jwt.js";

const OAUTH_SECRET = "secret";

const router: Router = express.Router();

router.post("/", (req, res) => {
  if (req.body.client_id !== "ID" || req.body.client_secret !== "secret") {
    throw new Error("Authentication failed!"); // TODO: Do a proper check of client ID and secret
  }
  const u: { userId: string; userInfo: UserInfo } | undefined = Object.entries(userInfosById)
    ?.map(([userId, userInfo]) => ({ userId, userInfo }))
    .find((it) => it.userInfo.code === req.body.code);
  if (u) {
    const { userId, userInfo } = u;
    const issuedAt = Math.floor(Date.now() / 1000);
    userInfosById[userId].tokens = {
      access_token: faker.string.alphanumeric(20),
      id_token: createJwtToken(OAUTH_SECRET, {
        sub: userId,
        name: `${userInfo.profile.fullName}`,
        iss: "https://localhost:5030",
        aud: "ID", // audience (client ID)
        exp: issuedAt + 3600, // expired
        iat: issuedAt,
      }),
    };
    res.status(200).json({
      id_token: userInfosById[userId].tokens.id_token,
      access_token: userInfosById[userId].tokens.access_token,
      token_type: "bearer",
      expires_in: 3600,
      //scope: "profile.read",
    });
  } else {
    res.status(404);
  }
});

export default router;
