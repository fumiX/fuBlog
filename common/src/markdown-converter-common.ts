import { marked } from "marked";
import { Buffer } from "buffer";
import pako from "pako";
import DOMPurify from "dompurify";

const KROKI_SERVICE_URL = "https://kroki.io";
const KROKI_DIAGRAM_INFOSTRING = "diagram-plantuml";

export function createWalkTokensExtension(fetchTextFromUrl: FetchTextFromUrlFunction): marked.MarkedExtension {
  return {
    async: true,
    walkTokens: async (token: marked.Token) => {
      if (token.type === "code" && token.lang === KROKI_DIAGRAM_INFOSTRING) {
        const inputText = token.text;
        const data = Buffer.from(inputText, "utf8");
        const compressed = pako.deflate(data, { level: 9 });
        const res = Buffer.from(compressed).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
        token.text = await fetchTextFromUrl(`${KROKI_SERVICE_URL}/plantuml/svg/${res}`);
      }
    },
  };
}

export const rendererExtension: marked.MarkedExtension = {
  renderer: {
    code(code: string, infostring: string) {
      if (infostring === KROKI_DIAGRAM_INFOSTRING) {
        return code;
      }
      return false;
    },
  },
};

export const sanitizeHtml: (input: string) => string = (input) => {
  return DOMPurify.sanitize(marked.parse(input), {
    // Allowed tags and attributes inside markdown
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
  });
};

/**
 * Takes a URL as argument, fetches text content from there and returns a promise resolving to that content.
 * This is `(url) => fetch(url).then((it) => it.text())` on client and server, but using a different fetch() function
 * (on the server from `node-fetch`, on the client the browser Fetch API is used).
 */
type FetchTextFromUrlFunction = (a: string) => Promise<string>;
