import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * full text search on posts
 */
export class PostsFTS1670491043581 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE post ADD COLUMN ts tsvector
      GENERATED ALWAYS AS (to_tsvector('german', title || ' ' || description || ' ' || markdown)) STORED
    `);
    await queryRunner.query(`
      CREATE INDEX ts_idx ON post USING GIN (ts)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("post", "ts_idx");
    await queryRunner.dropColumn("post", "ts");
  }
}
