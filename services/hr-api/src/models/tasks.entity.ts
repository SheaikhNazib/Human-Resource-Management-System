import { Entity, Column, ManyToMany, JoinTable, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ENTITY_NAME } from "../common/constant/entity";
import { Employees } from "./employees.entity";
import { TaskStatuses } from "./task_statuses.entity";

@Entity({ name: 'tasks' })
export class Tasks extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  start_date_time?: Date;

  @Column({ type: 'date', nullable: true })
  end_date_time?: Date;

  @Column( {type: 'varchar', length: 100, nullable: true })
  estimated_time?: string;

  @ManyToMany(() => Employees)
  @JoinTable({
    name: 'task_assignments',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'employee_id', referencedColumnName: 'id' },
  })
  assigned_employees: Employees[];

  @ManyToOne(() => TaskStatuses, { nullable: true })
  @JoinColumn({ name: 'task_status_id' })
  task_status: TaskStatuses;
}
