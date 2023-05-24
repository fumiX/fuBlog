import { DataUrl } from "@common/util/base64.js";
import { Buffer } from "buffer";
import { DOMPurifyI } from "dompurify";
import highlightjs from "highlight.js";
import { marked } from "marked";
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
      : this.KROKI_SVG_DIAGRAM_TYPES.find((it) => it.markdownId === markdownId) ?? undefined;
  }

  private static rendererExtension: marked.MarkedExtension = {
    renderer: {
      code(code: string, infostring: string) {
        if (MarkdownConverter.getKrokiDiagramTypeFromMarkdownId(infostring)) {
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

  protected abstract dompurify: DOMPurifyI;

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
      },
    });
    marked.use(MarkdownConverter.rendererExtension);
    marked.use(
      markedHighlight({
        highlight: function (code: string, lang: string) {
          return highlightjs.highlightAuto(code).value;
        },
      }),
    );
    marked.use(mangle());
    marked.use({ headerIds: false });
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
          ADD_TAGS: ["iframe"],
          ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
        }),
      );
  }
}
