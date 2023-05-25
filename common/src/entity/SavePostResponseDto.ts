import { Attachment } from "./Attachment.js";

export type SavePostResponseDto = {
  postId?: number;
  attachments: Attachment[];
};
