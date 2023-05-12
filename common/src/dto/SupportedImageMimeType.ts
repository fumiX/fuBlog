/**
 * The supported MIME types for attachments (for now).
 * Currently they can also all be auto-determined by the magic bytes.
 */
export type SupportedImageMimeType = `image/${"png" | "jpeg" | "gif" | "bmp"}`;

export type JsonMimeType = "application/json";
