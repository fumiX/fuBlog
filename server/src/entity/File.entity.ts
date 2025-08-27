import { determineMimeType, File, SupportedFileMimeType } from "@fumix/fu-blog-common";
import { Buffer } from "buffer";
import * as crypto from "crypto";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("file")
export class FileEntity implements File {
  private static readonly SHA256_REGEX = /^[0-9a-zA-Z_-]{43}$/;

  @PrimaryColumn({ nullable: false, type: "char", length: 43, comment: "SHA256 sum of the binary data (in base64url)" })
  sha256: string;

  @Column({ name: "mime_type", type: "varchar", nullable: false })
  mimeType: SupportedFileMimeType;

  @Column({ name: "binary_data", type: "bytea", nullable: false })
  binaryData: Buffer;

  public static async fromData(binaryData: Buffer | Uint8Array | ArrayBuffer): Promise<FileEntity> {
    return new FileEntity(
      await crypto.subtle.digest("SHA-256", binaryData).then((it) => Buffer.from(it).toString("base64url")),
      Buffer.from(binaryData),
    );
  }

  private constructor(sha256?: string, binaryData?: Buffer, mimeType?: SupportedFileMimeType) {
    if (sha256 === undefined && binaryData === undefined && mimeType === undefined) {
      return;
    }

    if (!sha256 || !FileEntity.SHA256_REGEX.test(sha256)) {
      throw new Error(`Invalid SHA256 (must be base64url encoded): ${sha256} ${binaryData} ${mimeType}`);
    }
    if (binaryData !== undefined) {
      this.binaryData = binaryData;
      const finalMimeType = mimeType ?? determineMimeType(binaryData);
      if (finalMimeType === undefined) {
        throw new Error("Could not determine mime type");
      }
      this.mimeType = finalMimeType;
    }
    this.sha256 = sha256;
  }
}
