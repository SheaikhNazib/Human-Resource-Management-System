export const Api_path = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    LOGOUT: "/api/v1/auth/logout",
    ME: "/api/v1/auth/me",
    REFRESH: "/api/v1/auth/refresh",
  },
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

  JOB_TITLE: {
    LIST: "/api/v1/emp-job-titles",
    GET_ONE: (id) => `/api/v1/emp-job-titles/${id}`,
    CREATE: "/api/v1/emp-job-titles",
    UPDATE: (id) => `/api/v1/emp-job-titles/${id}`,
    DELETE: (id) => `/api/v1/emp-job-titles/${id}`,
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
  EMPLOYEE_SALARY_COMPENSATIONS: {
    LIST: "/api/v1/emp-salary-compensations",
    CREATE: "/api/v1/emp-salary-compensations",
    UPDATE: (id) => `/api/v1/emp-salary-compensations/${id}`,
    DELETE: (id) => `/api/v1/emp-salary-compensations/${id}`,
    GET_ONE: (id) => `/api/v1/emp-salary-compensations/${id}`,
  },
  DEPARTMENT: {
    LIST: "/api/v1/emp-departments",
    GET_ONE: (id) => `/api/v1/emp-departments/${id}`,
    DELETE: (id) => `/api/v1/emp-departments/${id}`,
    CREATE: "/api/v1/emp-departments",
    UPDATE: (id) => `/api/v1/emp-departments/${id}`,
  },
  USERS: {
    LIST: "/api/v1/users",
    CREATE: "/api/v1/users",
    UPDATE: (id) => `/api/v1/users/${id}`,
    DELETE: (id) => `/api/v1/users/${id}`,
    GET_ONE: (id) => `/api/v1/users/${id}`,
  }
};
