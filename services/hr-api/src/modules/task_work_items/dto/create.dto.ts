
import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskWorkItemDto {
  @ApiProperty({ example: 'Subtask title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Subtask description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2025-11-24' })
  @IsDateString()
  @IsOptional()
  start_date_time?: Date;

  @ApiPropertyOptional({ example: '2025-11-25' })
  @IsDateString()
  @IsOptional()
  end_date_time?: Date;

  @ApiPropertyOptional({ example: '2h 30m' })
  @IsString()
  @IsOptional()
  estimated_time?: string;

  @ApiProperty({ example: 1, description: 'Task ID' })
  @IsInt()
  task: number;

  @ApiPropertyOptional({ example: 1, description: 'Employee ID' })
  @IsInt()
  @IsOptional()
  employee?: number;

  @ApiPropertyOptional({ example: 1, description: 'Task Status ID' })
  @IsInt()
  @IsOptional()
  task_status?: number;
}
