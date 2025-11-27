import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EmpJobTitles } from '../../models/emp_job_titles.entity';
import { CreateEmpJobTitleDto } from './dto/create.dto';
import { UpdateEmpJobTitleDto } from './dto/update.dto';

@Injectable()
export class EmpJobTitlesService {
  constructor(
    @InjectRepository(EmpJobTitles)
    private readonly repo: Repository<EmpJobTitles>,
  ) {}

  async create(createDto: CreateEmpJobTitleDto) { 
    try {
      const jobTitle = this.repo.create({
        ...createDto,
        emp_department: { id: createDto.emp_department },
      });
      return await this.repo.save(jobTitle);
    } catch (error) {
      console.error('Error creating job title:', error);
      return null;
    }
  }

  async findAll() {
    return await this.repo.find({ relations: ['emp_department'] });
    
  }

  async findOne(id: number) {
    return await this.repo.findOne({ where: { id }, relations: ['emp_department'] });
  }

  findByIds(ids: number[]) {
    if (!ids || ids.length === 0) return Promise.resolve([]);
    return this.repo.findBy({ id: In(ids) });
  }

  async update(id: number, updateDto: UpdateEmpJobTitleDto) {
    try {
      const updateData: any = { ...updateDto };
      if (updateDto.emp_department) {
        updateData.emp_department = { id: updateDto.emp_department };
      }
      const result = await this.repo.update(id, updateData); 
      if (result && result.affected && result.affected > 0) {
        return await this.repo.findOneBy({ id });
      }
      return null;
    } catch (error) {
      console.error('Error updating job title:', error);
      return null;
    }
  }

  async remove(id: number) {
    try {
      const result = await this.repo.delete(id);
      if (result && result.affected && result.affected > 0) {
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error removing job title:', error);
      return null;
    }
  }
}
