import express, { Router } from "express";
import { userInfosById } from "../index.js";

const router: Router = express.Router();

router.post("/", (req, res) => {
  const [userId, userInfo] = Object.entries(userInfosById).find(([, userInfo]) => userInfo.tokens?.access_token === req.body?.access_token);

  if (userInfo) {
    res.status(200).json(
      Object.assign(userInfo.profile, {
        sub: userId,
      }),
    );
  } else {
    res.status(404);
  }
});

export default router;
