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

  async findAll() {
    const data = await this.repo.find();
    return {
      message: data.length > 0 ? 'Job titles fetched successfully.' : 'No job titles found.',
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.repo.findOneBy({ id });
    if (data) {
      return {
        message: 'Job title fetched successfully.',
        data,
      };
    } else {
      return {
        message: 'Job title not found.',
        data: null,
      };
    }
  }

  async update(id: number, updateDto: UpdateEmpJobTitleDto) {
    const result = await this.repo.update(id, updateDto);
    if (result.affected && result.affected > 0) {
      const updated = await this.repo.findOneBy({ id });
      return {
        message: 'Job title updated successfully.',
        data: updated,
      };
    } else {
      return {
        message: 'Job title not found or not updated.',
        data: null,
      };
    }
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected && result.affected > 0) {
      return {
        message: 'Job title deleted successfully.',
        id,
        status: 'success',
      };
    } else {
      return {
        message: 'Job title not found.',
        id,
        status: 'not_found',
      };
    }
  }
}
