import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Roles } from "../common/guards/roles.enum";
import { ENTITY_NAME } from "../common/constant/entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";

@Entity({ name: ENTITY_NAME.USERS })
export class Users extends BaseEntity {
  @ApiProperty({ example: 'john.doe@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean = true;

  @Column({ type: 'enum', enum: Roles })
  @ApiProperty({ example: Roles.SUPER_ADMIN })
  @IsEnum(Roles)
  @IsNotEmpty()
  role: Roles;
}
