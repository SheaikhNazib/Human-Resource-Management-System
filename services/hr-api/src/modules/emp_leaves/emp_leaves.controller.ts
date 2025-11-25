import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { EmpLeavesService } from './emp_leaves.service';
import { CreateEmpLeaveDto } from './dto/create.dto';
import { UpdateEmpLeaveDto } from './dto/update.dto';
import { ApiTags, ApiCreatedResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('EmpLeaves')
@Controller('emp-leaves')
export class EmpLeavesController {
  constructor(private readonly service: EmpLeavesService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Leave created successfully' })
  @ApiBody({ type: CreateEmpLeaveDto })
  create(@Body() dto: CreateEmpLeaveDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpLeaveDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
