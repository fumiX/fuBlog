import { Attachment } from "./Attachment.js";
import type { User } from "./User.js";
import type { Tag } from "./Tag.js";

export type Post = {
  id?: number;
  title: string;
  description: string;
  markdown: string;
  sanitizedHtml: string;
  createdAt: Date;
  createdBy?: User;
  updatedAt?: Date;
  updatedBy?: User;
  attachments?: Attachment[];
  draft: boolean;
  tags: Tag[];
};

export type NewPostRequestDto = Pick<Post, "title" | "description" | "markdown" | "draft"> & { stringTags: string[] };
export type EditPostRequestDto = NewPostRequestDto & { id: number };
