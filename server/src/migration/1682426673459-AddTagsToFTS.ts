import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagsToFTS1682426673459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
        from post)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("drop view search_posts");
  }
}
