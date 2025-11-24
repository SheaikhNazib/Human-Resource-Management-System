'use server'

import { fetchFromApi } from '@/lib/api';
import { Api_path } from '@/constant/api-path';

export async function getEmployeesList() {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE.LIST);
    console.log('Raw employees response from backend:', JSON.stringify(response));

    const rawList = response?.data?.data ?? response?.data ?? response ?? [];

    const data = Array.isArray(rawList)
      ? rawList.map((item) => {
          const email = item.work_email ?? item.workEmail ?? item.personal_email ?? item.personalEmail ?? item.email ?? item.email_address ?? item.emailAddress ?? '';

          // Job & department may be objects (with name) or ids
          const jobTitleRaw = item.emp_job_title ?? item.empJobTitle ?? item.jobTitle ?? item.job_title ?? item.role ?? item.job;
          const departmentRaw = item.emp_department ?? item.empDepartment ?? item.department ?? item.dept;

          const jobTitle = typeof jobTitleRaw === 'object' ? (jobTitleRaw.name ?? jobTitleRaw.title ?? String(jobTitleRaw)) : jobTitleRaw ?? '';
          const department = typeof departmentRaw === 'object' ? (departmentRaw.name ?? String(departmentRaw)) : departmentRaw ?? '';

          const firstName = item.firstName ?? item.first_name ?? item.first ?? (item.name ? String(item.name).split(' ')[0] : '') ?? '';
          const lastName = item.lastName ?? item.last_name ?? item.last ?? (item.name ? String(item.name).split(' ').slice(1).join(' ') : '') ?? '';

          return {
            id: item.id ?? item._id ?? item.employeeId ?? item.emp_id ?? item.empId ?? null,
            firstName,
            lastName,
            name: item.name ?? `${firstName} ${lastName}`.trim(),
            email,
            jobTitle,
            department,
            status: item.status ?? item.state ?? (item.current_or_former_emp === false ? 'Former' : 'Active'),
            avatar: item.avatar ?? item.photo ?? null,
            raw: item,
          };
        })
      : [];

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteEmployee(id) {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE.DELETE(id), {
      method: 'DELETE',
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error deleting employee:', error);
    return { success: false, error: error.message };
  }
}
