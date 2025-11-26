import { MigrationInterface, QueryRunner } from "typeorm";

export class MakePasswordNullableInEmployees1764137363000 implements MigrationInterface {
    name = 'MakePasswordNullableInEmployees1764137363000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD COLUMN "password" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "password"`);
    }
} 
 
