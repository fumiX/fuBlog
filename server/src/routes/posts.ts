import { DraftResponseDto } from "@fumix/fu-blog-common";
import express, { Request, Response, Router } from "express";
import multer from "multer";
import { AppDataSource } from "../data-source.js";
import { AttachmentEntity } from "../entity/Attachment.entity.js";
import { PostEntity } from "../entity/Post.entity.js";
import { UserEntity } from "../entity/User.entity.js";
import { MarkdownConverterServer } from "../markdown-converter-server.js";

const router: Router = express.Router();
const upload = multer();

// create or get dummy user
async function getUser() {
  const email = "test@test.de";
  let createdUser = await AppDataSource.manager.getRepository(UserEntity).findOneBy({ email: email });

  if (createdUser === null) {
    const user: UserEntity = {
      username: "AlfredENeumann",
      email: email,
      fullName: "Alfred E. Neumann",
      roles: ["ADMIN", "POST_CREATE"],
      isActive: true,
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
  let searchTerm = "";
  if (req.params.search) {
    const splitSearchParams: string[] = req.params.search.trim().split(" ");
    const operator = req.params.operator === "or" ? " | " : " & ";

    const words = splitSearchParams
      .map((word) => escape(word))
      .filter(Boolean)
      .join(operator);

    // console.log("WORDS", words);
    searchTerm = "ts @@ to_tsquery('" + words + "')";
  }

  const allSearchedPosts = await AppDataSource.manager
    .getRepository(PostEntity)
    .createQueryBuilder()
    // .where("ts @@ to_tsquery(:searchTerm)", { words: searchTerm })
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

function convertAttachment(filename: string, buffer: Buffer, mimeType: string, post: PostEntity): AttachmentEntity {
  return {
    filename: filename,
    binaryData: buffer,
    mimeType: mimeType,
    post: post,
  };
}

// CREATE NEW POST
router.post("/new", upload.single("file"), async (req: Request, res: Response) => {
  const bodyJson = JSON.parse(req.body.body);
  // TODO handle
  try {
    const post: PostEntity = {
      title: bodyJson.title,
      description: bodyJson.description,
      markdown: bodyJson.markdown,
      createdBy: await getUser(),
      createdAt: new Date(),
      updatedAt: new Date(),
      sanitizedHtml: await MarkdownConverterServer.Instance.convert(bodyJson.markdown),
      updatedBy: undefined,
      draft: bodyJson.draft,
      attachments: [],
    };

    const savedPost = await AppDataSource.manager.getRepository(PostEntity).save<PostEntity>(post);
    const fileFromRequest = req.file;
    let attachmentEntity = null;

    // const filesFromRequest = req.files['fileFromRequest'][0];
    if (fileFromRequest) {
      // let attachments = files?.map((fileFromRequest: Multer.File) => convertAttachment(fileFromRequest.filename, fileFromRequest.buffer, fileFromRequest.mimetype, post));
      attachmentEntity = convertAttachment(fileFromRequest.originalname, fileFromRequest.buffer, fileFromRequest.mimetype, post);
      await AppDataSource.manager.getRepository(AttachmentEntity).save<AttachmentEntity>(attachmentEntity);
      savedPost.attachments.push(attachmentEntity);
    }
    let responseDto: DraftResponseDto;
    if (attachmentEntity !== null) {
      responseDto = {
        attachments: [
          {
            id: attachmentEntity?.id,
            binaryData: attachmentEntity.binaryData,
            mimeType: attachmentEntity.mimeType,
            filename: attachmentEntity.filename,
          },
        ],
        postId: savedPost.id,
      };
    } else {
      responseDto = { postId: savedPost.id, attachments: [] };
    }
    res.status(200).send(responseDto);
  } catch (e) {
    res.status(500).json({ error: "Fehler " + e });
  }
});

// EDIT EXISTING POST
router.post("/:id", upload.single("file"), async (req: Request, res: Response) => {
  const post = await AppDataSource.manager.getRepository(PostEntity).findOneBy({
    id: +req.params.id,
  });

  const bodyJson = JSON.parse(req.body.body);
  if (post) {
    try {
      await AppDataSource.manager
        .createQueryBuilder()
        .update("post")
        .set({
          title: bodyJson.title,
          description: bodyJson.description,
          markdown: bodyJson.markdown,
          updatedAt: new Date(),
          sanitizedHtml: await MarkdownConverterServer.Instance.convert(bodyJson.markdown),
          updatedBy: await getUser(),
          draft: bodyJson.draft,
        })
        .where("id = :id", { id: post.id })
        .execute();

      const fileFromRequest = req.file;
      let attachmentEntity = null;

      // const filesFromRequest = req.files['fileFromRequest'][0];
      if (fileFromRequest) {
        // let attachments = files?.map((fileFromRequest: Multer.File) => convertAttachment(fileFromRequest.filename, fileFromRequest.buffer, fileFromRequest.mimetype, post));
        attachmentEntity = convertAttachment(fileFromRequest.originalname, fileFromRequest.buffer, fileFromRequest.mimetype, post);
        await AppDataSource.manager.getRepository(AttachmentEntity).save<AttachmentEntity>(attachmentEntity);
        post.attachments = [];
        post.attachments.push(attachmentEntity);
      }
      let responseDto: DraftResponseDto;
      if (attachmentEntity !== null) {
        responseDto = {
          attachments: [
            {
              id: attachmentEntity?.id,
              binaryData: attachmentEntity.binaryData,
              mimeType: attachmentEntity.mimeType,
              filename: attachmentEntity.filename,
            },
          ],
          postId: post.id,
        };
      } else {
        responseDto = { postId: post.id, attachments: [] };
      }
      res.status(200).send(responseDto);
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
