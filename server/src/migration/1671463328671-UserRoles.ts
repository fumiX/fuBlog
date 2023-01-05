import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class UserRoles1671463328671 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "oauth_account",
        columns: [
          {
            name: "id",
            type: "bigint",
            isNullable: false,
            isGenerated: true,
            isPrimary: true,
          },
          {
            name: "oauth_id",
            type: "varchar",
            length: "128",
            isNullable: false,
          },
          {
            name: "user_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "provider",
            type: "enum",
            enum: ["FAKE", "GOOGLE"],
          },
        ],
        foreignKeys: [
          {
            columnNames: ["user_id"],
            referencedTableName: "user",
            referencedColumnNames: ["id"],
          },
        ],
      }),
    );
    await queryRunner.addColumn(
      "user",
      new TableColumn({
        name: "roles",
        type: "enum",
        isArray: true,
        enum: ["ADMIN", "POST_CREATE", "POST_EDIT", "POST_DELETE"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      "user",
      new TableColumn({
        name: "roles",
        type: "enum",
      }),
    );
    await queryRunner.dropTable("oauth_account");
  }
}
