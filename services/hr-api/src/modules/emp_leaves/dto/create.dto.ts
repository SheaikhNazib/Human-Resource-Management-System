import { IsDateString, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpLeaveDto {
  @ApiProperty({ example: '2025-11-24' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: '2025-11-25' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({ example: 'Annual leave for vacation' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'pending' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  employee: number;

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @IsOptional()
  leave_days?: number;
}
