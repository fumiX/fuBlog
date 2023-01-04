import { marked } from "marked";
import { createWalkTokensExtension, rendererExtension } from "@fumix/fu-blog-common";
import fetch from "node-fetch";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

marked.use(createWalkTokensExtension((url) => fetch(url).then((it) => it.text())));
marked.use(rendererExtension);

/**
 * On the server side, we need to pass a new window object to DOMPurify.
 * It doesn't work to just call `DOMPurify.sanitize()` directly like on the client side.
 */
export const createDomPurify: () => DOMPurify.DOMPurifyI = //
  () => DOMPurify(new JSDOM("").window as unknown as Window);
