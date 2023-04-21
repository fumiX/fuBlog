import { bytesToBase64URL } from "@fumix/fu-blog-common";
import * as crypto from "node:crypto";
import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class ImagesWithSha256Sum1681904826817 implements MigrationInterface {
  /**
   * 1. Add `file` table with `sha256`, `binary_data` and `mime_type`
   * 2. For each attachment, move the binary data and mime type to the `file` table, generate the SHA256
   * 3. Reference the `file` from the `attachment` table
   * 4. Drop the `binaryData` and `mimeType` columns in the `attachment` table
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create `file` table
    await queryRunner.createTable(
      new Table({
        name: "file",
        columns: [
          {
            name: "sha256",
            type: "char(43)",
            isNullable: false,
            isPrimary: true,
            comment: "SHA256 sum of the binary data",
          },
          {
            name: "binary_data",
            type: "bytea",
            isNullable: false,
          },
          {
            name: "mime_type",
            type: "varchar",
            isNullable: false,
          },
        ],
        checks: [{ expression: "sha256 ~ '^[0-9a-zA-Z_-]{43}'" }, { expression: "mime_type ~ '^[a-z]+/[a-z.+-]+'" }],
      }),
    );
    // Add foreign key column `file` (for now nullable until filled)
    await queryRunner.addColumn(
      "attachment",
      new TableColumn({
        name: "file_sha256",
        type: "char(43)",
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      "attachment",
      new TableForeignKey({
        columnNames: ["file_sha256"],
        referencedTableName: "file",
        referencedColumnNames: ["sha256"],
      }),
    );
    // For each attachment: Create an associated file
    await queryRunner.manager.query("SELECT * FROM attachment").then((attachments) => {
      attachments.forEach(async (attachment: { mimeType: string; binaryData: Buffer }) => {
        const sha256 = bytesToBase64URL(new Uint8Array(await crypto.subtle.digest("SHA-256", attachment.binaryData)));
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into("file", ["sha256", "mime_type", "binary_data"])
          .values([
            {
              sha256,
              mime_type: attachment.mimeType,
              binary_data: attachment.binaryData,
            },
          ])
          .onConflict('("sha256") DO NOTHING')
          .execute()
          .then(async () => {
            await queryRunner.manager
              .createQueryBuilder()
              .update("attachment", {
                file_sha256: sha256,
              })
              .execute();
          });
      });
    });
    // Make `file` column non-null
    await queryRunner.changeColumn(
      "attachment",
      new TableColumn({
        name: "file_sha256",
        type: "char(43)",
      }),
      new TableColumn({
        name: "file_sha256",
        type: "char(43)",
        isNullable: false,
      }),
    );
    // Remove obsolete columns
    await queryRunner.dropColumns("attachment", ["binaryData", "mimeType"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("attachment", [
      new TableColumn({
        name: "binaryData",
        type: "bytea",
        isNullable: true,
      }),
      new TableColumn({
        name: "mimeType",
        type: "varchar",
        isNullable: true,
      }),
    ]);
    await queryRunner.manager.query("SELECT * FROM file").then((files) => {
      files.forEach((file: { sha256: string; binary_data: Buffer; mime_type: string }) => {
        queryRunner.manager.update(
          "attachment",
          { where: { file: file.sha256 } },
          { binaryData: file.binary_data, mimeType: file.mime_type },
        );
      });
    });
    await queryRunner.changeColumns("attachment", [
      {
        oldColumn: new TableColumn({
          name: "binaryData",
          type: "bytea",
        }),
        newColumn: new TableColumn({
          name: "binaryData",
          type: "bytea",
          isNullable: false,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: "mimeType",
          type: "varchar",
        }),
        newColumn: new TableColumn({
          name: "mimeType",
          type: "varchar",
          isNullable: false,
        }),
      },
    ]);
    await queryRunner.dropTable("file");
    await queryRunner.dropColumn("attachment", "file_sha256");
  }
}
