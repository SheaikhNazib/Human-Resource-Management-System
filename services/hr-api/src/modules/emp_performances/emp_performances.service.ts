
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpPerformances } from '../../models/emp_performances.entity';
import { Employees } from '../../models/employees.entity';
import { CreateEmpPerformanceDto } from './dto/create.dto';
import { UpdateEmpPerformanceDto } from './dto/update.dto';

@Injectable()
export class EmpPerformancesService {
	constructor(
		@InjectRepository(EmpPerformances)
		private readonly repo: Repository<EmpPerformances>,
	) {}

	async create(createDto: CreateEmpPerformanceDto) {
		// Validate employee exists
		const employeeRepo = this.repo.manager.getRepository(Employees);
		const employee = await employeeRepo.findOneBy({ id: createDto.employee });
		if (!employee) {
			throw new HttpException(
				{
					message: `Employee with id ${createDto.employee} does not exist`,
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const performance = this.repo.create({
			...createDto,
			employee: { id: createDto.employee } as Employees,
		});
		return this.repo.save(performance);
	}

	findAll() {
		return this.repo.find({ relations: ['employee'] });
	}

	findOne(id: number) {
		return this.repo.findOne({ where: { id }, relations: ['employee'] });
	}

	async update(id: number, updateDto: UpdateEmpPerformanceDto) {
		const updateData: any = { ...updateDto };
		if (updateDto.employee) {
			updateData.employee = { id: updateDto.employee } as Employees;
		}
		const result = await this.repo.update(id, updateData);
		if (result.affected && result.affected > 0) {
			const updated = await this.repo.findOne({ where: { id }, relations: ['employee'] });
			return {
				message: 'Performance updated successfully.',
				data: updated,
			};
		} else {
			return {
				message: 'Performance not found or not updated.',
				data: null,
			};
		}
	}

	remove(id: number) {
		return this.repo.delete(id);
	}
}
