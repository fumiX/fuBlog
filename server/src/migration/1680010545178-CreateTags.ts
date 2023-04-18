import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from "typeorm";

export class CreateTags1680010545178 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "tag",
        columns: [
          {
            name: "id",
            type: "bigint",
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: "name",
            type: "varchar",
            isNullable: false,
            isUnique: true,
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: "post_tag",
        columns: [
          {
            name: "post_id",
            type: "bigint",
            isNullable: false,
          },
          {
            name: "tag_id",
            type: "bigint",
            isNullable: false,
          },
        ],
      }),
    );
    await queryRunner.createForeignKey(
      "post_tag",
      new TableForeignKey({
        name: "post_tag_post_fk",
        columnNames: ["post_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "post",
      }),
    );
    await queryRunner.createForeignKey(
      "post_tag",
      new TableForeignKey({
        name: "post_tag_tag_fk",
        columnNames: ["tag_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "tag",
      }),
    );
    await queryRunner.createUniqueConstraint(
      "post_tag",
      new TableUnique({
        name: "post_tag_combination_unique",
        columnNames: ["post_id", "tag_id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("post_tag");
    await queryRunner.dropTable("tag");
  }
}
