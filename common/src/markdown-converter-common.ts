import { marked } from "marked";
import { Buffer } from "buffer";
import pako from "pako";
import type { Config } from "dompurify";

const KROKI_SERVICE_URL = "https://kroki.io";
const KROKI_DIAGRAM_INFOSTRING = "diagram-plantuml";


export type FetchTextFromUrlFunction = (a: string) => Promise<string>;

export function createWalkTokensExtension(fetchTextFromUrl: FetchTextFromUrlFunction): marked.MarkedExtension {
    return {
        async: true,
        walkTokens: async (token: marked.Token) => {
            if (token.type === "code" && token.lang === KROKI_DIAGRAM_INFOSTRING) {
                const inputText = token.text;
                const data = Buffer.from(inputText, "utf8");
                const compressed = pako.deflate(data, {level: 9});
                const res = Buffer.from(compressed).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
                token.text = await fetchTextFromUrl(
                    `${KROKI_SERVICE_URL}/plantuml/svg/${res}`
                );
            }
        }
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
    }
};

export type PurifyFunction = (
    source: string | Node,
    config: Config & { RETURN_DOM_FRAGMENT?: false | undefined; RETURN_DOM?: false | undefined }
) => string;

export function createSanitizeHtmlFunction(sanitize: PurifyFunction): (input: string) => string {
    return input => sanitize(
        marked.parse(input),
        {
            // Alowed Tags and Attributes inside markdown
            ADD_TAGS: ["iframe"],
            ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
        }
    );
}
