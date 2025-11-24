import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskStatusDto {
  @ApiProperty({ example: 'In Progress' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Task is currently being worked on.' })
  @IsString()
  @IsOptional()
  description?: string;
}
