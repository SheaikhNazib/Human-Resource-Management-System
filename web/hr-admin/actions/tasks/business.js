import { useState, useEffect, useCallback } from 'react';
import { getTasksList, deleteTask as deleteTaskAction, createTask, updateTask, getTaskById } from './server-actions';

// Helper function to format date to YYYY-MM-DD
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0]; // ISO format: 2025-11-25T10:00:00
  }
  return dateStr; // Already YYYY-MM-DD format
};

// Transform raw task data to form-ready format
const transformTaskToFormValues = (taskData) => {
  return {
    title: taskData.title || "",
    description: taskData.description || "",
    start_date_time: formatDate(taskData.start_date_time) || '',
    end_date_time: formatDate(taskData.end_date_time) || '',
    estimated_time: taskData.estimated_time || '',
    assigned_employees: Array.isArray(taskData.assigned_employees) ? taskData.assigned_employees : [],
    task_status: taskData.task_status ?? 1,
  };
};

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTasksList();
      if (response.success) {
        setTasks(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const deleteTask = async (id) => {
    try {
      const response = await deleteTaskAction(id);
      if (response.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { tasks, loading, error, refetch: fetchTasks, deleteTask };
};

// Hook to fetch and transform a single task by ID
export const useTaskById = (id) => {
  const [task, setTask] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getTaskByIdClient(id);
        if (!mounted) return;
        
        if (res.success) {
          setTask(res.data);
          setInitialValues(transformTaskToFormValues(res.data));
        } else {
          setError(res.error || 'Failed to load task');
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  return { task, initialValues, loading, error };
};

// Wrapper over server-actions for create/update/getById
export async function createTaskClient(payload) {
  return await createTask(payload);
}

export async function updateTaskClient(id, payload) {
  return await updateTask(id, payload);
}

export async function getTaskByIdClient(id) {
  return await getTaskById(id);
}
