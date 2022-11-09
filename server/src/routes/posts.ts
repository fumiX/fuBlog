import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

export interface Post {
    title: string;
    description: string;
    markdown: string;
    sanitizedHtml: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

// Posts Mock
const POSTS: Post[] = [
    {
        title: "My first Post",
        description: "Description of irst post",
        markdown: "## Post",
        sanitizedHtml: "<h2>Post</h2>",
        createdAt: "2022-11-09T10:30:52",
        updatedAt: "2022-11-09T10:30:52",
        createdBy: "John Doe",
        updatedBy: ""
    },
    {
        title: "My second Post",
        description: "Description of second post",
        markdown: "## Post 2",
        sanitizedHtml: "<h2>Post 2</h2>",
        createdAt: "2022-11-09T10:34:52",
        updatedAt: "2022-11-09T10:34:52",
        createdBy: "John Doe",
        updatedBy: ""
    }
];

// GET ALL POSTS
router.get("/", async (req: Request, res: Response) => {
    // TODO read posts from DB sorted by created Date ascending
    const posts = POSTS.sort((a: Post, b: Post) => (a.createdAt > b.createdAt) ? -1 : ((b.createdAt > a.createdAt) ? 1 : 0))
    res.status(200).json({ data: posts });
});


// GET POST BY ID
router.get("/:id", async (req: Request, res: Response) => {
    const post = POSTS[0];

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
        createdAt: "2022-11-9T11:0:00",
        updatedAt: "2022-11-9T11:0:00",
    };

    try {
        // Save post to DB
        res.status(200).json({ data: post });
    } catch (e) {
        res.status(500).json({ error: "Fehler " + e });
    }
});

// EDIT EXISTING POST
router.post("/:id", async (req: Request, res: Response) => {
    const post = POSTS[0];
    post.title = req.body.title;
    post.description = req.body.description;
    post.markdown = req.body.markdown;
    post.updatedAt = "2022-11-09T12:00:00"
    post.updatedBy = "Current User";

    try {
        // Save post to DB
        res.status(200).json({ data: post });
    } catch (e) {
        res.status(500).json({ error: "Fehler " + e });
    }
});

// DELETE POST
router.get("/delete/:id", async (req: Request, res: Response) => {
    try {
        // find post in DB and delete it
        res.status(200).end();
    } catch (e) {
        res.status(500).json({ error: "Fehler " + e });
    }
});

module.exports = router;