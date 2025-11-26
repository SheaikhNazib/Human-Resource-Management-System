export const Api_path = {
  EMPLOYEE: {
    LIST: "/api/v1/employees",
    CREATE: "/api/v1/employees",
    UPDATE: (id) => `/api/v1/employees/${id}`,
    DELETE: (id) => `/api/v1/employees/${id}`,
    GET_ONE: (id) => `/api/v1/employees/${id}`,
  },
  DEPARTMENT: {
    LIST: "/api/v1/emp-departments",
    GET_ONE: (id) => `/api/v1/emp-departments/${id}`,
    DELETE: (id) => `/api/v1/emp-departments/${id}`,
    CREATE: "/api/v1/emp-departments",
    UPDATE: (id) => `/api/v1/emp-departments/${id}`,
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

  EMPLOYEE_LEAVE: {
    LIST: "/api/v1/emp-leaves",
    CREATE: "/api/v1/emp-leaves",
    UPDATE: (id) => `/api/v1/emp-leaves/${id}`,
    DELETE: (id) => `/api/v1/emp-leaves/${id}`,
    GET_ONE: (id) => `/api/v1/emp-leaves/${id}`,
  },
  EMPLOYEE_PERFORMANCE: {
    LIST: "/api/v1/emp-performances",
    CREATE: "/api/v1/emp-performances",
    UPDATE: (id) => `/api/v1/emp-performances/${id}`,
    DELETE: (id) => `/api/v1/emp-performances/${id}`,
    GET_ONE: (id) => `/api/v1/emp-performances/${id}`,
  },
  DEPARTMENT: {
    LIST: "/api/v1/emp-departments",
    GET_ONE: (id) => `/api/v1/emp-departments/${id}`,
    DELETE: (id) => `/api/v1/emp-departments/${id}`,
    CREATE: "/api/v1/emp-departments",
    UPDATE: (id) => `/api/v1/emp-departments/${id}`,
  }

  
};

// Note: `Department_path` contains all department endpoint helpers.
