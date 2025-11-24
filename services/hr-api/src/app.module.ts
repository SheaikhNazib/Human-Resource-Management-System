import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import appConfig from "./config/app.config";
import databaseConfig from "./config/database.config";
import { AppRolesModule } from "./modules/app_roles/app_roles.module";
import { EmpAttendancesModule } from "./modules/emp_attendances/emp_attendances.module";
import { EmpDepartmentsModule } from "./modules/emp_departments/emp_departments.module";

import { EmployeesModule } from "./modules/employees/employees.module";
import { EmpJobTitlesModule } from "./modules/emp_job_titles/emp_job_titles.module";

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
    AppRolesModule,
    EmpAttendancesModule,
    EmpDepartmentsModule,
    EmpJobTitlesModule,
    EmployeesModule,
  ],
})
export class AppModule {}
