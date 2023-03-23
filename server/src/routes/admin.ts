import express, { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source.js";
import { UserEntity } from "../entity/User.entity.js";

const router: Router = express.Router();

router.get("/users", async (req, res) => {
  const users = await AppDataSource.manager.getRepository(UserEntity).find({ order: { id: "ASC" } });
  res.status(200).json(users);
});

// UPDATE USER ROLES
router.post("/users/roles/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const bodyJson = req.body;
    await AppDataSource.manager
      .createQueryBuilder()
      .update("user")
      .set({
        roles: [...bodyJson.roles],
      })
      .where("id = :id", { id: userId })
      .execute();
    res.status(200).json({ message: "Successfuly updated userId --> " + userId });
  } catch (e) {
    res.status(500).json({ error: "Error " + e });
  }
});

export default router;
