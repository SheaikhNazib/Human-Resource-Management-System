import { CreateUserDto } from "../users/dto/create-user.dto";
export const createEmployeeObjectForUser = (createDto: CreateUserDto) => {
    const emailPrefix = createDto.email.split('@')[0];
    const nameParts = emailPrefix.split('.');
    const firstName = nameParts[0];
    const lastName = nameParts[1] || nameParts[0];
    
    return {
        name: createDto.email,
        first_name: firstName,
        last_name: lastName,
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

