import { DraftResponseDto, EditPostRequestDto, NewPostRequestDto, permissionsForUser } from "@fumix/fu-blog-common";
import { FileEntity } from "../entity/File.entity.js";
import express, { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import { AppDataSource } from "../data-source.js";
import { AttachmentEntity } from "../entity/Attachment.entity.js";
import { PostEntity } from "../entity/Post.entity.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { InternalServerError } from "../errors/InternalServerError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { TagEntity } from "../entity/Tag.entity.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { MarkdownConverterServer } from "../markdown-converter-server.js";
import { authMiddleware } from "../service/middleware/auth.js";
import { extractJsonBody, extractUploadFiles, multipleFilesUpload } from "../service/middleware/files-upload.js";

const router: Router = express.Router();
const upload = multer();

// search posts
router.get("/page/:page([0-9]+)/count/:count([0-9]+)/search/:search/operator/:operator", async (req: Request, res: Response, next) => {
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
router.get("/:id([1-9][0-9]*)", async (req: Request, res: Response, next) => {
  await AppDataSource.manager
    .getRepository(PostEntity)
    .findOne({
      where: {
        id: +req.params.id,
      },
      relations: ["createdBy", "updatedBy", "tags"],
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

async function convertAttachment(post: PostEntity, file: Express.Multer.File): Promise<AttachmentEntity> {
  return {
    filename: file.originalname,
    file: await FileEntity.fromData(file.buffer),
    post,
  };
}

// CREATE NEW POST
router.post("/new", authMiddleware, multipleFilesUpload, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const body: NewPostRequestDto | undefined = JSON.parse(req.body?.json) as NewPostRequestDto;
  const loggedInUser = await req.loggedInUser?.();

  if (!body) {
    return next(new BadRequestError());
  } else if (!loggedInUser) {
    return next(new UnauthorizedError());
  } else if (!permissionsForUser(loggedInUser.user).canCreatePost) {
    return next(new ForbiddenError());
  }

  // TODO handle
  try {
    const tagsToUseInPost: TagEntity[] = await getPersistedTagsForPost(body).catch((err) => {
      throw new InternalServerError(true, "Error getting tags" + err);
    });
    const post: PostEntity = {
      title: body.title,
      description: body.description,
      markdown: body.markdown,
      createdBy: loggedInUser.user,
      createdAt: new Date(),
      sanitizedHtml: await MarkdownConverterServer.Instance.convert(
        body.markdown,
        (hash: string) => new Promise((resolve, reject) => resolve(`/api/file/${hash}`)),
      ),
      draft: !!body.draft,
      attachments: [],
      tags: tagsToUseInPost,
    };

    // TODO: Make this a transaction with proper rollback and error message
    const savedPost = await AppDataSource.manager.getRepository(PostEntity).save<PostEntity>(post).catch(next);

    if (savedPost) {
      const attachmentEntities: AttachmentEntity[] = await Promise.all(extractUploadFiles(req).map((it) => convertAttachment(post, it)));
      if (attachmentEntities.length > 0) {
        await AppDataSource.createQueryBuilder()
          .insert()
          .into(FileEntity)
          .values(attachmentEntities.map((it) => it.file))
          .onConflict('("sha256") DO NOTHING')
          .execute();
        await AppDataSource.getRepository(AttachmentEntity)
          .save<AttachmentEntity>(attachmentEntities)
          .then((it) => {
            res.status(201).json({ postId: savedPost.id, attachments: attachmentEntities } as DraftResponseDto);
          })
          .catch(next);
      } else {
        res.status(201).json({ postId: savedPost.id, attachments: [] } as DraftResponseDto);
      }
    } else {
      next(new InternalServerError(true, "Could not create post!"));
    }
  } catch (e) {
    next(e);
  }
});

async function getPersistedTagsForPost(bodyJson: any) {
  const tagsToUseInPost: TagEntity[] = [];
  const alreadySavedTags = await AppDataSource.manager
    .getRepository(TagEntity)
    .createQueryBuilder("tagEntity")
    .select()
    .where("tagEntity.name IN(:...names)", { names: bodyJson.stringTags })
    .getMany();
  tagsToUseInPost.push(...alreadySavedTags);

  const unsavedTags = bodyJson.stringTags
    ?.filter((tag: string) => {
      return !alreadySavedTags.some((tagEntity: TagEntity) => {
        return tagEntity.name === tag;
      });
    })
    .map(
      (tagToSave: string) =>
        <TagEntity>{
          name: tagToSave,
        },
    );

  const newlySavedTags = await AppDataSource.manager.getRepository(TagEntity).save(unsavedTags);
  tagsToUseInPost.push(...newlySavedTags);

  return tagsToUseInPost.filter((value) => value !== null && value !== undefined);
}

// EDIT EXISTING POST
router.post("/:id([1-9][0-9]*)", authMiddleware, multipleFilesUpload, async (req: Request, res: Response, next) => {
  const postId = +req.params.id;
  const post = await AppDataSource.manager.getRepository(PostEntity).findOneBy({
    id: postId,
  });

  const body = extractJsonBody<EditPostRequestDto>(req);

  if (!post || postId < 1) {
    return next(new NotFoundError("Post not found"));
  } else if (!body) {
    return next(new BadRequestError());
  }
  const account = await req.loggedInUser?.();
  if (!account) {
    return next(new UnauthorizedError());
  } else if (!permissionsForUser(account.user).canEditPost && (account.user.id === null || account.user.id !== post.createdBy?.id)) {
    return next(new ForbiddenError());
  }

  const tagsToUseInPost: TagEntity[] = await getPersistedTagsForPost(body).catch((err) => {
    throw new InternalServerError(true, "Error getting tags" + err);
  });

  AppDataSource.manager
    .transaction(async (manager) => {
      manager
        .getRepository(PostEntity)
        .update(postId, {
          title: body.title,
          description: body.description,
          markdown: body.markdown,
          updatedAt: new Date(),
          sanitizedHtml: await MarkdownConverterServer.Instance.convert(body.markdown),
          updatedBy: account.user,
          draft: body.draft,
          // tags: tagsToUseInPost,
        })
        .then((updateResult) => {
          // TODO: Optimize, so unchanged attachments are not deleted and re-added
          manager.getRepository(AttachmentEntity).delete({ post: { id: post.id } });
          //manager.getRepository(AttachmentEntity).insert(extractUploadFiles(req).map((it) => convertAttachment(post, it)));
          // tagsToUseInPost.forEach((tag) => {
          //   manager.getRepository(PostEntity).createQueryBuilder().relation(PostEntity, "tags").add(tag);
          // });
        })
        .catch(next);
      // many to many cant be updated so we have to save again
      return manager
        .getRepository(PostEntity)
        .findOneByOrFail({ id: postId })
        .then((post) => {
          post.tags = tagsToUseInPost;
          return post;
        })
        .then((updatedPost) => manager.getRepository(PostEntity).save(updatedPost))
        .catch(next);
    })
    .then((it) => res.status(200).json({ postId: post.id } as DraftResponseDto))
    .catch(next);
});

// DELETE POST
router.get("/delete/:id([0-9]+)", async (req: Request, res: Response, next) => {
  await AppDataSource.manager.transaction(async (manager) => {
    // find all attachments of post and delete them
    manager
      .getRepository(AttachmentEntity)
      .delete({ post: { id: +req.params.id } })
      .then((r) => {
        // find post in DB and delete it
        manager
          .getRepository(PostEntity)
          .delete(+req.params.id)
          .then((it) => res.status(200).send(it))
          .catch(next);
      })
      .catch(next);
  });
});

export default router;
