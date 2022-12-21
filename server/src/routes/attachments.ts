import express, {Request, Response, Router} from "express";
import {AppDataSource} from "../data-source";
import {Attachment} from "../entity/Attachment";

const router: Router = express.Router();

// get attachments associated to post
router.get("/post/:id", async (req: Request, res: Response) => {
    const postId = +req.params.id;
    const foundAttachments = await AppDataSource.manager.getRepository(Attachment)
        .findBy({
            post: {
                id: postId
            }
        });

    if (foundAttachments != null) {
        res.status(200).json({data: foundAttachments});
    } else {
        res.sendStatus(404);
    }
});

// get specific attachment
router.get("/attachment/:id", async (req: Request, res: Response) => {
    const attachmentId = +req.params.id;
    const foundAttachment = await AppDataSource.manager.getRepository(Attachment)
        .findOneBy({id: attachmentId});

    if (foundAttachment != null) {
        res.status(200).json({data: foundAttachment});
    } else {
        res.sendStatus(404);
    }
});

// get single attachment as binary data, file name is arbitrary
router.get("/attachment/:id/:filename", async (req: Request, res: Response) => {
    const attachmentId = +req.params.id;
    const foundAttachment = await AppDataSource.manager.getRepository(Attachment)
        .findOneBy({id: attachmentId});

    if (foundAttachment != null) {
        res.type(foundAttachment.mimeType).status(200).send(foundAttachment.binaryData);
    } else {
        res.sendStatus(404);
    }
});

export default router;
