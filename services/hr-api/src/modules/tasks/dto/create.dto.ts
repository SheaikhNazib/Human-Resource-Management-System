import { IsNotEmpty, IsOptional, IsString, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Design Homepage' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Design the main landing page for the website.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2025-11-25' })
  @IsDateString()
  @IsOptional()
  start_date_time?: string;

  @ApiPropertyOptional({ example: '2025-11-30' })
  @IsDateString()
  @IsOptional()
  end_date_time?: string;

  @ApiPropertyOptional({ example: '5h' })
  @IsString()
  @IsOptional()
  estimated_time?: string;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsNotEmpty()
  assigned_employees: number[];
}
