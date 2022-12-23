import { marked } from "marked";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import {
    createSanitizeHtmlFunction,
    createWalkTokensExtension,
    rendererExtension
} from "../../common/src/markdown-converter-common";
import fetch from "node-fetch";

const w = new JSDOM("").window as unknown as Window;
const purify = DOMPurify(w);
export const sanitizeHtml = createSanitizeHtmlFunction(purify.sanitize);

marked.use(createWalkTokensExtension((url) => fetch(url).then((it) => it.text())));
marked.use(rendererExtension);
