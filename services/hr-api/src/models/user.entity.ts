import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Roles } from "../common/guards/roles.enum";
import { ENTITY_NAME } from "../common/constant/entity";

@Entity({ name: ENTITY_NAME.USERS })
export class Users extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: Roles })
  role: Roles;
}
