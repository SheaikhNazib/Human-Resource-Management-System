import { ENTITY_NAME } from "../common/constant/entity";
import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";
@Entity({ name: ENTITY_NAME.APP_ROLES })
export class AppRoles extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;
}
