import {MigrationInterface, QueryRunner, TableColumn} from "typeorm"

export class CreateDraftMode1671463836367 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("post", new TableColumn({
            name: "draft",
            isNullable: false,
            default: false,
            type: "boolean"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("post", "draft");
    }

}
