"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

export async function getEmployeesList() {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE.LIST, {
      params: { page: 1, limit: 100 }
    });
    console.log(
      "Raw employees response from backend:",
      JSON.stringify(response)
    );

    const body = response?.data ?? response;
    let rawList = [];
    let metaData = null;

    if (Array.isArray(body)) {
      rawList = body;
    } else if (Array.isArray(body.data)) {
      rawList = body.data;
      metaData = body.metaData;
    } else if (Array.isArray(body?.data?.data)) {
      rawList = body.data.data;
      metaData = body.data.metaData || body.metaData;
    } else {
      rawList = [];
    }

    const data = Array.isArray(rawList)
      ? rawList.map((item) => ({
          id: item.id,
          firstName: item.first_name,
          lastName: item.last_name,
          name: item.name,
          displayName: `${
            item.name ||
            `${item.first_name || ""} ${item.last_name || ""}`.trim()
          } (ID: ${item.id})`,
          email: item.work_email || item.personal_email,
          jobTitle: item.emp_job_title?.name || "",
          department: item.emp_department?.name || "",
          status: item.current_or_former_emp === false ? "Former" : "Active",
          avatar: item.avatar || null,
        }))
      : [];

    return { success: true, data, metaData };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { success: false, error: error.message };
  }
}

// Get employee statistics
export async function getEmployeeStats() {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE.LIST);
    const body = response?.data ?? response;

    let metaData = null;
    if (body.metaData) {
      metaData = body.metaData;
    } else if (body?.data?.metaData) {
      metaData = body.data.metaData;
    }

    const totalEmployees = metaData?.allTotal || 0;

    return {
      success: true,
      data: {
        totalEmployees,
        metaData,
      },
    };
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    return { success: false, error: error.message };
  }
}

// Create a new employee
export async function createEmployee(employeeData) {
  try {
    // Ensure name is computed from first_name + last_name if not provided
    const computedName = employeeData.name || 
      `${employeeData.first_name || ""} ${employeeData.last_name || ""}`.trim() || 
      "Employee";
    
    const payload = { ...employeeData, name: computedName };
    
    console.log("[DEBUG] Sending payload to API:", JSON.stringify(payload));
    
    const response = await fetchFromApi(Api_path.EMPLOYEE.CREATE, {
      method: "POST",
      body: payload,
    });

    const responseData = response?.data?.data ?? response?.data ?? response;

    if (responseData?.statusCode >= 400) {
      return {
        success: false,
        error: responseData?.message || "Failed to create employee",
      };
    }
    if (!responseData?.id) {
      return { success: false, error: "Employee created but no ID returned" };
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error("[DEBUG] Create employee error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to create employee",
    };
  }
}

// Get a single employee by ID
export async function getEmployeeById(id) {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE.GET_ONE(id));

    const body = response?.data ?? response;
    const employeeData = body?.data ?? body;

    if (!employeeData || !employeeData.id) {
      return { success: false, error: "Employee not found" };
    }

    return { success: true, data: employeeData };
  } catch (error) {
    console.error("Error fetching employee:", error);
    return { success: false, error: error.message };
  }
}

// Update an employee by ID
export async function updateEmployee(id, employeeData) {
  try {
    const payload = { ...employeeData, name: employeeData.name || "" };
    const response = await fetchFromApi(Api_path.EMPLOYEE.UPDATE(id), {
      method: "PATCH",
      body: payload,
    });

    const responseData = response?.data?.data ?? response?.data ?? response;

    if (responseData?.statusCode >= 400) {
      return {
        success: false,
        error: responseData?.message || "Failed to update employee",
      };
    }

    return { success: true, data: responseData };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to update employee",
    };
  }
}

// Delete an employee by ID
export async function deleteEmployee(id) {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE.DELETE(id), {
      method: "DELETE",
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error deleting employee:", error.message);
    return { success: false, error: error.message };
  }
}
