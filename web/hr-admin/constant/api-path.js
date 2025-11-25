export const Api_path = {
  EMPLOYEE: {
    LIST: "/api/v1/employees",
    CREATE: "/api/v1/employees",
    UPDATE: (id) => `/api/v1/employees/${id}`,
    DELETE: (id) => `/api/v1/employees/${id}`,
    GET_ONE: (id) => `/api/v1/employees/${id}`,
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
