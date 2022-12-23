import { marked } from "marked";
import DOMPurify from "dompurify";
import {
  createSanitizeHtmlFunction,
  createWalkTokensExtension,
  rendererExtension
} from "../../common/src/markdown-converter-common";
import fetch from "node-fetch";

marked.use(createWalkTokensExtension((url) => fetch(url).then((it) => it.text())));
marked.use(rendererExtension);

export const sanitizeHtml = createSanitizeHtmlFunction(DOMPurify.sanitize);
