import { IsDateString, IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateEmpLeaveDto {
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @IsOptional()
  employee?: number;

  @IsInt()
  @IsOptional()
  leave_days?: number;
}
