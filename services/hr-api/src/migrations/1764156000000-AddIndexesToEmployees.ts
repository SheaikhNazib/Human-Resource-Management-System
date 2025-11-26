import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexesToEmployees1764156000000 implements MigrationInterface {
    name = 'AddIndexesToEmployees1764156000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if pg_trgm extension exists, if not create it (for better text search performance)
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS pg_trgm;
        `);

        // Create indexes for filterable fields
        // Text fields with ILIKE - using GIN index with pg_trgm for better partial match performance
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_first_name" 
            ON "employees" USING gin ("first_name" gin_trgm_ops);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_last_name" 
            ON "employees" USING gin ("last_name" gin_trgm_ops);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_personal_email" 
            ON "employees" USING gin ("personal_email" gin_trgm_ops);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_work_email" 
            ON "employees" USING gin ("work_email" gin_trgm_ops);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_mobile" 
            ON "employees" USING gin ("mobile" gin_trgm_ops);
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_office_phone" 
            ON "employees" USING gin ("office_phone" gin_trgm_ops);
        `);

        // Date fields - using B-tree index for exact match
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_hire_date" 
            ON "employees" ("hire_date");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_leave_date" 
            ON "employees" ("leave_date");
        `);

        // Boolean field - using B-tree index
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_current_or_former_emp" 
            ON "employees" ("current_or_former_emp");
        `);

        // Foreign key fields - these might already have indexes, but creating them explicitly
        // TypeORM usually creates indexes for foreign keys, but let's ensure they exist
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_emp_department_id" 
            ON "employees" ("emp_department_id");
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_employees_emp_job_title_id" 
            ON "employees" ("emp_job_title_id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes in reverse order
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_emp_job_title_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_emp_department_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_current_or_former_emp"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_leave_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_hire_date"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_office_phone"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_mobile"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_work_email"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_personal_email"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_last_name"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_employees_first_name"`);
        
        // Note: We don't drop pg_trgm extension as it might be used by other tables
    }
}

