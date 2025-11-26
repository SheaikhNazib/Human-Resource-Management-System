import { IsNotEmpty, IsString, IsBoolean, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Roles } from 'src/common/guards/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'john.doe@gmail.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ example: Roles.SUPER_ADMIN })
  @IsEnum(Roles)
  @IsNotEmpty()
  role: Roles;
}
