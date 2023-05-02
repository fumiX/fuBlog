import { toProviderId, UserWithOAuthProviders } from "@fumix/fu-blog-common";
import express, { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source.js";
import { OAuthAccountEntity } from "../entity/OAuthAccount.entity.js";

const router: Router = express.Router();

router.get("/users", async (req, res, next) => {
  await AppDataSource.manager
    .getRepository(OAuthAccountEntity)
    .find({ relations: { user: true }, order: { user: { id: "ASC" } } })
    .then((result) => {
      return res.status(200).json(
        result
          .reduce((acc, it) => {
            if (it.user.id) {
              const existingUser = acc[it.user.id] ?? Object.assign(it.user, { oauthProviders: [] });
              existingUser.oauthProviders.push(toProviderId(it));
              acc[it.user.id] = existingUser;
            }
            return acc;
          }, [] as UserWithOAuthProviders[])
          .filter((it) => it != null),
      );
    })
    .catch((err) => next(err));
});

// UPDATE USER ROLES
router.post("/users/roles/:userId([0-9]+)", async (req: Request, res: Response, next) => {
  const userId = req.params.userId;
  const bodyJson = req.body;
  await AppDataSource.manager
    .createQueryBuilder()
    .update("user")
    .set({
      roles: [...bodyJson.roles],
    })
    .where("id = :id", { id: userId })
    .execute()
    .then((result) => res.status(200).json({ message: "Successfully updated userId --> " + userId }))
    .catch((err) => next(err));
});

export default router;
