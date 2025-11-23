import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpJobTitles } from '../../models/emp_job_titles.entity';
import { CreateEmpJobTitleDto } from './dto/create.dto';
import { UpdateEmpJobTitleDto } from './dto/update.dto';

@Injectable()
export class EmpJobTitlesService {
  constructor(
    @InjectRepository(EmpJobTitles)
    private readonly repo: Repository<EmpJobTitles>,
  ) {}

  create(createDto: CreateEmpJobTitleDto) {
    const jobTitle = this.repo.create(createDto);
    return this.repo.save(jobTitle);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, updateDto: UpdateEmpJobTitleDto) {
    return this.repo.update(id, updateDto);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
