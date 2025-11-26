"use server"

import { fetchFromApi } from '@/lib/axios';
import { Api_path } from '@/constant/api-path';

export async function getTasksList() {
  try {
    const response = await fetchFromApi(Api_path.TASK.LIST);
    const body = response?.data ?? response;
    let rawList = [];
    if (Array.isArray(body)) rawList = body;
    else if (Array.isArray(body.data)) rawList = body.data;
    else if (Array.isArray(body?.data?.data)) rawList = body.data.data;
    else rawList = [];

    const data = Array.isArray(rawList)
      ? rawList.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          start_date_time: item.start_date_time || item.start_date || null,
          end_date_time: item.end_date_time || item.end_date || null,
          estimated_time: item.estimated_time || item.estimated_duration || null,
          assigned_employees: Array.isArray(item.assigned_employees) ? item.assigned_employees : (item.assigned_employees_ids || []),
          task_status: item.task_status ?? item.status ?? null,
          raw: item,
        }))
      : [];

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTask(id) {
  try {
    const response = await fetchFromApi(Api_path.TASK.DELETE(id), { method: 'DELETE' });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error('Error deleting task:', error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }

}

export async function createTask(payload) {
  try {
    const response = await fetchFromApi(Api_path.TASK.CREATE, { method: 'POST', body: payload });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error('Error creating task:', error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }
}

export async function updateTask(id, payload) {
  try {
    // Transform payload to match backend expectations
    const transformedPayload = {
      title: payload.title,
      description: payload.description,
      start_date_time: payload.start_date_time,
      end_date_time: payload.end_date_time,
      estimated_time: payload.estimated_time,
      assigned_employees_ids: Array.isArray(payload.assigned_employees) ? payload.assigned_employees : [],
      task_status: payload.task_status,
    };
    
    console.log('updateTask transformed payload:', JSON.stringify(transformedPayload, null, 2));
    const response = await fetchFromApi(Api_path.TASK.UPDATE(id), { method: 'PATCH', body: transformedPayload });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error('Error updating task:', error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }
}

export async function getTaskById(id) {
  try {
    const response = await fetchFromApi(Api_path.TASK.GET_ONE(id));
    const body = response?.data ?? response;
    
    // Handle nested data structure: data.data.data
    let item = body?.data?.data || body?.data || body;
    
    // Extract assigned employee IDs from the employee objects
    let assignedEmployeeIds = [];
    if (Array.isArray(item.assigned_employees)) {
      assignedEmployeeIds = item.assigned_employees.map((emp) => emp.id || emp);
    }
    
    // Extract task_status id (it's an object with id, name, description)
    let taskStatusId = 1;
    if (item.task_status) {
      if (typeof item.task_status === 'object' && item.task_status.id) {
        taskStatusId = item.task_status.id;
      } else if (typeof item.task_status === 'number') {
        taskStatusId = item.task_status;
      }
    }
    
    // Normalize the task data to match the format used in the edit form
    const normalizedData = {
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      start_date_time: item.start_date_time || item.start_date || null,
      end_date_time: item.end_date_time || item.end_date || null,
      estimated_time: item.estimated_time || item.estimated_duration || '',
      assigned_employees: assignedEmployeeIds,
      task_status: taskStatusId,
      raw: item,
    };
    
    return { success: true, data: normalizedData };
  } catch (error) {
    console.error('Error fetching task:', error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }
}
