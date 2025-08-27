/*
 * As suggested in https://github.com/nodejs/node/issues/51196#issuecomment-1998216742
 * For making nodemon with ts-node work for esm:
 * `nodemon --exec node --import=../scripts/register.mjs …`
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("ts-node/esm", pathToFileURL("./"));
