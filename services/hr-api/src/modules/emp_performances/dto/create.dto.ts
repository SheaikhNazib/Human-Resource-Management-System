
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateEmpPerformanceDto {

  @ApiProperty({ type: String, description: 'Date of the review (ISO string)' })
  @IsDateString()
  review_date: string;


  @ApiProperty({ type: Number, minimum: 1, maximum: 10, description: 'Performance score (1-10)' })
  @IsInt()
  @Min(1)
  @Max(10)
  score: number;


  @ApiPropertyOptional({ type: String, description: 'Optional feedback' })
  @IsOptional()
  @IsString()
  feedback?: string;


  @ApiPropertyOptional({ type: String, description: 'Optional reviewer name' })
  @IsOptional()
  @IsString()
  reviewer?: string;

  @ApiProperty({ type: Number, description: 'Employee ID' })
  @IsInt()
  @IsNotEmpty()
  employee: number;
}
