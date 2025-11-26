import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmpSalaryCompensationsTable1764165000000 implements MigrationInterface {
    name = 'AddEmpSalaryCompensationsTable1764165000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists, if not create it
        const table = await queryRunner.getTable("emp_salary_compensations");
        
        if (!table) {
            // Create the entire table
            await queryRunner.query(`
                CREATE TABLE "emp_salary_compensations" (
                    "id" SERIAL NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                    "deletedAt" TIMESTAMP,
                    "base_salary" numeric(12,2) NOT NULL,
                    "bonus" numeric(12,2),
                    "allowance" numeric(12,2),
                    "deduction" numeric(12,2),
                    "net_salary" numeric(12,2),
                    "payable_date" date NOT NULL,
                    "effective_date" date NOT NULL,
                    "remarks" text,
                    "employee_id" integer NOT NULL,
                    CONSTRAINT "PK_emp_salary_compensations" PRIMARY KEY ("id")
                )
            `);
            
            await queryRunner.query(`
                ALTER TABLE "emp_salary_compensations" 
                ADD CONSTRAINT "FK_emp_salary_compensations_employee" 
                FOREIGN KEY ("employee_id") REFERENCES "employees"("id") 
                ON DELETE NO ACTION ON UPDATE NO ACTION
            `);
        } else {
            // Table exists, check if payable_date column exists
            const payableDateColumn = table.findColumnByName("payable_date");
            if (!payableDateColumn) {
                // Step 1: Add column as nullable first
                await queryRunner.query(`
                    ALTER TABLE "emp_salary_compensations" 
                    ADD COLUMN "payable_date" date
                `);
                
                // Step 2: Update existing rows with a default value (use effective_date or current date)
                await queryRunner.query(`
                    UPDATE "emp_salary_compensations" 
                    SET "payable_date" = COALESCE("effective_date", CURRENT_DATE)
                    WHERE "payable_date" IS NULL
                `);
                
                // Step 3: Set NOT NULL constraint
                await queryRunner.query(`
                    ALTER TABLE "emp_salary_compensations" 
                    ALTER COLUMN "payable_date" SET NOT NULL
                `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("emp_salary_compensations");
        
        if (table) {
            const payableDateColumn = table.findColumnByName("payable_date");
            if (payableDateColumn) {
                await queryRunner.query(`
                    ALTER TABLE "emp_salary_compensations" 
                    DROP COLUMN "payable_date"
                `);
            } else {
                // If table was created by this migration, drop it
                await queryRunner.query(`
                    ALTER TABLE "emp_salary_compensations" 
                    DROP CONSTRAINT "FK_emp_salary_compensations_employee"
                `);
                await queryRunner.query(`DROP TABLE "emp_salary_compensations"`);
            }
        }
    }
}

