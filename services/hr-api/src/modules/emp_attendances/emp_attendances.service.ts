import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpAttendances } from '../../models/emp_attendances.entity';
import { CreateEmpAttendanceDto } from './dto/create.dto';
import { UpdateEmpAttendanceDto } from './dto/update.dto';

@Injectable()
export class EmpAttendancesService {
  constructor(
    @InjectRepository(EmpAttendances)
    private readonly repo: Repository<EmpAttendances>,
  ) {}

  create(createDto: CreateEmpAttendanceDto) {
    const attendance = this.repo.create(createDto);
    return this.repo.save(attendance);
  }


  async findAll() {
    const data = await this.repo.find();
    return {
      data,
      count: data.length,
    };
  }


  async findOne(id: number) {
    const data = await this.repo.findOneBy({ id });
    if (data) {
      return {
        message: 'Attendance found',
        data,
      };
    } else {
      return {
        message: 'Attendance not found',
        data: null,
      };
    }
  }


  async update(id: number, updateDto: UpdateEmpAttendanceDto) {
    const result = await this.repo.update(id, updateDto);
    if (result.affected && result.affected > 0) {
      const updated = await this.repo.findOneBy({ id });
      return {
        message: 'Attendance updated successfully',
        id,
        updated,
      };
    } else {
      return { message: 'Attendance not found or not updated', id, updated: null };
    }
  }


  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected && result.affected > 0) {
      return { message: 'Attendance deleted successfully', id };
    } else {
      return { message: 'Attendance not found or not deleted', id };
    }
  }
}
