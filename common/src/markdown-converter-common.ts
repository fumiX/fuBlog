import { marked } from "marked";
import { Buffer } from "buffer";
import pako from "pako";
import { DOMPurifyI } from "dompurify";

/**
 * Takes a URL as argument, fetches text content from there and returns a promise resolving to that content.
 * This is `(url) => fetch(url).then((it) => it.text())` on client and server, but using a different fetch() function
 * (on the server from `node-fetch`, on the client the browser Fetch API is used).
 */
type FetchTextFromUrlFunction = (a: string) => Promise<string>;

export abstract class MarkdownConverter {
  private static KROKI_SERVICE_URL = "https://kroki.io";
  private static KROKI_DIAGRAM_INFOSTRING = "diagram-plantuml";

  private static rendererExtension: marked.MarkedExtension = {
    renderer: {
      code(code: string, infostring: string) {
        if (infostring === MarkdownConverter.KROKI_DIAGRAM_INFOSTRING) {
          return code;
        }
        return false;
      },
    },
  };
  private static walkTokensExtension: (fetchTextFromUrl: FetchTextFromUrlFunction) => marked.MarkedExtension = //
    (fetchTextFromUrl) => {
      return {
        async: true,
        walkTokens: async (token: marked.Token) => {
          if (token.type === "code" && token.lang === MarkdownConverter.KROKI_DIAGRAM_INFOSTRING) {
            const inputText = token.text;
            const data = Buffer.from(inputText, "utf8");
            const compressed = pako.deflate(data, { level: 9 });
            const res = Buffer.from(compressed).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
            token.text = await fetchTextFromUrl(`${MarkdownConverter.KROKI_SERVICE_URL}/plantuml/svg/${res}`);
          }
        },
      };
    };

  protected abstract dompurify: DOMPurifyI;

  /**
   *
   * @param fetch the fetch function used by client/server
   */
  protected constructor(fetch: FetchTextFromUrlFunction) {
    // Initialize marked with our custom extensions
    marked.use(MarkdownConverter.walkTokensExtension(fetch));
    marked.use(MarkdownConverter.rendererExtension);
  }

  convert(input: string): Promise<string> {
    return marked
      .parse(input, { async: true }) //
      .then((parsedInput) =>
        this.dompurify.sanitize(parsedInput, {
          // Allowed tags and attributes inside markdown
          ADD_TAGS: ["iframe"],
          ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
        }),
      );
  }
}
