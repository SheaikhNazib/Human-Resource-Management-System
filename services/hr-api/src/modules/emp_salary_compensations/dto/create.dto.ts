
import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpSalaryCompensationDto {
  @ApiProperty({ example: 50000 })
  @IsNumber()
  base_salary: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @IsOptional()
  bonus?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsNumber()
  @IsOptional()
  allowance?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsNumber()
  @IsOptional()
  deduction?: number;

  @ApiPropertyOptional({ example: 52000 })
  @IsNumber()
  @IsOptional()
  net_salary?: number;

  @ApiProperty({ example: '2025-11-01' })
  @IsDateString()
  effective_date: string;

  @ApiPropertyOptional({ example: 'Yearly increment' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  employeeId: number;
}
