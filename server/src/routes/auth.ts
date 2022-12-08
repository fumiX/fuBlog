import express, { Request, Response, Router } from "express";

// This is local instance of express' router that is scoped to the current (controller) module.
// It is probably a good idea to crate a singleton in an extra module that can be referenced (imported) by all
// controllers
const router: Router = express.Router();

router.get("/login", (req: Request, res: Response) => {
    const authUrl = req.app.authClient!.authorizationUrl({
        scope: "openid email profile"
    });
    // console.log("REDIRECTING URIS: ", req.app.authClient?.metadata.redirect_uris);
    console.log("REDIRECTING TO: ", authUrl);
    res.redirect(authUrl);
});

export default router;
