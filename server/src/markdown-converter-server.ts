import { marked } from "marked";
import { createWalkTokensExtension, rendererExtension } from "@fumix/fu-blog-common";
import fetch from "node-fetch";

marked.use(createWalkTokensExtension((url) => fetch(url).then((it) => it.text())));
marked.use(rendererExtension);

