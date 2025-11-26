import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { EmpJobTitles } from 'src/models/emp_job_titles.entity';

export class LoginDto {
  @ApiProperty({ example: 'karim_ahmed@example.com' })
  @IsNotEmpty()
  @IsString()
  work_email: string;

  @ApiProperty({ example: 'Password123!' })
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
