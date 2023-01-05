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
};
