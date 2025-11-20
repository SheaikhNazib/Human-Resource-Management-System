import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAppRoles1700510000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO app_roles (name, description, "createdAt", "updatedAt") VALUES
        ('Super Admin', 'Full system access', NOW(), NOW()),
        ('Admin', 'Admin privileges', NOW(), NOW()),
        ('HR', 'HR department access', NOW(), NOW()),
        ('Employee', 'Employee access', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM app_roles WHERE name IN ('Super Admin', 'Admin', 'HR', 'Employee');
    `);
  }
}
