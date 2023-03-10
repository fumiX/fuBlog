import express, { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source.js";
import { PostEntity } from "../entity/Post.entity.js";
import { UserEntity } from "../entity/User.entity.js";
import { AttachmentEntity } from "../entity/Attachment.entity.js";
import { MarkdownConverterServer } from "../markdown-converter-server.js";

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
    relations: ["createdBy", "updatedBy"],
  });

  res.status(200).json({ data: allPosts });
});

// GET POST BY ID WITH RELATIONS TO USER
router.get("/:id", async (req: Request, res: Response) => {
  const post = await AppDataSource.manager.getRepository(PostEntity).findOne({
    where: {
      id: +req.params.id,
    },
    relations: ["createdBy", "updatedBy"],
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
      sanitizedHtml: await MarkdownConverterServer.Instance.convert(req.body.markdown),
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

  const postId = post?.id;

  if (post === null || !postId) {
    res.status(404).json({ error: "No such post" });
  } else {
    post.title = req.body.title;
    post.description = req.body.description;
    post.markdown = req.body.markdown;
    post.updatedAt = new Date();
    post.sanitizedHtml = await MarkdownConverterServer.Instance.convert(req.body.markdown);
    post.updatedBy = await getUser();
    post.draft = req.body.draft || true;

    // TODO: get attachments from client .....
    try {
      await AppDataSource.manager.getRepository(PostEntity).update(postId, post);
      const results = await AppDataSource.manager.getRepository(PostEntity).findOneBy({ id: +req.params.id });
      res.status(200).send(results);
    } catch (e) {
      res.status(500).json({ error: "Fehler " + e });
    }
  }
});

// DELETE POST
router.get("/delete/:id", async (req: Request, res: Response) => {
  try {
    // find all attachments of post and delete them
    await AppDataSource.manager.getRepository(AttachmentEntity).delete({ post: { id: +req.params.id } });
    // find post in DB and delete it
    const result = await AppDataSource.manager.getRepository(PostEntity).delete(+req.params.id);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).json({ error: "Fehler " + e });
  }
});

export default router;
