"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

export async function getAttendancesList() {
  try {
    // Fetch attendances and employees in parallel
    const [attendanceResponse, employeesResponse] = await Promise.all([
      fetchFromApi(Api_path.ATTENDANCE.LIST),
      fetchFromApi(Api_path.EMPLOYEE.LIST)
    ]);

    const body = attendanceResponse?.data ?? attendanceResponse;
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

    // Get employees data
    const empBody = employeesResponse?.data ?? employeesResponse;
    let employeesList = [];
    if (Array.isArray(empBody)) {
      employeesList = empBody;
    } else if (Array.isArray(empBody.data)) {
      employeesList = empBody.data;
    } else if (Array.isArray(empBody?.data?.data)) {
      employeesList = empBody.data.data;
    } else {
      employeesList = [];
    }

    // Create employee lookup map with both number and string keys
    const employeeMap = new Map();
    employeesList.forEach(emp => {
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.name || `Employee ${emp.id}`;
      // Store with both number and string keys to handle any type mismatch
      employeeMap.set(emp.id, fullName);
      employeeMap.set(String(emp.id), fullName);
      employeeMap.set(Number(emp.id), fullName);
    });

    const data = Array.isArray(rawList)
      ? rawList.map((item) => {
          // Extract employee ID from all possible fields
          let employeeId = item.employee_id || item.employee?.id || item.employee || null;
          
          // Convert to number if it's a string
          if (typeof employeeId === 'string') {
            employeeId = parseInt(employeeId, 10);
          }

          const employeeName = employeeId ? (employeeMap.get(employeeId) || `Employee ${employeeId}`) : 'Unknown Employee';

          return {
            id: item.id,
            date: item.date,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            remarks: item.remarks || "",
            onsiteOrRemote: item.onsite_or_remote,
            checkInIp: item.check_in_ip || "",
            checkOutIp: item.check_out_ip || "",
            employee: employeeId,
            employeeName: employeeName,
          };
        })
      : [];

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return { success: false, error: error.message };
  }
}

// Create a new attendance
export async function createAttendance(attendanceData) {
  try {
    // Format time values to HH:MM:SS if needed
    const formatTime = (time) => {
      if (!time) return null;
      // If time is already in HH:MM:SS format, return as is
      if (time.length === 8 && time.split(':').length === 3) return time;
      // If time is in HH:MM format, add :00 for seconds
      if (time.length === 5 && time.split(':').length === 2) return `${time}:00`;
      return time;
    };

    const payload = {
      date: attendanceData.date,
      checkIn: formatTime(attendanceData.checkIn),
      checkOut: attendanceData.checkOut ? formatTime(attendanceData.checkOut) : null,
      remarks: attendanceData.remarks || "",
      onsite_or_remote: attendanceData.onsite_or_remote ?? true,
      check_in_ip: attendanceData.check_in_ip || "",
      check_out_ip: attendanceData.check_out_ip || "",
      employee: attendanceData.employee,
    };

    console.log("Attendance payload being sent:", JSON.stringify(payload, null, 2));
    
    const response = await fetchFromApi(Api_path.ATTENDANCE.CREATE, {
      method: "POST",
      body: payload,
    });

    console.log("Attendance API response:", JSON.stringify(response, null, 2));
    
    const responseData = response?.data?.data ?? response?.data ?? response;
    
    if (responseData?.statusCode >= 400) {
      return { success: false, error: responseData?.message || 'Failed to create attendance' };
    }
    if (!responseData?.id) {
      return { success: false, error: 'Attendance created but no ID returned' };
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Create attendance error:", error);
    return { success: false, error: error.message || 'Failed to create attendance' };
  }
}

// Get a single attendance by ID
export async function getAttendanceById(id) {
  try {
    // Fetch attendance and employees in parallel
    const [attendanceResponse, employeesResponse] = await Promise.all([
      fetchFromApi(Api_path.ATTENDANCE.GET_ONE(id)),
      fetchFromApi(Api_path.EMPLOYEE.LIST)
    ]);

    const body = attendanceResponse?.data ?? attendanceResponse;
    let attendanceData = body?.data ?? body;
    
    // Handle nested data structure
    if (attendanceData?.data) {
      attendanceData = attendanceData.data;
    }

    if (!attendanceData || !attendanceData.id) {
      return { success: false, error: "Attendance not found" };
    }

    // Get employees data
    const empBody = employeesResponse?.data ?? employeesResponse;
    let employeesList = [];
    if (Array.isArray(empBody)) {
      employeesList = empBody;
    } else if (Array.isArray(empBody.data)) {
      employeesList = empBody.data;
    } else if (Array.isArray(empBody?.data?.data)) {
      employeesList = empBody.data.data;
    }

    // Find the employee for this attendance
    const employeeId = attendanceData.employee_id || attendanceData.employee?.id || attendanceData.employee;
    const employee = employeesList.find(emp => emp.id === employeeId);
    
    if (employee) {
      attendanceData.employeeName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.name || `Employee ${employeeId}`;
    } else {
      attendanceData.employeeName = `Employee ${employeeId}`;
    }

    return { success: true, data: attendanceData };
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: error.message };
  }
}

// Update an attendance by ID
export async function updateAttendance(id, attendanceData) {
  try {
    // Format time values to HH:MM:SS if needed
    const formatTime = (time) => {
      if (!time) return null;
      // If time is already in HH:MM:SS format, return as is
      if (time.length === 8 && time.split(':').length === 3) return time;
      // If time is in HH:MM format, add :00 for seconds
      if (time.length === 5 && time.split(':').length === 2) return `${time}:00`;
      return time;
    };

    const payload = {
      date: attendanceData.date,
      checkIn: formatTime(attendanceData.checkIn),
      checkOut: attendanceData.checkOut ? formatTime(attendanceData.checkOut) : null,
      remarks: attendanceData.remarks || "",
      onsite_or_remote: attendanceData.onsite_or_remote ?? true,
      check_in_ip: attendanceData.check_in_ip || "",
      check_out_ip: attendanceData.check_out_ip || "",
      employee: attendanceData.employee,
    };

    console.log("Update attendance payload:", JSON.stringify(payload, null, 2));
    
    const response = await fetchFromApi(Api_path.ATTENDANCE.UPDATE(id), {
      method: "PATCH",
      body: payload,
    });
    
    const responseData = response?.data?.data ?? response?.data ?? response;
    
    if (responseData?.statusCode >= 400) {
      return { success: false, error: responseData?.message || 'Failed to update attendance' };
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Update attendance error:", error);
    return { success: false, error: error.message || 'Failed to update attendance' };
  }
}

// Delete an attendance by ID
export async function deleteAttendance(id) {
  try {
    const response = await fetchFromApi(Api_path.ATTENDANCE.DELETE(id), {
      method: "DELETE",
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error deleting attendance:", error.message);
    return { success: false, error: error.message };
  }
}
