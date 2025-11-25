
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ENTITY_NAME } from "../common/constant/entity";
import { Employees } from "./employees.entity";

@Entity({ name: "emp_performances" })
export class EmpPerformances extends BaseEntity {
	@Column({ type: "date" })
	review_date: string;

	@Column({ type: "int", nullable: false })
	score: number;

	@Column({ type: "text", nullable: true })
	feedback?: string;

	@Column({ type: "varchar", length: 100, nullable: true })
	reviewer?: string;

	@ManyToOne(() => Employees, { nullable: false })
	@JoinColumn({ name: 'employee_id' })
	employee: Employees;
}
