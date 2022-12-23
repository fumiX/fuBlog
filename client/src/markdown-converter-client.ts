import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  createSanitizeHtmlFunction,
  createWalkTokensExtension,
  rendererExtension
} from "@fumix/fu-blog-common";

marked.use(createWalkTokensExtension((url) => fetch(url).then((it) => it.text())));
marked.use(rendererExtension);

export const sanitizeHtml = createSanitizeHtmlFunction(DOMPurify.sanitize);
