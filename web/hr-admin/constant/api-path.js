export const Api_path = {
  EMPLOYEE: {
    LIST: "/api/v1/employees",
    CREATE: "/api/v1/employees",
    UPDATE: (id) => `/api/v1/employees/${id}`,
    DELETE: (id) => `/api/v1/employees/${id}`,
    GET_ONE: (id) => `/api/v1/employees/${id}`,
  },

  ATTENDANCE: {
    LIST: "/api/v1/emp-attendances",
    CREATE: "/api/v1/emp-attendances",
    UPDATE: (id) => `/api/v1/emp-attendances/${id}`,
    DELETE: (id) => `/api/v1/emp-attendances/${id}`,
    GET_ONE: (id) => `/api/v1/emp-attendances/${id}`,
  },

  TASK: {
    LIST: "/api/v1/tasks",
    CREATE: "/api/v1/tasks",
    UPDATE: (id) => `/api/v1/tasks/${id}`,
    DELETE: (id) => `/api/v1/tasks/${id}`,
    GET_ONE: (id) => `/api/v1/tasks/${id}`,
  },
  TASK_STATUS: {
    LIST: "/api/v1/task-statuses",
    GET_ONE: (id) => `/api/v1/task-statuses/${id}`,
  },
  TASK_WORK_ITEM: {
    LIST: (taskId) => `/api/v1/task-work-items?task=${taskId}`,
    LIST_ALL: "/api/v1/task-work-items",
    CREATE: "/api/v1/task-work-items",
    UPDATE: (itemId) => `/api/v1/task-work-items/${itemId}`,
    DELETE: (itemId) => `/api/v1/task-work-items/${itemId}`,
    GET_ONE: (itemId) => `/api/v1/task-work-items/${itemId}`,
  },
};
export const Department_path = {
  LIST: "/api/v1/emp-departments",
  // Additional helpers for convenience
  GET_ONE: (id) => `/api/v1/emp-departments/${id}`,
  DELETE: (id) => `/api/v1/emp-departments/${id}`,
  CREATE: "/api/v1/emp-departments",
  UPDATE: (id) => `/api/v1/emp-departments/${id}`,
};

// Note: `Department_path` contains all department endpoint helpers.
