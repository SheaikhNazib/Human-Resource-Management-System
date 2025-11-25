export const Api_path = {
    EMPLOYEE: {
        LIST: '/api/v1/employees',
        CREATE: '/api/v1/employees',
        UPDATE: (id) => `/api/v1/employees/${id}`,
        DELETE: (id) => `/api/v1/employees/${id}`,
        GET_ONE: (id) => `/api/v1/employees/${id}`,
    },
    TASK: {
        LIST: '/api/v1/tasks',
        CREATE: '/api/v1/tasks',
        UPDATE: (id) => `/api/v1/tasks/${id}`,
        DELETE: (id) => `/api/v1/tasks/${id}`,
        GET_ONE: (id) => `/api/v1/tasks/${id}`,
    },
    TASK_STATUS: {
        LIST: '/api/v1/task-statuses',
        GET_ONE: (id) => `/api/v1/task-statuses/${id}`,
    },
    TASK_WORK_ITEM: {
        LIST: (taskId) => `/api/v1/task-work-items?task=${taskId}`,
        LIST_ALL: '/api/v1/task-work-items',
        CREATE: '/api/v1/task-work-items',
        UPDATE: (itemId) => `/api/v1/task-work-items/${itemId}`,
        DELETE: (itemId) => `/api/v1/task-work-items/${itemId}`,
        GET_ONE: (itemId) => `/api/v1/task-work-items/${itemId}`,
    }
}