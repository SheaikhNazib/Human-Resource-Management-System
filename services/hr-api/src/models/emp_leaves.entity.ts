import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ENTITY_NAME } from '../common/constant/entity';
import { Employees } from './employees.entity';

@Entity({ name: ENTITY_NAME.EMP_LEAVES })
export class EmpLeaves extends BaseEntity {
  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'int', nullable: true })
  leave_days: number;

  @Column({ type: 'date' })
  end_date: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @ManyToOne(() => Employees, { nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employees;
}
