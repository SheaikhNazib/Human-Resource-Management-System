import { Global, Module } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UsersModule } from '../../modules/users/users.module';
import { EmployeesModule } from '../../modules/employees/employees.module';

@Global()
@Module({
  imports: [UsersModule, EmployeesModule],
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class GuardsModule {}

