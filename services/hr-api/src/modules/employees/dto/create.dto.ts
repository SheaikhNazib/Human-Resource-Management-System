
import { IsString, IsOptional, IsEmail, IsDateString, IsBoolean, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name: string;

  @ApiProperty({ example: 'john.doe@gmail.com' })
  @IsEmail()
  personal_email: string;

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  work_email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiPropertyOptional({ example: '123456' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: '+0987654321' })
  @IsString()
  @IsOptional()
  office_phone?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country' })
  @IsString()
  @IsOptional()
  full_address?: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  hire_date: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsDateString()
  @IsOptional()
  leave_date?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  current_or_former_emp: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  emp_department: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  emp_job_title: number;
}
