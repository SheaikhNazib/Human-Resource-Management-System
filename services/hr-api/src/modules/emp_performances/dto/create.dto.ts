import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateEmpPerformanceDto {
  @IsDateString()
  review_date: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  reviewer?: string;

  @IsInt()
  @IsNotEmpty()
  employee_id: number;
}
