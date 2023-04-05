import { Attachment } from "./Attachment.js";
import { Tag } from "@common/entity/Tag.js";
import type { User } from "./User.js";

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
  tags?: Tag[];
  draft: boolean;
};

export type NewPostRequestDto = Pick<Post, "title" | "description" | "markdown" | "draft" | "tags">;
export type EditPostRequestDto = NewPostRequestDto & { id: number };
