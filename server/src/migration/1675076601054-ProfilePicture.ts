import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ProfilePicture1675076601054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns("user", [
      new TableColumn({
        name: "profile_picture",
        isNullable: true,
        default: null,
        type: "bytea",
      }),
      new TableColumn({
        name: "is_active",
        isNullable: false,
        type: "boolean",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns("user", ["profile_picture", "is_active"]);
  }
}
