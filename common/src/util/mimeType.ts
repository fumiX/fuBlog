import { SupportedImageMimeType } from "@common/dto/SupportedImageMimeType.js";

/** See https://en.wikipedia.org/wiki/JPEG */
const MAGIC_JFIF_BYTES = <const>[0xff, 0xd8, 0xff];
/** See http://libpng.org/pub/png/spec/1.2/PNG-Rationale.html#R.PNG-file-signature */
const MAGIC_PNG_BYTES = <const>[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MAGIC_GIF_BYTES_1 = <const>[0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
const MAGIC_GIF_BYTES_2 = <const>[0x47, 0x49, 0x46, 0x38, 0x37, 0x61];

export function determineMimeType(bytes: Uint8Array | Buffer): SupportedImageMimeType | undefined {
  if (doMagicBytesMatch(MAGIC_JFIF_BYTES, bytes)) {
    return "image/jpeg";
  } else if (doMagicBytesMatch(MAGIC_PNG_BYTES, bytes)) {
    return "image/png";
  } else if (doMagicBytesMatch(MAGIC_GIF_BYTES_1, bytes) || doMagicBytesMatch(MAGIC_GIF_BYTES_2, bytes)) {
    return "image/gif";
  }
  console.warn("Unknown file type, could not identify magic bytes", bytes.slice(0, Math.min(bytes.byteLength, 12)));
  return undefined;
}

function doMagicBytesMatch(magicBytes: readonly number[], allBytes: Uint8Array | Buffer) {
  if (magicBytes.length > allBytes.length) {
    return false;
  }
  const bytes = (allBytes as Uint8Array) ?? new Uint8Array(allBytes, 0, magicBytes.length);
  return magicBytes.length < allBytes.length && magicBytes.every((it, i) => bytes[i] === it);
}
