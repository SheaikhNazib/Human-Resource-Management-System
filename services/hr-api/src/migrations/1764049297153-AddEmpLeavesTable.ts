import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmpLeavesTable1764049297153 implements MigrationInterface {
    name = 'AddEmpLeavesTable1764049297153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "emp_leaves" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "start_date" date NOT NULL, "leave_days" integer, "end_date" date NOT NULL, "reason" text, "status" character varying(50) NOT NULL DEFAULT 'pending', "employee_id" integer NOT NULL, CONSTRAINT "PK_c7400a620f0fbb516fd30155cf9" PRIMARY KEY ("id"))`);
        // Step 1: Add as nullable
        await queryRunner.query(`ALTER TABLE "emp_attendances" ADD "employee_id" integer`);
        await queryRunner.query(`ALTER TABLE "emp_leaves" ADD CONSTRAINT "FK_02993ee8bae34404763c623357b" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emp_attendances" ADD CONSTRAINT "FK_870256f56ead6ce691bf1418459" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // Step 2: MANUAL STEP REQUIRED: Update all existing emp_attendances rows to set employee_id to a valid value.
        // Step 3: After updating data, set NOT NULL constraint (uncomment next line after manual update):
        // await queryRunner.query(`ALTER TABLE "emp_attendances" ALTER COLUMN "employee_id" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "emp_attendances" DROP CONSTRAINT "FK_870256f56ead6ce691bf1418459"`);
        await queryRunner.query(`ALTER TABLE "emp_leaves" DROP CONSTRAINT "FK_02993ee8bae34404763c623357b"`);
        await queryRunner.query(`ALTER TABLE "emp_attendances" DROP COLUMN "employee_id"`);
        await queryRunner.query(`DROP TABLE "emp_leaves"`);
    }

}
