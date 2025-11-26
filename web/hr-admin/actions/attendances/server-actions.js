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

// Get employees with their attendance for today
export async function getEmployeesWithTodayAttendance() {
  try {
    // Get current date
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDate = now.toISOString().split('T')[0];

    // Fetch employees and today's attendance in parallel
    const [employeesResponse, attendanceResponse] = await Promise.all([
      fetchFromApi(Api_path.EMPLOYEE.LIST),
      fetchFromApi(`${Api_path.ATTENDANCE.LIST}?date=${currentDate}`)
    ]);

    // Parse employees
    const employeeBody = employeesResponse?.data ?? employeesResponse;
    let employeesList = [];
    if (Array.isArray(employeeBody)) {
      employeesList = employeeBody;
    } else if (Array.isArray(employeeBody.data)) {
      employeesList = employeeBody.data;
    } else if (Array.isArray(employeeBody?.data?.data)) {
      employeesList = employeeBody.data.data;
    }

    // Parse attendance records
    let attendanceRecords = [];
    try {
      const attendanceBody = attendanceResponse?.data ?? attendanceResponse;
      if (Array.isArray(attendanceBody)) {
        attendanceRecords = attendanceBody;
      } else if (Array.isArray(attendanceBody.data)) {
        attendanceRecords = attendanceBody.data;
      } else if (Array.isArray(attendanceBody?.data?.data)) {
        attendanceRecords = attendanceBody.data.data;
      }
    } catch (err) {
      console.log('No attendance records found for today:', err.message);
    }

    // Create a map of attendance records by employee ID
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      const empId = record.employee?.id || record.employee;
      if (empId) {
        attendanceMap.set(empId, {
          checkIn: record.check_in || record.checkIn,
          checkOut: record.check_out || record.checkOut,
          remarks: record.remarks || record.note || "",
          attendanceId: record.id
        });
      }
    });

    // Helper to format time from various formats
    const formatTime = (timeStr) => {
      if (!timeStr) return currentTime;
      // If time includes date (ISO format), extract time part
      if (timeStr.includes('T')) {
        const date = new Date(timeStr);
        return date.toTimeString().slice(0, 5);
      }
      // If time is in HH:MM:SS format, take first 5 chars
      if (timeStr.length >= 5) {
        return timeStr.slice(0, 5);
      }
      return timeStr;
    };

    // Merge employees with their attendance
    const data = employeesList.map(emp => {
      const existingAttendance = attendanceMap.get(emp.id);
      
      return {
        id: emp.id,
        firstName: emp.first_name || emp.firstName || '',
        lastName: emp.last_name || emp.lastName || '',
        name: `${emp.first_name || emp.firstName || ''} ${emp.last_name || emp.lastName || ''}`.trim() || emp.name || `Employee ${emp.id}`,
        email: emp.email || emp.work_email || emp.personal_email || '',
        jobTitle: emp.emp_job_title?.name || emp.job_title || emp.jobTitle || '',
        department: emp.emp_department?.name || (typeof emp.department === 'string' ? emp.department : emp.department?.name) || emp.department_name || '',
        checkInTime: existingAttendance ? formatTime(existingAttendance.checkIn) : currentTime,
        checkOutTime: existingAttendance ? formatTime(existingAttendance.checkOut) : currentTime,
        remarks: existingAttendance ? (existingAttendance.remarks || '') : '',
        date: currentDate,
        attendanceId: existingAttendance?.attendanceId || null
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching employees with attendance:", error);
    return { success: false, error: error.message };
  }
}

// Bulk create or update attendance records
export async function bulkSaveAttendance(attendanceRecords) {
  try {
    const formatTime = (time) => {
      if (!time) return null;
      // Add seconds if not present
      if (time.length === 5) return `${time}:00`;
      return time;
    };

    const results = await Promise.all(
      attendanceRecords.map(async (record) => {
        const payload = {
          date: record.date,
          checkIn: formatTime(record.checkInTime),
          checkOut: formatTime(record.checkOutTime),
          remarks: record.remarks || "",
          onsite_or_remote: true,
          check_in_ip: "",
          check_out_ip: "",
          employee: record.employeeId,
        };

        try {
          let response;
          
          // If attendance record exists, update it; otherwise create new
          if (record.attendanceId) {
            response = await fetchFromApi(Api_path.ATTENDANCE.UPDATE(record.attendanceId), {
              method: "PATCH",
              body: payload,
            });
          } else {
            response = await fetchFromApi(Api_path.ATTENDANCE.CREATE, {
              method: "POST",
              body: payload,
            });
          }

          const responseData = response?.data?.data ?? response?.data ?? response;
          
          if (responseData?.statusCode >= 400) {
            throw new Error(responseData?.message || 'Failed to save attendance');
          }

          return { success: true, employeeId: record.employeeId };
        } catch (err) {
          console.error(`Error saving attendance for employee ${record.employeeId}:`, err);
          return { success: false, employeeId: record.employeeId, error: err.message };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return { 
      success: failCount === 0, 
      successCount, 
      failCount,
      results 
    };
  } catch (error) {
    console.error("Error in bulk save attendance:", error);
    return { success: false, error: error.message };
  }
}
