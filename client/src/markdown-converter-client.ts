import { marked } from "marked";
import {
  createWalkTokensExtension,
  rendererExtension,
} from "@fumix/fu-blog-common";

marked.use(
  createWalkTokensExtension((url) => fetch(url).then((it) => it.text())),
);
marked.use(rendererExtension);
