import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Tasks } from "./tasks.entity";
import { Employees } from "./employees.entity";
import { TaskStatuses } from "./task_statuses.entity";

@Entity({ name: 'task_work_items' })
export class TaskWorkItems extends BaseEntity {
	@Column({ type: 'varchar', length: 255 })
	title: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'date', nullable: true })
	start_date_time?: Date;

	@Column({ type: 'date', nullable: true })
	end_date_time?: Date;

	@Column({ type: 'varchar', length: 100, nullable: true })
	estimated_time?: string;

	@ManyToOne(() => Tasks, { nullable: false })
	@JoinColumn({ name: 'task_id' })
	task: Tasks;

	@ManyToOne(() => Employees, { nullable: true })
	@JoinColumn({ name: 'employee_id' })
	employee?: Employees;

	@ManyToOne(() => TaskStatuses, { nullable: true })
	@JoinColumn({ name: 'task_status_id' })
	task_status?: TaskStatuses;
}
