"use server"

import { fetchFromApi } from '@/lib/axios';
import { Api_path } from '@/constant/api-path';

export async function getEmployeesList() {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE.LIST);
    console.log('Raw employees response from backend:', JSON.stringify(response));

    const body = response?.data ?? response;
    let rawList = [];
    if (Array.isArray(body)) {
      rawList = body;
    } else if (Array.isArray(body.data)) {
      rawList = body.data;
    } else if (Array.isArray(body?.data?.data)) {
      rawList = body.data.data;
    } else {
      rawList = [];
    }
    const data = Array.isArray(rawList)
      ? rawList.map((item) => ({
          id: item.id,
          firstName: item.first_name,
          lastName: item.last_name,
          name: item.name,
          email: item.work_email || item.personal_email,
          jobTitle: item.emp_job_title?.name || '',
          department: item.emp_department?.name || '',
          status: item.current_or_former_emp === false ? 'Former' : 'Active',
          avatar: item.avatar || null,
        }))
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
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error('Error deleting employee:', error);
    return { success: false, error: error.message };
  }
}
