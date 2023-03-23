import express, { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source.js";
import { UserEntity } from "../entity/User.entity.js";
import { permissionsForUser, UserDto } from "@fumix/fu-blog-common";
import logger from "../logger.js";

const router: Router = express.Router();

router.get("/users", async (req, res, next) => {
  await AppDataSource.manager
    .getRepository(UserEntity)
    .find({ order: { id: "ASC" } })
    .then((result) => {
      return res.status(200).json(
        result.map<UserDto>((u) => {
          return {
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            roles: u.roles,
            permissions: permissionsForUser(u),
            username: u.username,
            email: u.email,
            profilePictureUrl: u.profilePicture ? "data:image/jpeg;base64," + Buffer.from(u.profilePicture).toString("base64") : undefined,
          };
        }),
      );
    })
    .catch((err) => next(err));
});

router.post("/users/permissions/:userId([0-9]+)", async (req: Request, res: Response) => {
  logger.info("PERMISSIONS --> ", req.body.permissions);
  // const user = await AppDataSource.manager.getRepository(UserEntity).findOneBy({ id: +req.params.userId });
  const rBody = { userId: req.params.userId, permissions: req.body.permissions };

  res.status(200).json(rBody);
});

export default router;
