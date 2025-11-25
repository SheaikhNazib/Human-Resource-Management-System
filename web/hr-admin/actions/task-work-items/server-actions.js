"use server"

import { fetchFromApi } from '@/lib/axios';
import { Api_path } from '@/constant/api-path';

export async function getTaskWorkItemsList(taskId) {
  try {
    if (!taskId) {
      console.log('Task Work Items - No taskId provided');
      return { success: true, data: [] };
    }

    // Try with query parameter first
    const response = await fetchFromApi(Api_path.TASK_WORK_ITEM.LIST(taskId));
    const body = response?.data ?? response;
    let rawList = [];
    if (Array.isArray(body)) rawList = body;
    else if (Array.isArray(body.data)) rawList = body.data;
    else if (Array.isArray(body?.data?.data)) rawList = body.data.data;
    else rawList = [];

    console.log('Task Work Items - Raw list:', rawList);
    console.log('Task Work Items - TaskId:', taskId);

    // Map the data
    const data = Array.isArray(rawList)
      ? rawList.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          start_date_time: item.start_date_time,
          end_date_time: item.end_date_time,
          estimated_time: item.estimated_time,
          task_status: item.task_status,
          task: item.task,
          employee: item.employee,
          raw: item,
        }))
      : [];

    console.log('Task Work Items - Mapped data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching task work items:', error);
    return { success: false, error: error.message };
  }
}

export async function createTaskWorkItem(taskId, payload) {
  try {
    // Transform payload to match backend expectations
    const transformedPayload = {
      title: payload.title,
      description: payload.description || '',
      start_date_time: payload.start_date_time || new Date().toISOString().split('T')[0],
      end_date_time: payload.end_date_time || new Date().toISOString().split('T')[0],
      estimated_time: payload.estimated_time || '1h',
      task: parseInt(taskId, 10),
      employee: parseInt(payload.employee, 10) || 1, // Default employee, should be passed from UI
      task_status: parseInt(payload.task_status, 10) || 1,
    };
    
    const response = await fetchFromApi(Api_path.TASK_WORK_ITEM.CREATE, { 
      method: 'POST', 
      body: transformedPayload 
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error('Error creating task work item:', error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }
}

export async function updateTaskWorkItem(taskId, itemId, payload) {
  try {
    // Transform payload to match backend expectations
    const transformedPayload = {
      title: payload.title,
      description: payload.description || '',
      start_date_time: payload.start_date_time,
      end_date_time: payload.end_date_time,
      estimated_time: payload.estimated_time,
      task: parseInt(taskId, 10),
      employee: parseInt(payload.employee, 10),
      task_status: parseInt(payload.task_status, 10),
    };
    
    const response = await fetchFromApi(Api_path.TASK_WORK_ITEM.UPDATE(itemId), { 
      method: 'PATCH', 
      body: transformedPayload 
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error('Error updating task work item:', error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }
}

export async function deleteTaskWorkItem(taskId, itemId) {
  try {
    const response = await fetchFromApi(Api_path.TASK_WORK_ITEM.DELETE(itemId), { 
      method: 'DELETE' 
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error('Error deleting task work item:', error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }
}

export async function getTaskWorkItemById(taskId, itemId) {
  try {
    const response = await fetchFromApi(Api_path.TASK_WORK_ITEM.GET_ONE(itemId));
    const body = response?.data ?? response;
    let item = body?.data?.data || body?.data || body;
    
    const normalizedData = {
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      start_date_time: item.start_date_time,
      end_date_time: item.end_date_time,
      estimated_time: item.estimated_time,
      task_status: item.task_status,
      task: item.task,
      employee: item.employee,
      raw: item,
    };
    
    return { success: true, data: normalizedData };
  } catch (error) {
    console.error('Error fetching task work item:', error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }
}
