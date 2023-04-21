import express, { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source.js";
import { AttachmentEntity } from "../entity/Attachment.entity.js";
import { NotFoundError } from "../errors/NotFoundError.js";

const router: Router = express.Router();

// get attachments associated to post
router.get("/post/:id([0-9]+)", async (req: Request, res: Response, next) => {
  const postId = +req.params.id;
  await AppDataSource.manager
    .getRepository(AttachmentEntity)
    .findBy({
      post: {
        id: postId,
      },
    })
    .then((result) => {
      if (result) {
        return res.status(200).json({ data: result });
      } else {
        throw new NotFoundError("No attachment found");
      }
    })
    .catch((err) => next(err));
});

// get specific attachment
router.get("/attachment/:id([0-9]+)", async (req: Request, res: Response, next) => {
  const attachmentId = +req.params.id;
  await AppDataSource.manager
    .getRepository(AttachmentEntity)
    .findOneBy({ id: attachmentId })
    .then((result) => {
      if (result) {
        return res.status(200).json({ data: result });
      } else {
        throw new NotFoundError("No attachment found");
      }
    })
    .catch((err) => next(err));
});

export default router;
