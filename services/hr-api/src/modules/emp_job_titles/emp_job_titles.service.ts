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
    // Validate emp_department exists
    const departmentRepo = this.repo.manager.getRepository('emp_departments');
    const department = await departmentRepo.findOneBy({ id: createDto.emp_department });
    if (!department) {
      return {
        statusCode: 400,
        message: `emp_department with id ${createDto.emp_department} does not exist`,
        error: 'Bad Request'
      };
    }
    const jobTitle = this.repo.create({
      ...createDto,
      emp_department: { id: createDto.emp_department },
    });
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

  findByIds(ids: number[]) {
    if (!ids || ids.length === 0) return Promise.resolve([]);
    return this.repo.findBy({ id: In(ids) });
  }

  async update(id: number, updateDto: UpdateEmpJobTitleDto) {
    // If emp_department is being updated, validate it exists
    let updateData: any = { ...updateDto };
    if (updateDto.emp_department) {
      const departmentRepo = this.repo.manager.getRepository('emp_departments');
      const department = await departmentRepo.findOneBy({ id: updateDto.emp_department });
      if (!department) {
        return {
          message: `emp_department with id ${updateDto.emp_department} does not exist`,
          data: null,
        };
      }
      updateData.emp_department = { id: updateDto.emp_department };
    }
    const result = await this.repo.update(id, updateData);
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
