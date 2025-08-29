import { DataUrl } from "@common/util/base64.js";
import { Buffer } from "buffer";
import { DOMPurify } from "dompurify";
import highlightjs from "highlight.js";
import { marked, MarkedExtension, Token, Tokens } from "marked";
import { markedHighlight } from "marked-highlight";
import { mangle } from "marked-mangle";
import pako from "pako";

/**
 * Takes a URL as argument, fetches text content from there and returns a promise resolving to that content.
 * This is `(url) => fetch(url).then((it) => it.text())` on client and server, but using a different fetch() function
 * (on the server from `node-fetch`, on the client the browser Fetch API is used).
 */
type FetchTextFromUrlFunction = (a: string) => Promise<string>;

type KrokiDiagramType = {
  /** The ID of the diagram type, as used in the URL */
  id: string;
  /** Human-readable label for the diagram type */
  label: string;
  /** The ID of the diagram type, as used at the beginning of the Markdown code block */
  markdownId: string;
};

type ImageHashToUrlFunction = (imgHash: string) => Promise<DataUrl | `/api/file/${string}`>;

export abstract class MarkdownConverter {
  private static readonly KROKI_SERVICE_URL = "https://kroki.io";
  private static readonly KROKI_DIAGRAM_PREFIX = "diagram-";

  private static readonly KROKI_SVG_DIAGRAM_TYPES: KrokiDiagramType[] = [
    ["actdiag", "ActDiag"],
    ["blockdiag", "BlockDiag"],
    ["bpmn", "BPMN"],
    ["bytefield", "Bytefield"],
    ["c4plantuml", "C4 with PlantUML"],
    ["ditaa", "Ditaa"],
    ["erd", "Erd"],
    ["excalidraw", "Excalidraw"],
    ["graphviz", "GraphViz"],
    ["mermaid", "Mermaid"],
    ["nomnoml", "Nomnoml"],
    ["nwdiag", "NwDiag"],
    ["packetdiag", "PacketDiag"],
    ["pikchr", "Pikchr"],
    ["plantuml", "PlantUML"],
    ["rackdiag", "RackDiag"],
    ["seqdiag", "SeqDiag"],
    ["structurizr", "Structurizr"],
    ["svgbob", "Svgbob"],
    ["vega", "Vega"],
    ["vegalite", "Vega-Lite"],
    ["wavedrom", "WaveDrom"],
  ].map(([id, label]) => {
    return { id, markdownId: MarkdownConverter.KROKI_DIAGRAM_PREFIX + id, label };
  });

  private static getKrokiDiagramTypeFromMarkdownId(markdownId: string | undefined): KrokiDiagramType | undefined {
    return markdownId === undefined //
      ? undefined
      : (this.KROKI_SVG_DIAGRAM_TYPES.find((it) => it.markdownId === markdownId) ?? undefined);
  }

  private static rendererExtension: MarkedExtension = {
    renderer: {
      code({ text, lang, escaped }: Tokens.Code) {
        if (MarkdownConverter.getKrokiDiagramTypeFromMarkdownId(lang)) {
          return text;
        }
        return false;
      },
    },
  };
  private static walkTokensExtension: (fetchTextFromUrl: FetchTextFromUrlFunction) => MarkedExtension = //
    (fetchTextFromUrl) => {
      return {
        async: true,
        walkTokens: async (token: Token) => {
          if (token.type === "code") {
            const diagramType = MarkdownConverter.getKrokiDiagramTypeFromMarkdownId(token.lang);
            if (diagramType) {
              const inputText = token.text;
              const data = Buffer.from(inputText, "utf8");
              const compressed = pako.deflate(data, { level: 9 });
              const res = Buffer.from(compressed).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");
              token.text = await fetchTextFromUrl(`${MarkdownConverter.KROKI_SERVICE_URL}/${diagramType.id}/svg/${res}`);
            }
          }
        },
      };
    };

  protected abstract dompurify: DOMPurify;

  /**
   *
   * @param fetch the fetch function used by client/server
   */
  protected constructor(fetch: FetchTextFromUrlFunction) {
    // Initialize marked with our custom extensions
    marked.use(MarkdownConverter.walkTokensExtension(fetch));
    marked.use({
      walkTokens: async (token) => {
        if (token.type === "image") {
          token.href = (await this.f?.(token.href).catch(() => undefined)) ?? token.href;
        }
        if (token.type === "code") {
          token.escaped = true;
        }
      },
      renderer: {
        image({ href, title, text }: Tokens.Image) {
          // Check if this is an audio file (marked with audio: prefix)
          if (text && text.startsWith("audio:")) {
            const audioName = text.substring(6); // Remove 'audio:' prefix
            // Determine audio type from href if it's a data URL
            let audioType = "audio/mpeg"; // default
            if (href && href.startsWith("data:audio/")) {
              audioType = href.split(";")[0].split(":")[1];
            }
            return `<audio controls><source src="${href}" type="${audioType}">Your browser does not support the audio element.</audio>`;
          }

          // Parse attributes from title attribute (format: "title|width:300px|height:200px|maxWidth:400px|maxHeight:300px|class:my-class")
          let imgTitle = title || "";
          let imgWidth = "";
          let imgHeight = "";
          let imgMaxWidth = "";
          let imgMaxHeight = "";
          let imgClass = "";

          if (title && title.includes("|")) {
            const parts = title.split("|");
            imgTitle = parts[0];

            for (let i = 1; i < parts.length; i++) {
              const part = parts[i];
              if (part.startsWith("width:")) {
                imgWidth = part.substring(6);
              } else if (part.startsWith("height:")) {
                imgHeight = part.substring(7);
              } else if (part.startsWith("maxWidth:")) {
                imgMaxWidth = part.substring(9);
              } else if (part.startsWith("maxHeight:")) {
                imgMaxHeight = part.substring(10);
              } else if (part.startsWith("class:")) {
                imgClass = part.substring(6);
              }
            }
          }

          // Parse attributes from custom syntax in text (format: "alt{width=300px,height=200px,maxWidth=400px,maxHeight=300px,class=my-class}")
          if (text && text.includes("{")) {
            const match = text.match(/(.*?)\{([^}]+)\}/);
            if (match) {
              const [, altText, attributesStr] = match;
              text = altText;

              // Parse comma-separated attributes
              const attributes = attributesStr.split(",");
              for (const attr of attributes) {
                const [key, value] = attr.split("=");
                if (key === "width") {
                  imgWidth = value;
                } else if (key === "height") {
                  imgHeight = value;
                } else if (key === "maxWidth") {
                  imgMaxWidth = value;
                } else if (key === "maxHeight") {
                  imgMaxHeight = value;
                } else if (key === "class") {
                  imgClass = value;
                }
              }
            }
          }

          // Build attributes
          const attributes = [`src="${href}"`, `alt="${text || ""}"`];
          if (imgTitle) {
            attributes.push(`title="${imgTitle}"`);
          }
          if (imgClass) {
            attributes.push(`class="${imgClass}"`);
          }

          // Build style attribute
          const styles = [];
          if (imgWidth) {
            styles.push(`width: ${imgWidth}`);
          }
          if (imgHeight) {
            styles.push(`height: ${imgHeight}`);
          }
          if (imgMaxWidth) {
            styles.push(`max-width: ${imgMaxWidth}`);
          }
          if (imgMaxHeight) {
            styles.push(`max-height: ${imgMaxHeight}`);
          }
          if (styles.length > 0) {
            attributes.push(`style="${styles.join("; ")}"`);
          }

          // Default image rendering
          return `<img ${attributes.join(" ")}>`;
        },
      },
    });
    marked.use(MarkdownConverter.rendererExtension);
    marked.use(
      markedHighlight({
        highlight: function (code: string, language: string, info: string): string {
          if (!language || !language.startsWith("diagram-")) {
            return highlightjs.highlightAuto(code).value;
          } else {
            return code;
          }
        },
      }),
    );
    marked.use(mangle());
  }

  private f: ImageHashToUrlFunction | undefined;

  convert(input: string, imgHashToUrl?: ImageHashToUrlFunction): Promise<string> {
    this.f = imgHashToUrl;
    return marked
      .parse(input, {
        async: true,
      })
      .then((parsedInput) =>
        this.dompurify.sanitize(parsedInput, {
          // Allowed tags and attributes inside markdown
          ADD_TAGS: ["iframe", "foreignObject"], // foreignObject is needed for SVGs that show html tags inside them like mermaid-diagrams
          ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
        }),
      );
  }
}
