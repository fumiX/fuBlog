import {MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex} from "typeorm"

export class CreateAttachments1671462016666 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "attachment",
            columns: [
                {
                    name: "id",
                    type: "bigint",
                    isPrimary: true,
                    isGenerated: true
                },
                {
                    name: "filename",
                    type: "varchar",
                    length: "255",
                    isNullable: false
                },
                {
                    name: "binaryData",
                    type: "bytea",
                    isNullable: false
                },
                {
                    name: "postId",
                    type: "bigint",
                    isNullable: false
                },
                {
                    name: "mimeType",
                    type: "varchar",
                    isNullable: false
                }
            ]
        }), true, false, false);
        await queryRunner.createForeignKey("attachment", new TableForeignKey({
            name: "attachment_post_fk",
            columnNames: ["postId"],
            referencedColumnNames: ["id"],
            referencedTableName: "post"
        }));
        await queryRunner.createIndex("attachment", new TableIndex({
            name: "attachment_post_ind",
            columnNames: ["postId"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("attachment", "attachment_post_ind");
        await queryRunner.dropTable("attachment");
    }

}
