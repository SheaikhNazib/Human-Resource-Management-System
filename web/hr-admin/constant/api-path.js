export const Api_path = {
    EMPLOYEE : {
       LIST: '/employees',
       CREATE: '/employees',
       UPDATE: (id) => `/employees/${id}`,
       DELETE: (id) => `/employees/${id}`,
       GET_ONE: (id) => `/employees/${id}`,
    }
}