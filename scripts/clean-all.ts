import fs from "fs";
import path from "path";

// TODO: Can this be improved? Sometimes the /dist/ folders and the *.tsbuildinfo file need to be deleted before the build is successful.
["common/tsconfig.tsbuildinfo", "common/dist/", "client/dist/", "server/dist/"]
  .map((it) => path.join(__dirname, "../", it))
  .forEach((value) => {
    fs.rm(value, { force: true, recursive: value.endsWith("/") }, (err) => {
      if (err) {
        throw err;
      }
      console.log("Deleted", value, "!");
    });
  });
