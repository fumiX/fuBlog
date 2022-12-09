import express, { Request, Response, Router } from "express";

// This is local instance of express' router that is scoped to the current (controller) module.
// It is probably a good idea to crate a singleton in an extra module that can be referenced (imported) by all
// controllers
const router: Router = express.Router();

router.get("/url", (req: Request, res: Response) => {
    const authUrl = req.app.authClient!.authorizationUrl({
        scope: "openid email profile"
    });
    res.json({ authUrl });
});

export default router;
