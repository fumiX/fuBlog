import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreatePosts1668524133068 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
                name: "post",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true
                    },
                    {
                        name: "title",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "description",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "markdown",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "sanitizedHtml",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        isNullable: false
                    },
                    {
                        name: "createdBy",
                        type: "varchar",
                        isNullable: false
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "updatedBy",
                        type: "varchar",
                        isNullable: true
                    }
                ]
            }
        ), true, false, false)
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("post")
    }

}
