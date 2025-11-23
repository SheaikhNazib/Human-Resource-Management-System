import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmpAttendanceDto {
  @IsInt()
  @IsNotEmpty()
  employee_id: number;

  @IsDateString()
  date: string;

  @IsString()
  checkIn: string;

  @IsString()
  @IsOptional()
  checkOut?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsEnum(['onsite', 'remote'])
  onsite_or_remote: 'onsite' | 'remote';

  @IsString()
  @IsOptional()
  check_in_ip?: string;

  @IsString()
  @IsOptional()
  check_out_ip?: string;
}
