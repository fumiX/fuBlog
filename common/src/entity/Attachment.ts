import { Post } from "./Post.js";

export type Attachment = {
  id?: number;

  filename: string;

  binaryData: Buffer;

  post: Post;

  mimeType: string;
};
