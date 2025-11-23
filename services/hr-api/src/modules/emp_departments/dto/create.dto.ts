import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpDepartmentDto {
  @ApiProperty({ example: 'HR' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Handles human resources' })
  @IsString()
  @IsOptional()
  description?: string;
}
