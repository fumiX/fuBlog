import { DraftResponseDto } from "@fumix/fu-blog-common";
import express, { Request, Response, Router } from "express";
import multer from "multer";
import { AppDataSource } from "../data-source.js";
import { AttachmentEntity } from "../entity/Attachment.entity.js";
import { PostEntity } from "../entity/Post.entity.js";
import { UserEntity } from "../entity/User.entity.js";
import { MarkdownConverterServer } from "../markdown-converter-server.js";
import { NotFoundError } from "../errors/NotFoundError.js";

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
      firstName: "Alfred E.",
      lastName: "Neumann",
      roles: ["ADMIN", "POST_CREATE"],
      isActive: true,
    };
    createdUser = await AppDataSource.manager.getRepository(UserEntity).save(user);
  }
  return createdUser;
}

// search posts
router.get("/page/:page/count/:count/search/:search/operator/:operator", async (req: Request, res: Response, next) => {
  const page = +req.params.page;
  const itemsPerPage = +req.params.count;
  const skipEntries = page * itemsPerPage - itemsPerPage;
  let searchTerm = "";
  if (req.params.search) {
    const splitSearchParams: string[] = req.params.search.trim().split(" ");
    const operator = req.params.operator === "or" ? " | " : " & ";

    searchTerm = splitSearchParams
      .map((word) => escape(word))
      .filter(Boolean)
      .join(operator);
  }

  await AppDataSource.manager
    .getRepository(PostEntity)
    .createQueryBuilder()
    .where("ts @@ to_tsquery(:searchTerm)", { searchTerm: searchTerm })
    .skip(skipEntries)
    .take(itemsPerPage)
    // .orderBy("createdAt", "DESC")
    .getManyAndCount()
    .then((result) => res.status(200).json({ data: result }))
    .catch((err) => next(err));
});

// get all posts with paging
router.get("/page/:page([0-9]+)/count/:count([0-9]+)/", async (req: Request, res: Response, next) => {
  const page = +req.params.page;
  const itemsPerPage = +req.params.count;
  const skipEntries = page * itemsPerPage - itemsPerPage;
  await AppDataSource.manager
    .getRepository(PostEntity)
    .findAndCount({
      order: {
        createdAt: "DESC",
      },
      skip: skipEntries,
      take: itemsPerPage,
      relations: ["createdBy", "updatedBy"],
    })
    .then((result) => res.status(200).json({ data: result }))
    .catch((error) => {
      next(error);
    });
});

// GET POST BY ID WITH RELATIONS TO USER
router.get("/:id([0-9]+)", async (req: Request, res: Response, next) => {
  await AppDataSource.manager
    .getRepository(PostEntity)
    .findOne({
      where: {
        id: +req.params.id,
      },
      relations: ["createdBy", "updatedBy"],
    })
    .then((result) => {
      if (result === null) {
        throw new NotFoundError("No post found with id " + req.params.id);
      } else {
        res.status(200).json({ data: result });
      }
    })
    .catch((error) => {
      next(error);
    });
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
router.post("/new", upload.single("file"), async (req: Request, res: Response, next) => {
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

    const savedPost = await AppDataSource.manager
      .getRepository(PostEntity)
      .save<PostEntity>(post)
      .catch((err) => next(err));
    const fileFromRequest = req.file;
    let attachmentEntity = null;

    // const filesFromRequest = req.files['fileFromRequest'][0];
    if (fileFromRequest) {
      // let attachments = files?.map((fileFromRequest: Multer.File) => convertAttachment(fileFromRequest.filename, fileFromRequest.buffer, fileFromRequest.mimetype, post));
      attachmentEntity = convertAttachment(fileFromRequest.originalname, fileFromRequest.buffer, fileFromRequest.mimetype, post);
      await AppDataSource.manager
        .getRepository(AttachmentEntity)
        .save<AttachmentEntity>(attachmentEntity)
        .catch((err) => next(err));
      if (savedPost instanceof PostEntity) {
        savedPost.attachments.push(attachmentEntity);
      }
    }
    let responseDto: DraftResponseDto = { attachments: [] };
    if (attachmentEntity !== null) {
      if (savedPost instanceof PostEntity) {
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
      }
    } else {
      if (savedPost instanceof PostEntity) {
        responseDto = { postId: savedPost.id, attachments: [] };
      }
    }
    res.status(200).send(responseDto);
  } catch (e) {
    next(e);
  }
});

// EDIT EXISTING POST
router.post("/:id([0-9]+)", upload.single("file"), async (req: Request, res: Response, next) => {
  const post = await AppDataSource.manager.getRepository(PostEntity).findOneBy({
    id: +req.params.id,
  });

  const bodyJson = JSON.parse(req.body.body);
  if (post) {
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
      .execute()
      .catch((err) => next(err));

    try {
      const fileFromRequest = req.file;
      let attachmentEntity = null;

      // const filesFromRequest = req.files['fileFromRequest'][0];
      if (fileFromRequest) {
        // let attachments = files?.map((fileFromRequest: Multer.File) => convertAttachment(fileFromRequest.filename, fileFromRequest.buffer, fileFromRequest.mimetype, post));
        attachmentEntity = convertAttachment(fileFromRequest.originalname, fileFromRequest.buffer, fileFromRequest.mimetype, post);
        await AppDataSource.manager
          .getRepository(AttachmentEntity)
          .save<AttachmentEntity>(attachmentEntity)
          .catch((err) => next(err));
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
      next(e);
    }
  }
});

// DELETE POST
router.get("/delete/:id([0-9]+)", async (req: Request, res: Response, next) => {
  // find all attachments of post and delete them
  await AppDataSource.manager
    .getRepository(AttachmentEntity)
    .delete({ post: { id: +req.params.id } })
    .catch((err) => next(err));
  // find post in DB and delete it
  const result = await AppDataSource.manager
    .getRepository(PostEntity)
    .delete(+req.params.id)
    .catch((err) => next(err));
  res.status(200).send(result);
});

export default router;
