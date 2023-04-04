import { Attachment } from "./Attachment.js";
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
  draft: boolean;
};

export type NewPostRequestDto = Pick<Post, "title" | "description" | "markdown" | "draft">;
export type EditPostRequestDto = NewPostRequestDto & { id: number };
