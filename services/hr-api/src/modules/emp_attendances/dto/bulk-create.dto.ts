import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateEmpAttendanceDto } from './create.dto';

export class BulkCreateEmpAttendanceDto {
  @ApiProperty({ 
    type: [CreateEmpAttendanceDto],
    description: 'Array of attendance records to create',
    example: [
      {
        date: '2025-11-26',
        checkIn: '09:00:00',
        checkOut: '18:00:00',
        onsite_or_remote: true,
        remarks: 'Onsite',
        check_in_ip: '192.168.1.1',
        check_out_ip: '192.168.1.2',
        employee: 1
      },
      {
        date: '2025-11-26',
        checkIn: '09:30:00',
        checkOut: '18:30:00',
        onsite_or_remote: false,
        remarks: 'Remote',
        check_in_ip: '192.168.1.3',
        check_out_ip: '192.168.1.4',
        employee: 2
      }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one attendance record is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateEmpAttendanceDto)
  attendances: CreateEmpAttendanceDto[];
}

