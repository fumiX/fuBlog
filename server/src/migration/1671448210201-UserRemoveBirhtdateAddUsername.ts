import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UserRemoveBirhtdateAddUsername1671448210201 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumns(
            "user",
            [
                {
                    oldColumn: new TableColumn({
                        name: "birthdate",
                        type: "date",
                    }),
                    newColumn: new TableColumn({
                        name: "username",
                        length: "64",
                        type: "varchar",
                        isNullable: true,
                        isUnique: true,
                    })
                }
            ]
        );
        await queryRunner.query('UPDATE "user" SET "username" = "user"."firstName" || "user"."lastName"');
        await queryRunner.changeColumns(
            "user",
            [
                {
                    oldColumn: new TableColumn({
                        name: "username",
                        type: "varchar",
                    }),
                    newColumn: new TableColumn({
                        name: "username",
                        length: "64",
                        type: "varchar",
                        isNullable: false,
                        isUnique: true,
                    })
                }
            ]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumns(
            "user",
            [
                {
                    oldColumn: new TableColumn({
                        name: "username",
                        type: "varchar",
                    }),
                    newColumn: new TableColumn({
                        name: "birthdate",
                        type: "date",
                        isNullable: true,
                    })
                }
            ]
        );
    }

}
