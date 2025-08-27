/**
 * The supported MIME types for attachments.
 * Currently they can also all be auto-determined by the magic bytes.
 */
export type SupportedImageMimeType = `image/${"png" | "jpeg" | "gif" | "bmp"}`;

export type SupportedAudioMimeType = `audio/${"mp3" | "wav"}`;

export type SupportedFileMimeType = SupportedImageMimeType | SupportedAudioMimeType;

export type JsonMimeType = "application/json";
