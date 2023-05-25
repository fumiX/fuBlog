import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class Autosave1684930338348 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "post",
      new TableColumn({
        name: "autosave_ref_post",
        type: "bigint",
        isNullable: true,
        isUnique: true,
      }),
    );
    await queryRunner.createForeignKey(
      "post",
      new TableForeignKey({
        name: "post_autosave_ref_post_fk",
        columnNames: ["autosave_ref_post"],
        referencedColumnNames: ["id"],
        referencedTableName: "post",
      }),
    );
    await queryRunner.addColumn(
      "post",
      new TableColumn({
        name: "autosave_ref_user",
        type: "bigint",
        isNullable: true,
        isUnique: true,
      }),
    );
    await queryRunner.createForeignKey(
      "post",
      new TableForeignKey({
        name: "post_autosave_ref_user_fk",
        columnNames: ["autosave_ref_user"],
        referencedColumnNames: ["id"],
        referencedTableName: "user",
      }),
    );
    await queryRunner.query("drop view search_posts");
    await queryRunner.query(`
      CREATE VIEW search_posts AS
        (
        select id as post_id,
               setweight(to_tsvector(coalesce(title, '')), 'A') ||
               setweight(to_tsvector(coalesce(description, '')), 'B') ||
               setweight(to_tsvector(coalesce(markdown, '')), 'C') ||
               setweight(to_tsvector(coalesce((select string_agg(name, ' ')
                                               from tag t
                                               where t.id in (select tag_id from post_tag where post_id = post.id)), '')), 'A')
                  as post_tsv
        from post
        where post.autosave_ref_post is null and post.autosave_ref_user is null)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("post", "autosave_ref");
    await queryRunner.query("drop view search_posts");
  }
}
