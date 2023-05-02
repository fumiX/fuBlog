import { Attachment } from "./Attachment.js";
import type { Tag } from "./Tag.js";
import type { PublicUserInfo } from "./User.js";

export type Post = {
  id?: number;
  title: string;
  description: string;
  markdown: string;
  sanitizedHtml: string;
  createdAt: Date;
  createdBy?: PublicUserInfo;
  updatedAt?: Date;
  updatedBy?: PublicUserInfo;
  attachments?: Attachment[];
  draft: boolean;
  tags?: Tag[];
};

export type NewPostRequestDto = Pick<Post, "title" | "description" | "markdown" | "draft"> & { stringTags: string[] };
export type EditPostRequestDto = NewPostRequestDto & { id: number };

export type PostRequestDto = NewPostRequestDto | EditPostRequestDto;
