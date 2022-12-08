import express, {Request, Response, Router} from "express";
import {Post} from "../entity/Post";
import {AppDataSource} from "../data-source";
import {sanitizeHtml} from "../markdown-converter-server";
import {User} from "../entity/User";

const router: Router = express.Router();

// create or get dummy user
async function getUser() {
    const email = "test@test.de";
    let createdUser = await AppDataSource.manager.getRepository(User).findOneBy({email: email});

    if (createdUser === null) {
        const user: User = {
            birthdate: new Date(),
            email: email,
            firstName: "Alfred E.",
            lastName: "Neumann"
        }

        createdUser = await AppDataSource.manager.getRepository(User).save(user);
    }

    return createdUser;
}

// search posts
router.get("/page/:page/count/:count/search/:search", async (req: Request, res: Response) => {
    const page = +req.params.page;
    const itemsPerPage = +req.params.count;
    const skipEntries = (page * itemsPerPage) - itemsPerPage;
    let searchTerm = "true";
    if (req.params.search) {
        const splitSearchParams: string[] = req.params.search.split(" ");
        console.log("searching for: " + splitSearchParams.toString());
        searchTerm = "ts @@ to_tsquery(" + splitSearchParams.map(term => ("'" + term + "'")).join(",") + ")";
    }

    const allSearchedPosts = await AppDataSource.manager.getRepository(Post)
        .createQueryBuilder()
        .where(searchTerm)
        .skip(skipEntries)
        .take(itemsPerPage)
        // .orderBy("createdAt", "DESC")
        .getManyAndCount();

    res.status(200).json({data: allSearchedPosts});
});

// get all posts with paging
router.get("/page/:page/count/:count/", async (req: Request, res: Response) => {
    const page = +req.params.page;
    const itemsPerPage = +req.params.count;
    const skipEntries = (page * itemsPerPage) - itemsPerPage;
    const allPosts = await AppDataSource.manager.getRepository(Post).findAndCount({
        order: {
            createdAt: "DESC"
        },
        skip: skipEntries,
        take: itemsPerPage
    });

    res.status(200).json({data: allPosts});
});

// GET POST BY ID
router.get("/:id", async (req: Request, res: Response) => {
    const post = await AppDataSource.manager.getRepository(Post).findOneBy({
        id: +req.params.id
    });

    if (post === null) {
        res.status(404).json({error: "No such post"});
    } else {
        res.status(200).json({data: post});
    }
});

// CREATE NEW POST
router.post("/new", async (req: Request, res: Response) => {
    try {
        const san = await sanitizeHtml(req.body.markdown);
        const post = {
            title: req.body.title,
            description: req.body.description,
            markdown: req.body.markdown,
            createdBy: await getUser(),
            createdAt: new Date(),
            updatedAt: new Date(),
            sanitizedHtml: san
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = await AppDataSource.manager.getRepository(Post).save<any>(post);
        res.status(200).send(results);
    } catch (e) {
        res.status(500).json({error: "Fehler " + e});
    }

});

// EDIT EXISTING POST
router.post("/:id", async (req: Request, res: Response) => {
    const post = await AppDataSource.manager.getRepository(Post).findOneBy({
        id: +req.params.id
    });

    if (post === null) {
        res.status(404).json({error: "No such post"});
    } else {
        const san = await sanitizeHtml(req.body.markdown);

        post.title = req.body.title;
        post.description = req.body.description;
        post.markdown = req.body.markdown;
        post.updatedAt = new Date()
        post.sanitizedHtml = san;
        post.updatedBy = await getUser();

        try {
            const results = await AppDataSource.manager.getRepository(Post).save(post);
            res.status(200).send(results);
        } catch (e) {
            res.status(500).json({error: "Fehler " + e});
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
        res.status(500).json({error: "Fehler " + e});
    }
});

export default router;