import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpDepartments } from '../../models/emp_departments.entity';
import { CreateEmpDepartmentDto } from './dto/create.dto';
import { UpdateEmpDepartmentDto } from './dto/update.dto';

@Injectable()
export class EmpDepartmentsService {
  constructor(
    @InjectRepository(EmpDepartments)
    private readonly repo: Repository<EmpDepartments>,
  ) {}

  create(createDto: CreateEmpDepartmentDto) {
    const department = this.repo.create(createDto);
    return this.repo.save(department);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, updateDto: UpdateEmpDepartmentDto) {
    return this.repo.update(id, updateDto);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
