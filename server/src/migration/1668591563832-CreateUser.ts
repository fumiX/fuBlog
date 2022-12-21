import {MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey} from "typeorm"

export class CreateUser1668591563832 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "user",
            columns: [
                {
                    name: "id",
                    type: "bigint",
                    isPrimary: true,
                    isGenerated: true
                },
                {
                    name: "firstName",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "lastName",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "email",
                    type: "varchar",
                    isNullable: false,
                    isUnique: true
                },
                {
                    name: "birthdate",
                    type: "date",
                    isNullable: true
                }
            ]
        }));
        await queryRunner.dropColumn("post", "createdBy");
        await queryRunner.dropColumn("post", "updatedBy");
        await queryRunner.addColumn("post", new TableColumn({
            name: "createdById",
            type: "bigint",
            isNullable: false
        }));
        await queryRunner.createForeignKey("post", new TableForeignKey({
            name: "post_user_created_by_fk",
            columnNames: ["createdById"],
            referencedColumnNames: ["id"],
            referencedTableName: "user"
        }));
        await queryRunner.addColumn("post", new TableColumn({
            name: "updatedById",
            type: "bigint",
            isNullable: true
        }));
        await queryRunner.createForeignKey("post", new TableForeignKey({
            name: "post_user_updated_by_fk",
            columnNames: ["updatedById"],
            referencedColumnNames: ["id"],
            referencedTableName: "user"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("post", "createdBy");
        await queryRunner.dropColumn("post", "updatedBy");
        await queryRunner.addColumn("post", new TableColumn({
            name: "createdBy",
            type: "varchar",
            isNullable: false
        }));
        await queryRunner.addColumn("post", new TableColumn({
            name: "updatedBy",
            type: "varchar",
            isNullable: true
        }));
        await queryRunner.dropTable("user");
    }

}
