import type { User } from "./User.js";
import { Attachment } from "./Attachment.js";
import { Tag } from "@common/entity/Tag.js";

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
  tags?: Tag[];
};
