import express, { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source.js";
import { sanitizeHtml } from "@fumix/fu-blog-common";
import { UserEntity } from "../entity/User.entity.js";
import { PostEntity } from "../entity/Post.entity.js";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import { createDomPurify } from "../markdown-converter-server.js";

const router: Router = express.Router();

// create or get dummy user
async function getUser() {
  const email = "test@test.de";
  let createdUser = await AppDataSource.manager.getRepository(UserEntity).findOneBy({ email: email });

  if (createdUser === null) {
    const user: UserEntity = {
      username: "AlfredENeumann",
      email: email,
      firstName: "Alfred E.",
      lastName: "Neumann",
      roles: ["ADMIN", "POST_CREATE"],
    };

    createdUser = await AppDataSource.manager.getRepository(UserEntity).save(user);
  }

  return createdUser;
}

// search posts
router.get("/page/:page/count/:count/search/:search/operator/:operator", async (req: Request, res: Response) => {
  const page = +req.params.page;
  const itemsPerPage = +req.params.count;
  const skipEntries = page * itemsPerPage - itemsPerPage;
  let searchTerm = "true";
  if (req.params.search) {
    const splitSearchParams: string[] = req.params.search.split(" ");
    const operator = req.params.operator === "or" ? " | " : " & ";

    const words = splitSearchParams.map((word) => word).join(operator);
    searchTerm = "ts @@ to_tsquery('" + words + "')";
  }

  const allSearchedPosts = await AppDataSource.manager
    .getRepository(PostEntity)
    .createQueryBuilder()
    .where(searchTerm)
    .skip(skipEntries)
    .take(itemsPerPage)
    // .orderBy("createdAt", "DESC")
    .getManyAndCount();

  res.status(200).json({ data: allSearchedPosts });
});

// get all posts with paging
router.get("/page/:page/count/:count/", async (req: Request, res: Response) => {
  const page = +req.params.page;
  const itemsPerPage = +req.params.count;
  const skipEntries = page * itemsPerPage - itemsPerPage;
  const allPosts = await AppDataSource.manager.getRepository(PostEntity).findAndCount({
    order: {
      createdAt: "DESC",
    },
    skip: skipEntries,
    take: itemsPerPage,
  });

  res.status(200).json({ data: allPosts });
});

// GET POST BY ID
router.get("/:id", async (req: Request, res: Response) => {
  const post = await AppDataSource.manager.getRepository(PostEntity).findOneBy({
    id: +req.params.id,
  });

  if (post === null) {
    res.status(404).json({ error: "No such post" });
  } else {
    res.status(200).json({ data: post });
  }
});

// CREATE NEW POST
router.post("/new", async (req: Request, res: Response) => {
  try {
    const post: PostEntity = {
      title: req.body.title,
      description: req.body.description,
      markdown: req.body.markdown,
      createdBy: await getUser(),
      createdAt: new Date(),
      updatedAt: new Date(),
      sanitizedHtml: sanitizeHtml(req.body.markdown, createDomPurify()),
      updatedBy: undefined,
      draft: req.body.draft || true,
      attachments: [],
    };

    const results = await AppDataSource.manager.getRepository(PostEntity).save<PostEntity>(post);
    res.status(200).send(results);
  } catch (e) {
    res.status(500).json({ error: "Fehler " + e });
  }
});

// EDIT EXISTING POST
router.post("/:id", async (req: Request, res: Response) => {
  const post = await AppDataSource.manager.getRepository(PostEntity).findOneBy({
    id: +req.params.id,
  });

  if (post === null) {
    res.status(404).json({ error: "No such post" });
  } else {
    post.title = req.body.title;
    post.description = req.body.description;
    post.markdown = req.body.markdown;
    post.updatedAt = new Date();
    post.sanitizedHtml = sanitizeHtml(req.body.markdown, createDomPurify());
    post.updatedBy = await getUser();
    // TODO
    post.draft = req.body.draft || true;
    post.attachments = [];

    try {
      const results = await AppDataSource.manager.getRepository(PostEntity).save(post);
      res.status(200).send(results);
    } catch (e) {
      res.status(500).json({ error: "Fehler " + e });
    }
  }
});

// DELETE POST
router.get("/delete/:id", async (req: Request, res: Response) => {
  try {
    // find post in DB and delete it
    const result = await AppDataSource.manager.getRepository(PostEntity).delete(+req.params.id);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).json({ error: "Fehler " + e });
  }
});

export default router;
