"use server"

import { fetchFromApi } from '@/lib/axios';
import { Api_path } from '@/constant/api-path';

export async function getTaskStatusesList() {
  try {
    const response = await fetchFromApi(Api_path.TASK_STATUS.LIST);
    const body = response?.data ?? response;
    let rawList = [];
    if (Array.isArray(body)) rawList = body;
    else if (Array.isArray(body.data)) rawList = body.data;
    else if (Array.isArray(body?.data?.data)) rawList = body.data.data;
    else rawList = [];

    const data = Array.isArray(rawList)
      ? rawList.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          raw: item,
        }))
      : [];

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching task statuses:', error);
    return { success: false, error: error.message };
  }
}

export async function getTaskStatusById(id) {
  try {
    const response = await fetchFromApi(Api_path.TASK_STATUS.GET_ONE(id));
    const body = response?.data ?? response;
    let item = body?.data?.data || body?.data || body;
    
    const normalizedData = {
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      raw: item,
    };
    
    return { success: true, data: normalizedData };
  } catch (error) {
    console.error('Error fetching task status:', error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }
}
