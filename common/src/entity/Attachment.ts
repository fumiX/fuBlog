export type Attachment = {
  id?: number;

  filename: string;

  binaryData: Buffer;

  mimeType: string;
};
