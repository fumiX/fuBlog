import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { UserEntity } from "../entity/User.entity.js";

export class ProfilePictureAsDataUrl1679412058596 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('UPDATE "user" SET "firstName" = "user"."firstName" || \' \' || "user"."lastName"');
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
    ]);
    await queryRunner.dropColumn("user", "lastName");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
