import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { ENTITY_NAME } from "../common/constant/entity";
import { BaseEntity } from "./base.entity";

@Entity({ name: ENTITY_NAME.EMP_ATTENDANCES })
export class EmpAttendances extends BaseEntity {
  @Column({ type: "date" })
  date: string;

  @Column({ type: "time" })
  checkIn: string;

  @Column({ type: "time", nullable: true })
  checkOut?: string;

  @Column({ type: "text", nullable: true })
  remarks?: string;

  @Column({ type: "boolean", default: true })
  onsite_or_remote: boolean;

  @Column({ type: "varchar", length: 45, nullable: true })
  check_in_ip?: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  check_out_ip?: string;
}
