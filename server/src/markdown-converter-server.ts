import { MarkdownConverter } from "@fumix/fu-blog-common";
import fetch from "node-fetch";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

export class MarkdownConverterServer extends MarkdownConverter {
  private static instance: MarkdownConverterServer;

  /**
   * On the server side, we need to pass a new window object to DOMPurify.
   * It doesn't work to just call `DOMPurify.sanitize()` directly like on the client side.
   */
  protected override dompurify: DOMPurify.DOMPurifyI = DOMPurify(new JSDOM("").window as unknown as Window);

  private constructor() {
    super((url: string) => fetch(url).then((it) => it.text()));
  }

  public static get Instance() {
    return this.instance ?? (this.instance = new this());
  }
}
