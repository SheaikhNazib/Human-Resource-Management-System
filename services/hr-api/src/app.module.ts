import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import appConfig from "./config/app.config";
import databaseConfig from "./config/database.config";
import { AppRolesModule } from "./modules/app_roles/app_roles.module";
import { EmpAttendancesModule } from "./modules/emp_attendances/emp_attendances.module";
import { EmpDepartmentsModule } from "./modules/emp_departments/emp_departments.module";

import { EmployeesModule } from "./modules/employees/employees.module";
import { EmpJobTitlesModule } from "./modules/emp_job_titles/emp_job_titles.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { TaskStatusesModule } from "./modules/task_statuses/task_statuses.module";
import { TaskWorkItemsModule } from "./modules/task_work_items/task_work_items.module";
import { EmpLeavesModule } from "./modules/emp_leaves/emp_leaves.module";
import { AuthModule } from "./modules/auth/auth.module";
import { SqlInjectionDetectorMiddleware } from "./common/middleware/sql-injection-detector.middleware";
import { XssProtectionMiddleware } from "./common/middleware/xss-protection.middleware";

import { EmpSalaryCompensationsModule } from "./modules/emp_salary_compensations/emp_salary_compensations.module";
import { EmpPerformancesModule } from "./modules/emp_performances/emp_performances.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get("database.host"),
        port: config.get("database.port"),
        username: config.get("database.username"),
        password: config.get("database.password"),
        database: config.get("database.dbName"),
        autoLoadEntities: true,
        synchronize: false, // don't use true in production
      }),
    }),
    AuthModule,
    AppRolesModule,
    EmpAttendancesModule,
    EmpDepartmentsModule,
    EmpJobTitlesModule,
    EmployeesModule,
    TasksModule,
    TaskStatusesModule,
    TaskWorkItemsModule,
    EmpLeavesModule,
    EmpSalaryCompensationsModule,
    EmpPerformancesModule,
    UsersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middlewares to all routes
    consumer
      .apply(SqlInjectionDetectorMiddleware, XssProtectionMiddleware)
      .forRoutes('*');
  }
}
