import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryEmployeeDto {
  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: ['createdAt', 'updatedAt'], default: 'createdAt' })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'asc';

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  personal_email?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  work_email?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  office_phone?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  hire_date?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  leave_date?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  current_or_former_emp?: boolean | string;

  @ApiPropertyOptional({ type: Number })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  emp_department?: number;

  @ApiPropertyOptional({ type: Number })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  emp_job_title?: number;
}

