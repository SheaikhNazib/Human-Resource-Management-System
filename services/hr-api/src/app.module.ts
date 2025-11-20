import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import appConfig from "./config/app.config";
import databaseConfig from "./config/database.config";
import { AppRolesModule } from "./modules/app_roles/app_roles.module";

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
  ],
})
export class AppModule {}
