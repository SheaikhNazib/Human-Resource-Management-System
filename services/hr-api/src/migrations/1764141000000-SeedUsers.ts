import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedUsers1764141000000 implements MigrationInterface {
    name = 'SeedUsers1764141000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Hash for password "123456"
        const hashedPassword1 = '$2b$10$PSuoSFkJ8R/tBU5Od0cOtOw76Bn2xIN21Is/vHzHj5IuFVMe0byiC';
        const hashedPassword2 = '$2b$10$Qj5CwhJ61gYYf6o1COMjwOQWlO8C4K.r1aVXjNYopHI/E59o0Ipj.';

        // Check if users table exists, if not create it
        const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        `);

        if (!tableExists[0].exists) {
            // Create role_enum if it doesn't exist
            await queryRunner.query(`
                DO $$ BEGIN
                    CREATE TYPE "role_enum" AS ENUM ('super_admin', 'hr_manager', 'accountant', 'manager', 'employee');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            // Create users table
            await queryRunner.query(`
                CREATE TABLE "users" (
                    "id" SERIAL NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "deletedAt" TIMESTAMP,
                    "email" character varying(255) NOT NULL,
                    "password" character varying(255) NOT NULL,
                    "role" role_enum NOT NULL,
                    CONSTRAINT "PK_users" PRIMARY KEY ("id"),
                    CONSTRAINT "UQ_users_email" UNIQUE ("email")
                );
            `);
        }

        // Insert users (using DO block to handle potential conflicts)
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'super_admin@gmail.com') THEN
                    INSERT INTO users (email, password, role, "createdAt", "updatedAt") 
                    VALUES ('super_admin@gmail.com', '${hashedPassword1}', 'super_admin', NOW(), NOW());
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'hr@gmail.com') THEN
                    INSERT INTO users (email, password, role, "createdAt", "updatedAt") 
                    VALUES ('hr@gmail.com', '${hashedPassword2}', 'hr_manager', NOW(), NOW());
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM users WHERE email IN ('super_admin@gmail.com', 'hr@gmail.com');
        `);
    }
}

