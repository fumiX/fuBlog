import { MigrationInterface, QueryRunner } from "typeorm";

export class SnakeCaseMigration1682586239582 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn("attachment", "postId", "post_id");
    await queryRunner.renameColumn("post", "sanitizedHtml", "sanitized_html");
    await queryRunner.renameColumn("post", "createdAt", "created_at");
    await queryRunner.renameColumn("post", "updatedAt", "updated_at");
    await queryRunner.renameColumn("post", "createdById", "created_by_id");
    await queryRunner.renameColumn("post", "updatedById", "updated_by_id");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn("attachment", "post_id", "postId");
    await queryRunner.renameColumn("post", "sanitized_html", "sanitizedHtml");
    await queryRunner.renameColumn("post", "created_at", "createdAt");
    await queryRunner.renameColumn("post", "updated_at", "updatedAt");
    await queryRunner.renameColumn("post", "created_by_id", "createdById");
    await queryRunner.renameColumn("post", "updated_by_id", "updatedById");
  }
}
