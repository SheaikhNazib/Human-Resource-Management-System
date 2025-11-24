import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ENTITY_NAME } from "../common/constant/entity";
import { EmpDepartments } from "./emp_departments.entity";

@Entity({ name: ENTITY_NAME.EMP_JOB_TITLES })
export class EmpJobTitles extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => EmpDepartments, { nullable: false })
  @JoinColumn({ name: 'emp_department_id' })
  emp_department: EmpDepartments;
}