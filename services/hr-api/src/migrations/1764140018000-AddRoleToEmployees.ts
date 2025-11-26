import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleToEmployees1764140018000 implements MigrationInterface {
    name = 'AddRoleToEmployees1764140018000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "role_enum" AS ENUM ('super_admin', 'hr_manager', 'accountant', 'manager', 'employee');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        // Add role column as nullable
        await queryRunner.query(`ALTER TABLE "employees" ADD COLUMN "role" role_enum`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "role_enum"`);
    }
}

