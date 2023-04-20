import console from "console";
import { AppDataSource } from "../data-source.js";
import { FileEntity } from "../entity/File.entity.js";
import express, { Router } from "express";

const router: Router = express.Router();

/**
 * Get a file by (any prefix of at least 10 characters of) its SHA256 hash (base64url encoded).
 * If multiple files are found, respond with 303 (Multiple Choices).
 */
router.get("/:sha256([0-9a-z_-]{10,43})", (req, res) => {
  if (!req.params.sha256) {
    res.status(400).send("Bad request");
    return;
  }
  AppDataSource.manager
    .createQueryBuilder(FileEntity, "file")
    .select(["sha256", "mime_type", "binary_data"])
    .where("sha256 LIKE :sha256", { sha256: `${req.params.sha256}%` })
    .execute()
    .then((files) => {
      if (files && files.length > 0) {
        if (files.length !== 1) {
          res
            .status(303)
            .send(
              `<!DOCTYPE html><meta charset="utf-8"><h1>Multiple choices</h1><ul>${files
                .map((it: { sha256: string; mime_type: string }) => `<li><a href="./${it.sha256}">${it.sha256} (${it.mime_type})</a></li>`)
                .join("")}</ul>`,
            );
        } else if (req.params.sha256.length < 43) {
          res.status(302).location(`/api/file/${files[0].sha256}`).send("Redirecting to full SHA256 hash");
        } else {
          res.status(200).header("Content-Type", files[0].mime_type).header("Cache-Control", "max-age=5184000").send(files[0].binary_data);
        }
      } else {
        res.status(404).send("Not found");
      }
    });
});

export default router;
