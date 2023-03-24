import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ProfilePictureAsDataUrl1679412058596 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE "user" SET "firstName" = "user"."firstName" || \' \' || "user"."lastName"');
    await queryRunner.query(
      "UPDATE \"user\" SET \"roles\" = array_remove(array_remove(array_remove(\"roles\", 'POST_DELETE'), 'POST_EDIT'), 'POST_CREATE')",
    );
    await queryRunner.changeColumns("user", [
      {
        oldColumn: new TableColumn({
          name: "firstName",
          type: "varchar",
        }),
        newColumn: new TableColumn({
          name: "full_name",
          type: "varchar",
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: "profile_picture",
          type: "bytea",
        }),
        newColumn: new TableColumn({
          name: "profile_picture_url",
          type: "text",
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: "roles",
          type: "enum",
          enum: ["ADMIN", "POST_CREATE", "POST_EDIT", "POST_DELETE"],
        }),
        newColumn: new TableColumn({
          name: "roles",
          type: "enum",
          isArray: true,
          enum: ["ADMIN", "WRITER", "EDITOR"],
        }),
      },
    ]);
    await queryRunner.dropColumn("user", "lastName");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumns("user", [
      {
        oldColumn: new TableColumn({
          name: "full_name",
          type: "varchar",
        }),
        newColumn: new TableColumn({
          name: "firstName",
          type: "varchar",
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: "profile_picture_url",
          type: "text",
        }),
        newColumn: new TableColumn({
          name: "profile_picture",
          type: "bytea",
          isNullable: true,
        }),
      },
      {
        oldColumn: new TableColumn({
          name: "roles",
          type: "enum",
        }),
        newColumn: new TableColumn({
          name: "roles",
          type: "enum",
          isArray: true,
          enum: ["ADMIN", "POST_CREATE", "POST_EDIT", "POST_DELETE"],
        }),
      },
    ]);
    await queryRunner.addColumn(
      "user",
      new TableColumn({
        name: "lastName",
        type: "varchar",
        isNullable: true,
      }),
    );
  }
}
