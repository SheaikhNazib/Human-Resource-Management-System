import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity({ name: 'task_statuses' })
export class TaskStatuses extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
