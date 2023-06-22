import { EditPostRequestDto, NewPostRequestDto, permissionsForUser, PostRequestDto, SavePostResponseDto } from "@fumix/fu-blog-common";
import { GoneError } from "../errors/GoneError.js";
import express, { NextFunction, Request, Response, Router } from "express";
import { In, IsNull } from "typeorm";
import { AppDataSource } from "../data-source.js";
import { AttachmentEntity } from "../entity/Attachment.entity.js";
import { FileEntity } from "../entity/File.entity.js";
import { PostEntity } from "../entity/Post.entity.js";
import { TagEntity } from "../entity/Tag.entity.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { InternalServerError } from "../errors/InternalServerError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { MarkdownConverterServer } from "../markdown-converter-server.js";
import { authMiddleware } from "../service/middleware/auth.js";
import { extractJsonBody, extractUploadFiles, multipleFilesUpload } from "../service/middleware/files-upload.js";
import { generateShareImage } from "../service/opengraph.js";
import logger from "../logger.js";
import { OAuthAccountEntity } from "@server/entity/OAuthAccount.entity.js";

const router: Router = express.Router();

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
    .createQueryBuilder(PostEntity, "post")
    .select(["post.id as post_id", "ts_rank_cd(sp.post_tsv, to_tsquery(:searchTerm)) as rank", "count(*) over() as count"])
    .setParameter("searchTerm", searchTerm)
    .leftJoin("search_posts", "sp", "sp.post_id = id")
    .where("sp.post_tsv @@ to_tsquery(:searchTerm)", { searchTerm: searchTerm })
    .orderBy("rank", "DESC")
    .offset(skipEntries)
    .limit(itemsPerPage)
    .getRawMany()
    .then(async (result) => {
      const idArray = result?.map((r) => parseInt(r.post_id)) as number[];
      const count = result?.map((r) => parseInt(r.count)) as number[];

      await AppDataSource.manager
        .getRepository(PostEntity)
        .find({
          where: { id: In(idArray) },
          relations: ["createdBy", "updatedBy", "tags"],
        })
        .then((result) => res.status(200).json({ data: [result, count[0]] }));
    })
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
      where: {
        autosaveRefPost: IsNull(),
        autosaveRefUser: IsNull(),
        draft: false,
      },
      order: {
        createdAt: "DESC",
      },
      skip: skipEntries,
      take: itemsPerPage,
      relations: ["createdBy", "updatedBy", "tags", "autosaveRefPost", "autosaveRefUser"],
    })
    .then((result) => res.status(200).json({ data: result }))
    .catch((error) => {
      next(error);
    });
});

// GET POST BY ID WITH RELATIONS TO USER
router.get("/:id(\\d+$)", async (req: Request, res: Response, next) => {
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
        next(new GoneError("No post found with id " + req.params.id));
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
router.post(
  "/new",
  authMiddleware,
  multipleFilesUpload,
  async (req: Request, res: Response<SavePostResponseDto>, next: NextFunction): Promise<void> => {
    const body: NewPostRequestDto | undefined = JSON.parse(req.body?.json) as NewPostRequestDto;
    const loggedInUser = await req.loggedInUser?.();

    if (!body) {
      return next(new BadRequestError());
    } else if (!loggedInUser) {
      return next(new UnauthorizedError());
    } else if (!permissionsForUser(loggedInUser.user).canCreatePost) {
      return next(new ForbiddenError());
    }
    AppDataSource.manager
      .transaction(async (manager) => {
        await manager.query("SET CONSTRAINTS ALL DEFERRED");
        const tags = body.stringTags.map((name) => ({ name: name.trim() }));
        return manager
          .createQueryBuilder(TagEntity, "tag")
          .insert()
          .values(tags)
          .onConflict('("name") DO UPDATE SET "name" = EXCLUDED."name"')
          .execute()
          .then(async (it): Promise<SavePostResponseDto> => {
            const post: PostEntity = {
              title: body.title,
              description: body.description,
              markdown: body.markdown,
              createdBy: loggedInUser.user,
              createdAt: new Date(),
              sanitizedHtml: await MarkdownConverterServer.Instance.convert(body.markdown),
              draft: body.draft,
              attachments: [],
              tags,
            };

            const insertResult = await manager.getRepository(PostEntity).insert(post);
            await manager.createQueryBuilder(PostEntity, "tags").relation("tags").of(post).add(tags);
            const attachmentEntities: AttachmentEntity[] = await Promise.all(
              extractUploadFiles(req).map((it) => convertAttachment(post, it)),
            );
            if (attachmentEntities.length > 0) {
              await manager
                .createQueryBuilder()
                .insert()
                .into(FileEntity)
                .values(attachmentEntities.map((it) => it.file))
                .onConflict('("sha256") DO NOTHING')
                .execute();
              return await manager
                .getRepository(AttachmentEntity)
                .insert(attachmentEntities)
                .then((it) => {
                  return { postId: post.id, attachments: attachmentEntities };
                });
            } else {
              return { postId: post.id, attachments: [] };
            }
          })
          .catch((err) => {
            throw new InternalServerError(true, "Could not create post " + err);
          });
      })
      .then((response) => res.status(201).json(response))
      .catch((err) => next(err));
  },
);

async function saveAutosave(
  body: PostRequestDto,
  postRef: PostEntity | undefined,
  user: OAuthAccountEntity,
  attachmentEntities: AttachmentEntity[],
): Promise<SavePostResponseDto> {
  return AppDataSource.manager.transaction(async (manager) => {
    await manager.query("SET CONSTRAINTS ALL DEFERRED");
    const tags = body.stringTags.map((name) => ({ name: name.trim() }));
    return manager
      .createQueryBuilder(TagEntity, "tag")
      .insert()
      .values(tags)
      .onConflict('("name") DO UPDATE SET "name" = EXCLUDED."name"')
      .execute()
      .then(async (it): Promise<SavePostResponseDto> => {
        const post: PostEntity = {
          title: body.title,
          description: body.description,
          markdown: body.markdown,
          createdBy: user.user,
          createdAt: new Date(),
          sanitizedHtml: await MarkdownConverterServer.Instance.convert(body.markdown),
          draft: true,
          attachments: [],
          tags,
          autosaveRefPost: postRef,
        };

        const insertResult = await manager.getRepository(PostEntity).insert(post);
        await manager.createQueryBuilder(PostEntity, "tags").relation("tags").of(post).add(tags);
        if (attachmentEntities.length > 0) {
          await manager
            .createQueryBuilder()
            .insert()
            .into(FileEntity)
            .values(attachmentEntities.map((it) => it.file))
            .onConflict('("sha256") DO NOTHING')
            .execute();
          return await manager
            .getRepository(AttachmentEntity)
            .insert(attachmentEntities)
            .then((it) => {
              return { postId: post.id, attachments: attachmentEntities };
            });
        } else {
          return { postId: post.id, attachments: [] };
        }
      })
      .catch((err) => {
        throw new InternalServerError(true, "Could not create autosave " + err);
      });
  });
}

async function getPersistedTagsForPost(post: PostEntity, bodyJson: PostRequestDto): Promise<TagEntity[]> {
  if (!bodyJson.stringTags || bodyJson.stringTags.length <= 0) {
    return Promise.resolve([]);
  }

  const tagsToUseInPost: TagEntity[] = [];
  const alreadySavedTags =
    bodyJson.stringTags?.length > 0
      ? await AppDataSource.manager
          .getRepository(TagEntity)
          .createQueryBuilder("tagEntity")
          .select()
          .where("tagEntity.name IN(:...names)", { names: bodyJson.stringTags })
          .getMany()
      : await Promise.all([]);
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

// autocompletion suggestions (fuzzy search) for tags
router.get("/tags/:search", async (req: Request, res: Response, next) => {
  await AppDataSource.manager
    .getRepository(TagEntity)
    .createQueryBuilder()
    .select()
    .where("SIMILARITY(name, :search) > 0.3", { search: req.params.search })
    .orderBy("SIMILARITY(name, '" + req.params.id + "')", "DESC")
    .limit(5)
    .getMany()
    .then((result) => res.status(200).json({ data: result }))
    .catch(next);
});

// delete autosave
router.delete("/autosave/:id(\\d+$)", authMiddleware, async (req: Request, res: Response, next) => {
  const account = await req.loggedInUser?.();
  if (!account) {
    return next(new UnauthorizedError());
  } else if (!permissionsForUser(account.user).canEditPost && account.user.id === null) {
    return next(new ForbiddenError());
  }
  logger.info("Deleting autosave");
  await deletePostEntity(+req.params.id)
    .then((it) => res.sendStatus(200))
    .catch(next);
});

// find any relevant autosave for the user
router.get("/autosave", authMiddleware, async (req, res, next) => {
  logger.info("Looking for user related autosaves...");
  const account = await req.loggedInUser?.();
  if (!account) {
    return next(new UnauthorizedError());
  } else if (!permissionsForUser(account.user).canEditPost && account.user.id === null) {
    return next(new ForbiddenError());
  }
  await AppDataSource.manager
    .getRepository("post")
    .find({ where: { autosaveRefUser: account.user } })
    .then((autosave) => res.status(200).send({ data: autosave }))
    .catch(next);
});

// find any relevant autosave for the post
router.get("/autosave/:id(\\d+$)", async (req, res, next) => {
  if (+req.params.id) {
    logger.info("Looking for post related autosaves..." + req.params.id);
    await AppDataSource.manager
      .getRepository("post")
      .findOne({ where: { autosaveRefPost: { id: +req.params.id } } })
      .then((autosave) => {
        logger.info("found " + JSON.stringify(autosave));
        return res.status(200).send({ data: autosave });
      })
      .catch(next);
  }
});

// deletes autosaves referencing a post, if any
async function deleteAnyAutosaveForPost(postId: number) {
  return await AppDataSource.manager.getRepository("post").delete({ autosaveRefPost: postId });
}

// deletes autosaves referencing a user, if any
async function deleteAnyAutosaveForUser(userId: number) {
  return await AppDataSource.manager.getRepository("post").delete({ autosaveRefUser: userId });
}

// EDIT EXISTING POST
router.post("/:id(\\d+$)", authMiddleware, multipleFilesUpload, async (req: Request, res: Response, next) => {
  let shouldUpdate = true;
  // first assume to edit the post
  let postId: number = +req.params.id;
  let post: PostEntity = await AppDataSource.manager.getRepository(PostEntity).findOneByOrFail({
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

  const postPartial = {
    title: body.title,
    description: body.description,
    markdown: body.markdown,
    updatedAt: new Date(),
    sanitizedHtml: await MarkdownConverterServer.Instance.convert(body.markdown),
    updatedBy: account.user,
    draft: body.draft,
  };

  const tagsToUseInPost: TagEntity[] = await getPersistedTagsForPost(post, body).catch((err) => {
    throw new InternalServerError(true, "Error getting tags" + err);
  });

  // TODO: do this correctly
  let entityToUpdate: Promise<PostEntity>;

  if (body.autosave) {
    const attachmentEntities: AttachmentEntity[] = await Promise.all(extractUploadFiles(req).map((it) => convertAttachment(post, it)));

    findAnyAutosaveForPost(postId)
      .then((foundAutosave) => {
        if (foundAutosave) {
          // so that later we update the autosave entity instead of the post itself
          post = foundAutosave;
          postId = Number(foundAutosave.id);
          // TODO : avoid saving before this is set -> async
          entityToUpdate = new Promise((resolve) => post);
        } else {
          // no autosave found for post -> create a new autosave
          shouldUpdate = false;
          saveAutosave(body, post, account, attachmentEntities)
            .then((response) => res.status(201).json(response))
            .catch(next);
          entityToUpdate = Promise.reject();
        }
      })
      .catch(next);
  } else {
    entityToUpdate = new Promise<PostEntity>((resolve) => post);
  }

  Promise.resolve(entityToUpdate).then(() => {
    // only relevant if post or autosave entity should be updated
    if (shouldUpdate && post) {
      // update post or autosave
      AppDataSource.manager
        .transaction(async (manager) => {
          manager
            .getRepository(PostEntity)
            .update(postId, postPartial)
            .then((updateResult) => {
              // TODO: Optimize, so unchanged attachments are not deleted and re-added
              manager.getRepository(AttachmentEntity).delete({ post: { id: post.id } });
              // manager.getRepository(AttachmentEntity).insert(extractUploadFiles(req).map((it) => convertAttachment(post, it)));
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
        .then((it) => {
          if (post.id && !body.autosave) {
            deleteAnyAutosaveForPost(post.id);
          }
          return res.status(200).json({ postId: post.id } as SavePostResponseDto);
        })
        .catch(next);
    }
  });
});

// DELETE POST
router.delete("/:id(\\d+$)", authMiddleware, async (req: Request, res: Response, next) => {
  // first delete possible autosave referencing the post
  findAnyAutosaveForPost(+req.params.id)
    .then((found) => {
      if (found?.id) {
        logger.info("deleting found autosave");
        deletePostEntity(found.id);
      }
    })
    .then(() => {
      // then the actual post
      logger.info("deleting found post");
      deletePostEntity(+req.params.id)
        .then((post) => res.sendStatus(200))
        .catch(next);
    })
    .catch(next);
});

// returns any autosave referencing the post with the given postId
const findAnyAutosaveForPost = async (postId: number) => {
  return await AppDataSource.manager.findOne(PostEntity, { where: { autosaveRefPost: { id: postId } } }).catch(() => Promise.resolve());
};

// deletes a PostEntity. Autosaves referencing must be deleted prior.
const deletePostEntity = async (postId: number) => {
  await AppDataSource.manager.transaction(async (manager) => {
    // find all attachments of post and delete them
    await manager.getRepository(AttachmentEntity).delete({ post: { id: postId } });

    // cannot simply delete a post cause of the fk_constraint to tags (many_to_many)
    // hence we have to find the post, detach the tags
    // then again save it without tags
    // then delete it.

    const post = await manager.findOne(PostEntity, { where: { id: postId }, relations: { tags: true } });

    // TODO: find a better way than detach-save-delete, maybe with cascade migration ?
    // Don't know why orphanedRowAction: "delete" is not working here ... orphaned rows still remain in tag table
    if (post) {
      post.tags = []; // detach constraint
      await manager.save(post);
    }
    await manager.getRepository(PostEntity).delete(postId);
  });
};

router.get("/:id(\\d+)/og-image", async (req: Request, res: Response, next) => {
  AppDataSource.getRepository(PostEntity)
    .findOne({ where: { id: +req.params.id } })
    .then((post) => {
      if (post && post.id) {
        res.status(200).write(generateShareImage(post.title, post.createdAt));
        res.end();
      } else {
        next(new ForbiddenError("Post not found"));
      }
    })
    .catch((err) => {
      next(new ForbiddenError("Post not found"));
    });
});

export default router;
