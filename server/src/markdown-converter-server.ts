import { marked } from "marked";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";
import pako from "pako";
import fetch from "node-fetch";
import * as kroki from "@fumix/fu-blog-common/src/kroki-config";

const w = new JSDOM("").window as unknown as Window;
const purify = DOMPurify(w);

// TODO: Move to common project
const walkTokens = async (token: marked.Token) => {
    if (token.type === "code" && token.lang === kroki.KROKI_DIAGRAMM_INFOSTRING) {
        const inputText = token.text;
        const data = Buffer.from(inputText, "utf8");
        const compressed = pako.deflate(data, { level: 9 });
        const res = Buffer.from(compressed)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
        const svg = await fetch(`${kroki.KROKI_SERVICE_URL}/${kroki.KROKI_DIAGRAM_LANGUAGE}/${kroki.KROKI_OUTPUT_FORMAT}/${res}`);
        const txt = await svg.text();
        token.text = txt;
    }
};

const renderer = {
    code(code: string, infostring: string) {
        if (infostring === kroki.KROKI_DIAGRAMM_INFOSTRING) {
            return code
        }
        return false;
    }
};

marked.use({ walkTokens, async: true });
marked.use({ renderer });

export async function sanitizeHtml(dirty: string): Promise<string> {
    const rawHtml = await marked.parse(dirty);
    return purify.sanitize(rawHtml, kroki.purifyConfig);
}
