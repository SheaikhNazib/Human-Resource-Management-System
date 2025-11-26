import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsActiveToUsers1764150000000 implements MigrationInterface {
    name = 'AddIsActiveToUsers1764150000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if isActive column already exists
        const columnExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'users' 
                AND column_name = 'isActive'
            );
        `);

        if (!columnExists[0].exists) {
            // Add isActive column with default value true
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
    }
}

