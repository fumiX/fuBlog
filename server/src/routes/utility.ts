import express, { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source.js";
import { TagEntity } from "../entity/Tag.entity.js";

const router: Router = express.Router();

// get most used tags for wordcloud
router.get("/", async (req: Request, res: Response, next) => {
  AppDataSource.manager
    .getRepository(TagEntity)
    .createQueryBuilder()
    .select(["name", "cast(count(pt.tag_id) as integer) as value"])
    .leftJoin("post_tag", "pt", "pt.tag_id = id")
    .addGroupBy("pt.tag_id")
    .addGroupBy("name")
    .orderBy("count(pt.tag_id)", "DESC")
    .limit(15)
    .getRawMany()
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch(next);
});

export default router;
