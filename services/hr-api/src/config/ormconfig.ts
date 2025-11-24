import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
dotenv.config();

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/migrations/*.js"],
  synchronize: false, // NEVER TRUE IN PRODUCTION
  logging: true,
});
