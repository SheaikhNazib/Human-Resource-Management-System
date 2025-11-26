import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ENTITY_NAME } from "../common/constant/entity";
import { EmpDepartments } from "./emp_departments.entity";
import { EmpJobTitles } from "./emp_job_titles.entity";

@Entity({ name: ENTITY_NAME.EMPLOYEES })
export class Employees extends BaseEntity {
  @Column()
  name: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  personal_email: string;

  @Column({ unique: true })
  work_email: string;

  @Column({ nullable: true })
  mobile?: string;

  // @Column()
  // password: string;

  @Column({ nullable: true })
  office_phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ type: 'text', nullable: true })
  full_address?: string;

  @Column({ type: 'date' })
  hire_date: string;

  @Column({ type: 'date', nullable: true })
  leave_date?: string;

  @Column({ type: 'boolean', default: true })
  current_or_former_emp: boolean;

  @ManyToOne(() => EmpDepartments, { nullable: false })
  @JoinColumn({ name: 'emp_department_id' })
  emp_department: EmpDepartments;

  @ManyToOne(() => EmpJobTitles, { nullable: false })
  @JoinColumn({ name: 'emp_job_title_id' })
  emp_job_title: EmpJobTitles;
}