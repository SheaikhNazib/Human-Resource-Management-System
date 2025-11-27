import { CreateUserDto } from "../users/dto/create-user.dto";
export const createEmployeeObjectForUser = (createDto: CreateUserDto) => {
    return {
        name: createDto.email,
        first_name: createDto.email.split('@')[0].split('.')[0],
        last_name: createDto.email.split('@')[0].split('.')[1],
        personal_email: createDto.email,
        work_email: createDto.email,
        mobile: 'xxxxxxxxx',
        password: createDto.password,
        office_phone: 'xxxxx',
        address: 'xxxxx',
        full_address: 'xxxxx',
        hire_date: new Date().toISOString(),
        leave_date: undefined,
        current_or_former_emp: true,
        emp_department: createDto.emp_department,
        emp_job_title: createDto.emp_job_title  
    }
}

