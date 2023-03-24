import express, { Request, Response, Router } from "express";
import { AppDataSource } from "../data-source.js";
import { PostEntity } from "../entity/Post.entity.js";
import { Word } from "@fumix/fu-blog-common";
import { Not } from "typeorm";

const router: Router = express.Router();

// get words for word cloud
router.get("/", async (req: Request, res: Response) => {
  const allPosts = await AppDataSource.manager.getRepository(PostEntity).find({
    cache: true,
    where: {
      description: Not(""),
    },
  });

  const oneBigString = allPosts.map((post) => post.markdown).join(" ");

  // console.log("ONE BIG STRING", oneBigString);

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
