import { File } from "@common/entity/File.js";

export type Attachment = {
  id?: number;
  filename: string;
  file: File;
};
