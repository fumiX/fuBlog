import { MarkdownConverter } from "@fumix/fu-blog-common";
import DOMPurify from "isomorphic-dompurify";

export class MarkdownConverterClient extends MarkdownConverter {
  private static instance: MarkdownConverterClient;

  protected override sanitize = (s: string, config: { ADD_TAGS: string[]; ADD_ATTR: string[] }) => DOMPurify.sanitize(s);

  private constructor() {
    super((url: string) => fetch(url).then((it) => it.text()));
  }

  public static get Instance() {
    return this.instance ?? (this.instance = new this());
  }
}
