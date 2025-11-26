import { useState, useEffect, useCallback } from 'react';
import { 
  getTaskWorkItemsList, 
  createTaskWorkItem, 
  updateTaskWorkItem, 
  deleteTaskWorkItem,
  getTaskWorkItemById 
} from './server-actions';

export const useTaskWorkItems = (taskId) => {
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkItems = useCallback(async () => {
    if (!taskId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getTaskWorkItemsList(taskId);
      if (response.success) {
        setWorkItems(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  const createWorkItem = async (payload) => {
    try {
      const response = await createTaskWorkItem(taskId, payload);
      if (response.success) {
        await fetchWorkItems();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateWorkItem = async (itemId, payload) => {
    try {
      const response = await updateTaskWorkItem(taskId, itemId, payload);
      if (response.success) {
        await fetchWorkItems();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteWorkItem = async (itemId) => {
    try {
      const response = await deleteTaskWorkItem(taskId, itemId);
      if (response.success) {
        setWorkItems((prev) => prev.filter((item) => item.id !== itemId));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { 
    workItems, 
    loading, 
    error, 
    refetch: fetchWorkItems,
    createWorkItem,
    updateWorkItem,
    deleteWorkItem
  };
};

export async function createTaskWorkItemClient(taskId, payload) {
  return await createTaskWorkItem(taskId, payload);
}

export async function updateTaskWorkItemClient(taskId, itemId, payload) {
  return await updateTaskWorkItem(taskId, itemId, payload);
}

export async function deleteTaskWorkItemClient(taskId, itemId) {
  return await deleteTaskWorkItem(taskId, itemId);
}

export async function getTaskWorkItemByIdClient(taskId, itemId) {
  return await getTaskWorkItemById(taskId, itemId);
}

export async function getTaskWorkItemsListClient(taskId) {
  return await getTaskWorkItemsList(taskId);
}
