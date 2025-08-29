import { MarkdownConverter } from "@fumix/fu-blog-common";
import DOMPurify from "isomorphic-dompurify";
import fetch from "node-fetch";

export class MarkdownConverterServer extends MarkdownConverter {
  private static instance: MarkdownConverterServer;

  /**
   * On the server side, we need to pass a new window object to DOMPurify.
   * It doesn't work to just call `DOMPurify.sanitize()` directly like on the client side.
   */
  protected override sanitize = (s: string, config: { ADD_TAGS: string[]; ADD_ATTR: string[] }) => DOMPurify.sanitize(s, config);

  private constructor() {
    super((url: string) => fetch(url).then((it) => it.text()));
  }

  public static get Instance() {
    return this.instance ?? (this.instance = new this());
  }

  override convert(input: string): Promise<string> {
    return super.convert(
      input, //
      (hash: string) => Promise.resolve<`/api/file/${string}`>(`/api/file/${hash}`),
    );
  }
}
