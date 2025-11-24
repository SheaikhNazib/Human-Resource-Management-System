import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAppRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;
}
