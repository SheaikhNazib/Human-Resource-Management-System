
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { EmpJobTitlesService } from './emp_job_titles.service';
import { CreateEmpJobTitleDto } from './dto/create.dto';
import { UpdateEmpJobTitleDto } from './dto/update.dto';

@ApiTags('EmployeeJobTitles')
@Controller('emp-job-titles')
export class EmpJobTitlesController {
  constructor(private readonly empJobTitlesService: EmpJobTitlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create job title' })
  @ApiBody({ type: CreateEmpJobTitleDto })
  @ApiResponse({ status: 201, description: 'Job title created' })
  create(@Body() createDto: CreateEmpJobTitleDto) {
    return this.empJobTitlesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all job titles' })
  @ApiResponse({ status: 200, description: 'List of job titles' })
  findAll() {
    return this.empJobTitlesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job title by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Job title found' })
  findOne(@Param('id') id: number) {
    return this.empJobTitlesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job title by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateEmpJobTitleDto })
  @ApiResponse({ status: 200, description: 'Job title updated' })
  update(@Param('id') id: number, @Body() updateDto: UpdateEmpJobTitleDto) {
    return this.empJobTitlesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job title by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Job title deleted' })
  remove(@Param('id') id: number) {
    return this.empJobTitlesService.remove(id);
  }
}
