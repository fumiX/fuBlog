import express, { Request, Response, Router } from "express";
import { Post } from "../entity/Post";
import { AppDataSource } from "../data-source";
const router: Router = express.Router();

// GET ALL POSTS
router.get("/", async (req: Request, res: Response) => {
    // TODO read posts from DB sorted by created Date ascending
    const allPosts = await AppDataSource.manager.getRepository(Post).find();
    const sortedPosts = allPosts.sort((a: Post, b: Post) => (a.createdAt > b.createdAt) ? -1 : ((b.createdAt > a.createdAt) ? 1 : 0))
    res.status(200).json({ data: sortedPosts });
});


// GET POST BY ID
router.get("/:id", async (req: Request, res: Response) => {
    const post = await AppDataSource.manager.getRepository(Post).findOneBy({
        id: +req.params.id
    });

    if (post === null) {
        res.status(404).json({ error: "No such post" });
    } else {
        res.status(200).json({ data: post });
    }
});

// CREATE NEW POST
router.post("/new", async (req: Request, res: Response) => {
    const post = {
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        createdBy: "John Doe",
        updatedBy: "",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        // Save post to DB
        const results = await AppDataSource.manager.getRepository(Post).create(post);
        res.status(200).send(results);
    } catch (e) {
        res.status(500).json({ error: "Fehler " + e });
    }
});

// EDIT EXISTING POST
router.post("/:id", async (req: Request, res: Response) => {
    const post = await AppDataSource.manager.getRepository(Post).findOneBy({
        id: +req.params.id
    });

    if (post === null) {
        res.status(404).json({ error: "No such post" });
    } else {
        post.title = req.body.title;
        post.description = req.body.description;
        post.markdown = req.body.markdown;
        post.updatedAt = new Date()
        post.updatedBy = "Current User";

        try {
            const results = await AppDataSource.manager.getRepository(Post).create(post);
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
        const result = await AppDataSource.manager.getRepository(Post).delete(+req.params.id);
        res.status(200).send(result);
    } catch (e) {
        res.status(500).json({ error: "Fehler " + e });
    }
});

export default router;

// module.exports = router;