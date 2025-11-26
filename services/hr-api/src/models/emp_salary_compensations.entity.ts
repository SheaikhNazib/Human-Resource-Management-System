import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ENTITY_NAME } from "../common/constant/entity";
import { Employees } from "./employees.entity";

@Entity({ name: ENTITY_NAME.EMP_SALARY_COMPENSATIONS })
export class EmpSalaryCompensations extends BaseEntity {
	@Column({ type: 'decimal', precision: 12, scale: 2 })
	base_salary: number;

	@Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
	bonus?: number;

	@Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
	allowance?: number;

	@Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
	deduction?: number;

	@Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
	net_salary?: number;

	@Column({ type: 'date', nullable: false })
	payable_date: Date;

	@Column({ type: 'date', nullable: false })
	effective_date: string;

	@Column({ type: 'text', nullable: true })
	remarks?: string;

    @ManyToOne(() => Employees, { nullable: false })
	@JoinColumn({ name: 'employee_id' })
	employee: Employees;
}
