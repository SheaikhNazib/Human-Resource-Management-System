import { IsNotEmpty, IsString, IsBoolean, IsEnum, MinLength, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Roles } from '../../../common/guards/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@gmail.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ example: Roles.SUPER_ADMIN })
  @IsEnum(Roles)
  @IsNotEmpty()
  role: Roles;

  @ApiProperty({ example: 11 })
  @IsInt()
  @IsNotEmpty()
  emp_department: number;

  @ApiProperty({ example: 11 })
  @IsInt()
  @IsNotEmpty()
  emp_job_title: number;
}
