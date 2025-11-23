import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreateEmpAttendanceDto } from './dto/create.dto';
import { UpdateEmpAttendanceDto } from './dto/update.dto';
import { EmpAttendancesService } from './emp_attendances.service';

@Controller('emp-attendances')
export class EmpAttendancesController {
  constructor(private readonly empAttendancesService: EmpAttendancesService) {}

  @Post()
  create(@Body() createDto: CreateEmpAttendanceDto) {
    return this.empAttendancesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.empAttendancesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.empAttendancesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateEmpAttendanceDto) {
    return this.empAttendancesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.empAttendancesService.remove(id);
  }
}
