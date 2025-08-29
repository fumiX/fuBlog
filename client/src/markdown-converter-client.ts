import { MarkdownConverter } from "@fumix/fu-blog-common";
import DOMPurify from "isomorphic-dompurify";

export class MarkdownConverterClient extends MarkdownConverter {
  private static instance: MarkdownConverterClient;

  protected override dompurify = DOMPurify();

  private constructor() {
    super((url: string) => fetch(url).then((it) => it.text()));
  }

  public static get Instance() {
    return this.instance ?? (this.instance = new this());
  }
}
