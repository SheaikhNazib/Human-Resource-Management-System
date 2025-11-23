import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpAttendanceDto {
  @ApiProperty({ example: '2025-11-23' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00:00' })
  @IsString()
  checkIn: string;

  @ApiPropertyOptional({ example: '18:00:00' })
  @IsString()
  @IsOptional()
  checkOut?: string;

  @ApiPropertyOptional({ example: 'Late due to traffic' })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ type: Boolean, example: true, description: 'true for onsite, false for remote' })
  onsite_or_remote: boolean;

  @ApiPropertyOptional({ example: '192.168.1.1' })
  @IsString()
  @IsOptional()
  check_in_ip?: string;

  @ApiPropertyOptional({ example: '192.168.1.2' })
  @IsString()
  @IsOptional()
  check_out_ip?: string;
}
