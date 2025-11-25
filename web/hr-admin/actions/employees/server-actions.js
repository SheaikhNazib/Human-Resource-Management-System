"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

export async function getEmployeesList() {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE.LIST);
    console.log(
      "Raw employees response from backend:",
      JSON.stringify(response)
    );

    const body = response?.data ?? response;
    let rawList = [];
    if (Array.isArray(body)) {
      rawList = body;
    } else if (Array.isArray(body.data)) {
      rawList = body.data;
    } else if (Array.isArray(body?.data?.data)) {
      rawList = body.data.data;
    } else {
      rawList = [];
    }
    const data = Array.isArray(rawList)
      ? rawList.map((item) => ({
          id: item.id,
          firstName: item.first_name,
          lastName: item.last_name,
          name: item.name,
          email: item.work_email || item.personal_email,
          jobTitle: item.emp_job_title?.name || "",
          department: item.emp_department?.name || "",
          status: item.current_or_former_emp === false ? "Former" : "Active",
          avatar: item.avatar || null,
        }))
      : [];

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { success: false, error: error.message };
  }
}

// Create a new employee
export async function createEmployee(employeeData) {
  try {
    console.log("Creating employee with data:", JSON.stringify(employeeData, null, 2));
    const response = await fetchFromApi(Api_path.EMPLOYEE.CREATE, {
      method: "POST",
      body: employeeData,
    });
    
    console.log("Raw API response:", JSON.stringify(response, null, 2));
    
    let responseData = response?.data;
    if (responseData?.data) {
      responseData = responseData.data;
    }
    
    console.log("Extracted responseData:", JSON.stringify(responseData, null, 2));
    
    if (responseData?.statusCode && responseData.statusCode >= 400) {
      const errorMsg = responseData.message || responseData.error || 'Failed to create employee';
      console.error("API returned error status:", responseData.statusCode, errorMsg);
      return { success: false, error: errorMsg };
    }
    if (!responseData?.id) {
      const errorMsg = responseData?.message || responseData?.error || 'Employee created but no ID returned';
      console.error("No ID in response:", errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log("Employee created successfully with ID:", responseData.id);
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error creating employee - Full error:", error);
    console.error("Error message:", error.message);
    console.error("Error response data:", error.response?.data);
    console.error("Error response status:", error.response?.status);
    
    let errorMsg = 'Failed to create employee';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      errorMsg = errorData.message || errorData.error || errorData.statusCode || JSON.stringify(errorData);
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    return { success: false, error: errorMsg };
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
