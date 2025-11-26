import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpJobTitles } from '../../models/emp_job_titles.entity';
import { EmpJobTitlesService } from './emp_job_titles.service';
import { EmpJobTitlesController } from './emp_job_titles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmpJobTitles])],
  controllers: [EmpJobTitlesController],
  providers: [EmpJobTitlesService],
  exports: [EmpJobTitlesService],
})
export class EmpJobTitlesModule {}
