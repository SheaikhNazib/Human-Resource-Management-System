import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ENTITY_NAME } from "../common/constant/entity";

@Entity({ name: ENTITY_NAME.EMP_JOB_TITLES })
export class EmpJobTitles extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;
}