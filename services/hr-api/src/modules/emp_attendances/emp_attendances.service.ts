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

  async create(createDto: CreateEmpAttendanceDto) {
    const attendance = this.repo.create({ ...createDto, employee: { id: createDto.employee } });
    try {
      return await this.repo.save(attendance);
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'Internal server error';
      return { statusCode: 500, message: errMsg };
    }
  }


  async findAll(page: number, limit: number, sortBy: string, sortOrder: string = 'asc'): Promise<any> {
    const allTotal = await this.repo.count();
    const totalPages = Math.ceil(allTotal / limit);
    
    // ASC = newest first (DESC order), DESC = oldest first (ASC order)
    const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'DESC' : 'ASC';
    
    const data = await this.repo.find({ 
      relations: ['employee'], 
      skip: (page - 1) * limit, 
      take: limit, 
      order: { [sortBy]: orderDirection } 
    });
    
    return {
      metaData: {
        page: +page || 1,
        limit: +limit || 10,
        allTotal: +allTotal || 0,
        totalPages: +totalPages || 0,
      },
      data,
    };
  }

  async findOne(id: number) {
    const data = await this.repo.findOne({ where: { id }, relations: ['employee'] });
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
    // Map employee id to relation
    const updateData: any = { ...updateDto };
    if (updateDto.employee !== undefined) {
      updateData.employee = { id: updateDto.employee };
    }
    const result = await this.repo.update(id, updateData);
    if (result.affected && result.affected > 0) {
      const updated = await this.repo.findOne({ where: { id }, relations: ['employee'] });
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

  async getTotalAttendanceCount(date: string) {
    // Format date to YYYY-MM-DD format if needed
    const formattedDate = date.split('T')[0];
    const totalAttendance = await this.repo.count({ 
      where: { date: formattedDate } 
    });
    return totalAttendance;
  }

  async getAttendanceOverview(startDate: string, endDate: string) {
    // Standard check-in time threshold (9:00 AM)
    const standardCheckInTime = '09:00:00';
    
    // Format dates to YYYY-MM-DD format
    const formattedStartDate = startDate.split('T')[0];
    const formattedEndDate = endDate.split('T')[0];

    // Query builder for more complex filtering
    const queryBuilder = this.repo.createQueryBuilder('attendance')
      .where('attendance.date >= :startDate', { startDate: formattedStartDate })
      .andWhere('attendance.date <= :endDate', { endDate: formattedEndDate });

    // Count On Time: checkIn <= 09:00:00 AND onsite_or_remote = true
    const onTimeQuery = queryBuilder.clone()
      .andWhere('attendance.checkIn <= :standardTime', { standardTime: standardCheckInTime })
      .andWhere('attendance.onsite_or_remote = :onsite', { onsite: true });
    const onTimeCount = await onTimeQuery.getCount();

    // Count Late: checkIn > 09:00:00 AND onsite_or_remote = true
    const lateQuery = queryBuilder.clone()
      .andWhere('attendance.checkIn > :standardTime', { standardTime: standardCheckInTime })
      .andWhere('attendance.onsite_or_remote = :onsite', { onsite: true });
    const lateCount = await lateQuery.getCount();

    // Count Remote: onsite_or_remote = false
    const remoteQuery = queryBuilder.clone()
      .andWhere('attendance.onsite_or_remote = :remote', { remote: false });
    const remoteCount = await remoteQuery.getCount();

    return {
      dateRange: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
      statistics: {
        onTime: onTimeCount,
        late: lateCount,
        remote: remoteCount,
        total: onTimeCount + lateCount + remoteCount,
      },
    };
  }
}
