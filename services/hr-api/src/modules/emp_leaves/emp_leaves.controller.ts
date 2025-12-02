import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { EmpLeavesService } from './emp_leaves.service';
import { CreateEmpLeaveDto } from './dto/create.dto';
import { UpdateEmpLeaveDto } from './dto/update.dto';
import { ApiTags, ApiCreatedResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireRoles } from '../../common/guards/roles.decorator';
import { Roles } from '../../common/guards/roles.enum';

@ApiTags('EmpLeaves')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(Roles.SUPER_ADMIN, Roles.HR_MANAGER, Roles.MANAGER, Roles.ACCOUNTANT, Roles.EMPLOYEE)
@ApiBearerAuth('JWT-auth')
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
