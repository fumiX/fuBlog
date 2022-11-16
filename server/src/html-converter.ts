import { marked } from "marked";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const w = new JSDOM("").window as unknown as Window;
const purify = DOMPurify(w);

const purifyConfig = {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
};

export function sanitizeHtml(dirty: string): string {
    const rawHtml = marked.parse(dirty);
    return purify.sanitize(rawHtml, purifyConfig);
}