export const Api_path = {
    EMPLOYEE : {
       LIST: '/api/v1/employees',
       CREATE: '/api/v1/employees',
       UPDATE: (id) => `/api/v1/employees/${id}`,
       DELETE: (id) => `/api/v1/employees/${id}`,
       GET_ONE: (id) => `/api/v1/employees/${id}`,
    }
}