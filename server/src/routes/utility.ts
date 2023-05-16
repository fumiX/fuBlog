import { permissionsForUser } from "@fumix/fu-blog-common";
import express, { Request, Response, Router } from "express";
import fetch from "node-fetch";
import { AppDataSource } from "../data-source.js";
import { TagEntity } from "../entity/Tag.entity.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { authMiddleware } from "../service/middleware/auth.js";
import { chatGptSummarize, dallEGenerateImage } from "../service/openai.js";
import { AppSettings } from "../settings.js";

const router: Router = express.Router();

let cachedSharepic: { url: string; bytes: Uint8Array } | undefined = undefined;
router.get("/github-sharepic", async (req, res) => {
  const timestamp = Math.floor(Date.now() / 3600000); // round down to the hour
  const url = `https://opengraph.githubassets.com/${timestamp}/${AppSettings.GITHUB_REPOSITORY_SLUG}`;
  if (cachedSharepic && cachedSharepic.url === url) {
    if (req.header("If-None-Match") === `${timestamp}`) {
      res.status(304).send(null);
    } else {
      res
        .status(200)
        .header("ETag", `${timestamp}`)
        .header("Cache-Control", "max-age=7200000")
        .contentType("image/png")
        .write(cachedSharepic.bytes);
      res.end();
    }
  } else {
    const sendCachedBytesOrNotFound = () => {
      if (cachedSharepic && cachedSharepic.bytes.length > 0) {
        res
          .status(200)
          .header("ETag", `${timestamp}`)
          .header("Cache-Control", "max-age=7200000")
          .contentType("image/png")
          .write(cachedSharepic.bytes);
        res.end();
      } else {
        res.status(404).send(null);
      }
    };
    fetch(url)
      .then((r) => {
        r.arrayBuffer()
          .then((buf) => {
            cachedSharepic = { url, bytes: new Uint8Array(buf) };
            sendCachedBytesOrNotFound();
          })
          .catch(sendCachedBytesOrNotFound);
      })
      .catch(sendCachedBytesOrNotFound);
  }
});

router.get("/", async (req: Request, res: Response, next) => {
  AppDataSource.manager
    .getRepository(TagEntity)
    .createQueryBuilder()
    .select(["name", "cast(count(pt.tag_id) as integer) as value"])
    .leftJoin("post_tag", "pt", "pt.tag_id = id")
    .addGroupBy("pt.tag_id")
    .addGroupBy("name")
    .orderBy("count(pt.tag_id)", "DESC")
    .limit(15)
    .getRawMany()
    .then((result) => {
      return res.status(200).json({ data: result });
    })
    .catch(next);
});

router.post("/chatGptSummarize", authMiddleware, async (req, res, next) => {
  const body: string | undefined = req.body?.json;
  const loggedInUser = await req.loggedInUser?.();

  if (!body) {
    return next(new BadRequestError());
  } else if (!loggedInUser) {
    return next(new UnauthorizedError());
  } else if (!permissionsForUser(loggedInUser.user).canCreatePost) {
    return next(new ForbiddenError());
  }

  chatGptSummarize(req.body?.json)
    .then((it) => {
      if (it) {
        res.status(200).json(it);
      } else {
        res.status(502).json({});
      }
    })
    .catch(() => res.status(502).json({}));
});

router.post("/dallEGenerateImage", authMiddleware, async (req, res, next) => {
  const body: string | undefined = req.body?.json;
  const loggedInUser = await req.loggedInUser?.();

  if (!body) {
    return next(new BadRequestError());
  } else if (!loggedInUser) {
    return next(new UnauthorizedError());
  } else if (!permissionsForUser(loggedInUser.user).canCreatePost) {
    return next(new ForbiddenError());
  }

  await dallEGenerateImage(body)
    .then(([mimeType, buffer]) => {
      res.status(200).contentType(mimeType).write(buffer, "binary");
      res.end();
    })
    .catch((e) => res.status(502).json({ error: e }));
});

export default router;
