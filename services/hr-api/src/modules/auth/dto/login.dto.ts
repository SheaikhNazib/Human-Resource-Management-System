import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { EmpJobTitles } from 'src/models/emp_job_titles.entity';
import { Roles } from 'src/common/guards/roles.enum';

export class LoginDto {
  @ApiProperty({ example: 'super_admin@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'xxxxxx' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  user: {
    id: number;
    work_email: string;
    name: string;
    emp_job_title: EmpJobTitles;
  };
}
