import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EmpAttendances } from '../../models/emp_attendances.entity';
import { Employees } from '../../models/employees.entity';
import { CreateEmpAttendanceDto } from './dto/create.dto';
import { UpdateEmpAttendanceDto } from './dto/update.dto';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class EmpAttendancesService {
  constructor(
    @InjectRepository(EmpAttendances)
    private readonly repo: Repository<EmpAttendances>,
    @InjectRepository(Employees)
    private readonly employeesRepo: Repository<Employees>,
    private readonly employeesService: EmployeesService,
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

  async bulkCreate(createDtos: CreateEmpAttendanceDto[]) {
    try {
      // Get all unique employee IDs from the request
      const employeeIds = [...new Set(createDtos.map(dto => dto.employee))];
      
      // Validate that all employee IDs exist
      const existingEmployees = await this.employeesRepo.find({
        where: { id: In(employeeIds) },
        select: ['id'],
      });
      
      const existingEmployeeIds = new Set(existingEmployees.map(emp => emp.id));
      const invalidEmployeeIds = employeeIds.filter(id => !existingEmployeeIds.has(id));
      
      if (invalidEmployeeIds.length > 0) {
        return {
          success: false,
          statusCode: 400,
          message: `The following employee IDs do not exist: ${invalidEmployeeIds.join(', ')}`,
          invalidEmployeeIds,
          data: null,
          totalCreated: 0,
        };
      }
      
      // Create attendance records
      const attendances = createDtos.map(dto => 
        this.repo.create({ ...dto, employee: { id: dto.employee } })
      );
      
      // Save all attendances
      const savedAttendances = await this.repo.save(attendances);
      
      return {
        success: true,
        message: `Successfully created ${savedAttendances.length} attendance record(s)`,
        data: savedAttendances,
        totalCreated: savedAttendances.length,
      };
    } catch (error) {
      const errMsg = (error instanceof Error) ? error.message : 'Internal server error';
      return {
        success: false,
        statusCode: 500,
        message: errMsg,
        data: null,
        totalCreated: 0,
      };
    }
  }

  async findAll(page: number, limit: number, sortBy: string, sortOrder: string = 'asc', date?: string): Promise<any> {
    // ASC = newest first (DESC order), DESC = oldest first (ASC order)
    const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'DESC' : 'ASC';
    
    let queryBuilder = this.repo.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee');
    
    // If date is provided, filter by date
    if (date) {
      const formattedDate = date.split('T')[0];
      queryBuilder = queryBuilder.where('attendance.date = :date', { date: formattedDate });
    }
    
    // Get total count
    const allTotal = await queryBuilder.getCount();
    
    // Apply ordering
    queryBuilder = queryBuilder.orderBy(`attendance.${sortBy}`, orderDirection);
    
    // Apply pagination only if date is not provided (if date is provided, return all records for that date)
    if (!date) {
      const totalPages = Math.ceil(allTotal / limit);
      queryBuilder = queryBuilder
        .skip((page - 1) * limit)
        .take(limit);
      
      const data = await queryBuilder.getMany();
      
      return {
        metaData: {
          page: +page || 1,
          limit: +limit || 10,
          allTotal: +allTotal || 0,
          totalPages: +totalPages || 0,
        },
        data,
      };
    } else {
      // If date is provided, return all records for that date
      const data = await queryBuilder.getMany();
      
      return {
        metaData: {
          date: date.split('T')[0],
          totalRecords: +allTotal || 0,
        },
        data,
      };
    }
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
    // Standard check-in time threshold (10:00 AM)
    const standardCheckInTime = '10:00:00';
    // Late threshold (10:30 AM)
    const lateThresholdTime = '10:30:00';
    
    // Format dates to YYYY-MM-DD format
    const formattedStartDate = startDate.split('T')[0];
    const formattedEndDate = endDate.split('T')[0];

    // Query builder for more complex filtering
    const queryBuilder = this.repo.createQueryBuilder('attendance')
      .where('attendance.date >= :startDate', { startDate: formattedStartDate })
      .andWhere('attendance.date <= :endDate', { endDate: formattedEndDate });

    // Count On Time: checkIn <= 10:00:00 AND onsite_or_remote = true
    const onTimeQuery = queryBuilder.clone()
      .andWhere('attendance.checkIn <= :standardTime', { standardTime: standardCheckInTime })
      .andWhere('attendance.onsite_or_remote = :onsite', { onsite: true });
    const onTimeCount = await onTimeQuery.getCount();

    // Count Late: checkIn > 10:30:00 AND onsite_or_remote = true
    const lateQuery = queryBuilder.clone()
      .andWhere('attendance.checkIn > :lateThreshold', { lateThreshold: lateThresholdTime })
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

  async getMyAttendance(employeeId: number, startDate: string, endDate: string): Promise<any> {
    // Format dates to YYYY-MM-DD format
    const formattedStartDate = startDate.split('T')[0];
    const formattedEndDate = endDate.split('T')[0];

    // Get employee data once
    const employee = await this.employeesService.findOne(employeeId);

    // Query builder to filter by employee ID and date range (without employee relation)
    const queryBuilder = this.repo.createQueryBuilder('attendance')
      .where('attendance.employee_id = :employeeId', { employeeId })
      .andWhere('attendance.date >= :startDate', { startDate: formattedStartDate })
      .andWhere('attendance.date <= :endDate', { endDate: formattedEndDate })
      .orderBy('attendance.date', 'DESC');

    const [attendance, totalCount] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      data: {
        employee, attendance,
      },
      metaData: {
        employeeId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        totalRecords: totalCount,
      },
    };
  }

  async getAttendanceByEmployeeId(employee: any, startDate: string, endDate: string): Promise<any> {
    // Format dates to YYYY-MM-DD format
    const formattedStartDate = startDate.split('T')[0];
    const formattedEndDate = endDate.split('T')[0];

    // Query builder to filter by employee ID and date range (without employee relation)
    const queryBuilder = this.repo.createQueryBuilder('attendance')
      .where('attendance.employee_id = :employeeId', { employeeId: employee.id })
      .andWhere('attendance.date >= :startDate', { startDate: formattedStartDate })
      .andWhere('attendance.date <= :endDate', { endDate: formattedEndDate })
      .orderBy('attendance.date', 'DESC');

    const [attendance, totalCount] = await Promise.all([
      queryBuilder.getMany(),
      queryBuilder.getCount(),
    ]);

    return {
      data: {
        employee, attendance,
      },
      metaData: {
        employeeId: employee.id,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        totalRecords: totalCount,
      },
    };
  }
}
