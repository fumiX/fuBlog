import type { User } from "./User.js";
import { Attachment } from "./Attachment.js";

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
  draft?: boolean;
};
