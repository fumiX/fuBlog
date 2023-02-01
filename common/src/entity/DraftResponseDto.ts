import { Attachment } from "./Attachment.js";

export type DraftResponseDto = {
  postId?: number;
  attachments: Attachment[];
};
