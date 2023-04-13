import console from "console";
import { AppSettings } from "../settings.js";
import express, { Request, Response, Router } from "express";
import fetch from "node-fetch";
import { AppDataSource } from "../data-source.js";
import { PostEntity } from "../entity/Post.entity.js";
import { Word } from "@fumix/fu-blog-common";
import { Not } from "typeorm";

const router: Router = express.Router();

let cachedSharepic: { url: string; bytes: Uint8Array } | undefined = undefined;
router.get("/github-sharepic", async (req, res) => {
  const timestamp = Math.floor(Date.now() / 3600000);
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
      if (cachedSharepic) {
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

// get words for word cloud
router.get("/", async (req: Request, res: Response) => {
  const allPosts = await AppDataSource.manager.getRepository(PostEntity).find({
    cache: true,
    where: {
      draft: false,
      description: Not(""),
    },
  });

  // TODO: Find something more efficient than this !!
  // and also only do this if someone saves a post and not on each request of posts-list
  // Get most common words on post save and save them in the DB as well.

  const oneBigString = allPosts.map((post) => post.markdown).join(" ");

  const nthMostCommon = (string: string, amount: number): { word: string; occurences: number }[] => {
    const wordsArray: string[] = string.split(/\s/);
    const wordOccurrences: { [key: string]: number } = {};
    for (let i = 0; i < wordsArray.length; i++) {
      wordOccurrences["_" + wordsArray[i]] = (wordOccurrences["_" + wordsArray[i]] || 0) + 1;
    }
    const result = Object.keys(wordOccurrences).reduce(function (acc: { word: string; occurences: number }[], currentKey: string) {
      for (let i = 0; i < amount; i++) {
        if (!acc[i]) {
          acc[i] = { word: currentKey.slice(1, currentKey.length), occurences: wordOccurrences[currentKey] };
          break;
        } else if (acc[i].occurences < wordOccurrences[currentKey]) {
          acc.splice(i, 0, { word: currentKey.slice(1, currentKey.length), occurences: wordOccurrences[currentKey] });
          if (acc.length > amount) acc.pop();
          break;
        }
      }
      return acc;
    }, []);
    return result;
  };

  const allWords: Word[] = nthMostCommon(oneBigString, 100).map((word) => ({ name: word.word, value: word.occurences }));

  try {
    res.status(200).json({ data: allWords });
  } catch (e) {
    res.status(500).json({ error: "Fehler " + e });
  }
});

export default router;
