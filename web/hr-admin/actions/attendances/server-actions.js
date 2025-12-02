"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

export async function getAttendancesList() {
  try {
    // Fetch attendances and employees in parallel
    const [attendanceResponse, employeesResponse] = await Promise.all([
      fetchFromApi(Api_path.ATTENDANCE.LIST),
      fetchFromApi(Api_path.EMPLOYEE.LIST),
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
    employeesList.forEach((emp) => {
      const fullName =
        `${emp.first_name || ""} ${emp.last_name || ""}`.trim() ||
        emp.name ||
        `Employee ${emp.id}`;
      // Store with both number and string keys to handle any type mismatch
      employeeMap.set(emp.id, fullName);
      employeeMap.set(String(emp.id), fullName);
      employeeMap.set(Number(emp.id), fullName);
    });

    const data = Array.isArray(rawList)
      ? rawList.map((item) => {
          // Extract employee ID from all possible fields
          let employeeId =
            item.employee_id || item.employee?.id || item.employee || null;

          // Convert to number if it's a string
          if (typeof employeeId === "string") {
            employeeId = parseInt(employeeId, 10);
          }

          const employeeName = employeeId
            ? employeeMap.get(employeeId) || `Employee ${employeeId}`
            : "Unknown Employee";

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

// Get attendance statistics (total count)
export async function getAttendanceStats() {
  try {
    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;

    // Call the total-attendance-count endpoint with date parameter
    const response = await fetchFromApi(
      `${Api_path.ATTENDANCE.TOTAL_COUNT}?date=${currentDate}`
    );
    const body = response?.data ?? response;

    // Extract totalAttendance from the response
    const totalAttendances = body?.data?.totalAttendance ?? 0;

    return {
      success: true,
      data: { totalAttendances },
    };
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    return { success: false, error: error.message };
  }
}

// Get attendance overview (aggregated) for a date range (defaults last 7 days)
export async function getAttendanceOverview({ start, end } = {}) {
  try {
    const now = new Date();
    const endDate = end ? new Date(end) : now;
    const startDate = start
      ? new Date(start)
      : new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const startStr = fmt(startDate);
    const endStr = fmt(endDate);

    // Fetch attendance rows between start and end (use high limit to get all)
    const response = await fetchFromApi(
      `${Api_path.ATTENDANCE.LIST}?start=${startStr}&end=${endStr}&limit=1000`
    );
    const body = response?.data ?? response;
    const rows = Array.isArray(body)
      ? body
      : Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body?.data?.data)
      ? body.data.data
      : [];

    // Build labels array (inclusive)
    const labels = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      labels.push(fmt(new Date(d)));
    }

    // Simple on-time threshold (HH:MM:SS)
    const onTimeThreshold = "09:30:00";

    const onTime = labels.map(
      (lbl) =>
        rows.filter(
          (r) =>
            r.date === lbl &&
            r.checkIn &&
            r.checkIn <= onTimeThreshold &&
            (r.onsite_or_remote === true || r.onsite_or_remote === "office")
        ).length
    );

    const late = labels.map(
      (lbl) =>
        rows.filter(
          (r) => r.date === lbl && r.checkIn && r.checkIn > onTimeThreshold
        ).length
    );

    const remote = labels.map(
      (lbl) =>
        rows.filter(
          (r) =>
            r.date === lbl &&
            (r.onsite_or_remote === false || r.onsite_or_remote === "remote")
        ).length
    );

    return {
      success: true,
      data: { labels, datasets: { onTime, late, remote } },
    };
  } catch (error) {
    console.error("getAttendanceOverview error:", error);
    return {
      success: false,
      error: error.message,
      data: { labels: [], datasets: { onTime: [], late: [], remote: [] } },
    };
  }
}

// Get recent attendance rows for a specific date (defaults to today)
export async function getRecentAttendances({ date, limit = 100 } = {}) {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const dstr = date ? date : fmt(now);

    // Use the API endpoint with proper query parameters
    const response = await fetchFromApi(
      `${Api_path.ATTENDANCE.LIST}?date=${dstr}&page=1&limit=${limit}&sortBy=createdAt&sortOrder=desc`
    );

    const body = response?.data ?? response;

    // Handle the new response structure
    const rows = Array.isArray(body?.data)
      ? body.data
      : Array.isArray(body)
      ? body
      : [];

    return { success: true, data: rows };
  } catch (error) {
    console.error("getRecentAttendances error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// Create a new attendance
export async function createAttendance(attendanceData) {
  try {
    // Format time values to HH:MM:SS if needed
    const formatTime = (time) => {
      if (!time) return null;
      // If time is already in HH:MM:SS format, return as is
      if (time.length === 8 && time.split(":").length === 3) return time;
      // If time is in HH:MM format, add :00 for seconds
      if (time.length === 5 && time.split(":").length === 2)
        return `${time}:00`;
      return time;
    };

    const payload = {
      date: attendanceData.date,
      checkIn: formatTime(attendanceData.checkIn),
      checkOut: attendanceData.checkOut
        ? formatTime(attendanceData.checkOut)
        : null,
      remarks: attendanceData.remarks || "",
      onsite_or_remote: attendanceData.onsite_or_remote ?? true,
      check_in_ip: attendanceData.check_in_ip || "",
      check_out_ip: attendanceData.check_out_ip || "",
      employee: attendanceData.employee,
    };

    console.log(
      "Attendance payload being sent:",
      JSON.stringify(payload, null, 2)
    );

    const response = await fetchFromApi(Api_path.ATTENDANCE.CREATE, {
      method: "POST",
      body: payload,
    });

    console.log("Attendance API response:", JSON.stringify(response, null, 2));

    const responseData = response?.data?.data ?? response?.data ?? response;

    if (responseData?.statusCode >= 400) {
      return {
        success: false,
        error: responseData?.message || "Failed to create attendance",
      };
    }
    if (!responseData?.id) {
      return { success: false, error: "Attendance created but no ID returned" };
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error("Create attendance error:", error);
    return {
      success: false,
      error: error.message || "Failed to create attendance",
    };
  }
}

// Get a single attendance by ID
export async function getAttendanceById(id) {
  try {
    // Fetch attendance and employees in parallel
    const [attendanceResponse, employeesResponse] = await Promise.all([
      fetchFromApi(Api_path.ATTENDANCE.GET_ONE(id)),
      fetchFromApi(Api_path.EMPLOYEE.LIST),
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
    const employeeId =
      attendanceData.employee_id ||
      attendanceData.employee?.id ||
      attendanceData.employee;
    const employee = employeesList.find((emp) => emp.id === employeeId);

    if (employee) {
      attendanceData.employeeName =
        `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
        employee.name ||
        `Employee ${employeeId}`;
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
      if (time.length === 8 && time.split(":").length === 3) return time;
      // If time is in HH:MM format, add :00 for seconds
      if (time.length === 5 && time.split(":").length === 2)
        return `${time}:00`;
      return time;
    };

    const payload = {
      date: attendanceData.date,
      checkIn: formatTime(attendanceData.checkIn),
      checkOut: attendanceData.checkOut
        ? formatTime(attendanceData.checkOut)
        : null,
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
      return {
        success: false,
        error: responseData?.message || "Failed to update attendance",
      };
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error("Update attendance error:", error);
    return {
      success: false,
      error: error.message || "Failed to update attendance",
    };
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
    // Get current date in local timezone to avoid timezone issues
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    // Format date as YYYY-MM-DD in local timezone
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;

    console.log("Fetching attendance for date:", currentDate);

    // Fetch all employees using pagination (max limit is 100)
    let employeesList = [];
    let currentPage = 1;
    let totalPages = 1;

    // Fetch first page to get total pages
    const firstPageResponse = await fetchFromApi(
      `${Api_path.EMPLOYEE.LIST}?limit=100&page=1`
    );
    const firstPageBody = firstPageResponse?.data ?? firstPageResponse;

    if (firstPageBody.success && Array.isArray(firstPageBody.data)) {
      employeesList = firstPageBody.data;
      totalPages = firstPageBody.metaData?.totalPages || 1;
      console.log(
        `Fetched page 1/${totalPages}, employees: ${employeesList.length}`
      );

      // Fetch remaining pages if there are more
      if (totalPages > 1) {
        const remainingPages = [];
        for (let page = 2; page <= totalPages; page++) {
          remainingPages.push(
            fetchFromApi(`${Api_path.EMPLOYEE.LIST}?limit=100&page=${page}`)
          );
        }

        const remainingResponses = await Promise.all(remainingPages);
        remainingResponses.forEach((response, index) => {
          const body = response?.data ?? response;
          if (body.success && Array.isArray(body.data)) {
            employeesList = employeesList.concat(body.data);
            console.log(
              `Fetched page ${index + 2}/${totalPages}, total employees: ${
                employeesList.length
              }`
            );
          }
        });
      }
    }

    // Fetch ALL attendance records
    const attendanceResponse = await fetchFromApi(Api_path.ATTENDANCE.LIST);

    console.log("Total employees fetched:", employeesList.length);

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
      console.log("No attendance records found:", err.message);
    }

    console.log("Total attendance records fetched:", attendanceRecords.length);

    // Helper to normalize date from various formats to YYYY-MM-DD
    const normalizeDate = (dateStr) => {
      if (!dateStr) return null;
      try {
        // If already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

        // Parse and format to YYYY-MM-DD
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;

        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      } catch (e) {
        return null;
      }
    };

    // Filter records to only today's date
    const todayRecords = attendanceRecords.filter((record) => {
      const recordDate = normalizeDate(record.date);
      const isToday = recordDate === currentDate;
      if (recordDate) {
        console.log(
          `Record date: ${recordDate}, Current date: ${currentDate}, Match: ${isToday}`
        );
      }
      return isToday;
    });

    console.log("Attendance records for today:", todayRecords.length);

    // Create a map of attendance records by employee ID (only for today)
    const attendanceMap = new Map();
    todayRecords.forEach((record) => {
      const empId = record.employee?.id || record.employee;
      if (empId) {
        attendanceMap.set(empId, {
          checkIn: record.check_in || record.checkIn,
          checkOut: record.check_out || record.checkOut,
          remarks: record.remarks || record.note || "",
          attendanceId: record.id,
        });
      }
    });

    // Helper to format time from various formats
    const formatTime = (timeStr) => {
      if (!timeStr) return "";
      // If time includes date (ISO format), extract time part
      if (timeStr.includes("T")) {
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
    const data = employeesList.map((emp) => {
      const existingAttendance = attendanceMap.get(emp.id);

      return {
        id: emp.id,
        firstName: emp.first_name || emp.firstName || "",
        lastName: emp.last_name || emp.lastName || "",
        name:
          `${emp.first_name || emp.firstName || ""} ${
            emp.last_name || emp.lastName || ""
          }`.trim() ||
          emp.name ||
          `Employee ${emp.id}`,
        email: emp.email || emp.work_email || emp.personal_email || "",
        jobTitle:
          emp.emp_job_title?.name || emp.job_title || emp.jobTitle || "",
        department:
          emp.emp_department?.name ||
          (typeof emp.department === "string"
            ? emp.department
            : emp.department?.name) ||
          emp.department_name ||
          "",
        checkInTime:
          existingAttendance && existingAttendance.checkIn
            ? formatTime(existingAttendance.checkIn)
            : "",
        checkOutTime:
          existingAttendance && existingAttendance.checkOut
            ? formatTime(existingAttendance.checkOut)
            : "",
        remarks: existingAttendance ? existingAttendance.remarks || "" : "",
        date: currentDate,
        attendanceId: existingAttendance?.attendanceId || null,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching employees with attendance:", error);
    return { success: false, error: error.message };
  }
}

// Get my attendance records within a date range
export async function getMyAttendance(startDate, endDate) {
  try {
    const response = await fetchFromApi(
      `${Api_path.ATTENDANCE.MY_ATTENDANCE}?startDate=${startDate}&endDate=${endDate}`
    );

    const body = response?.data ?? response;
    let data = [];
    if (Array.isArray(body)) {
      data = body;
    } else if (Array.isArray(body.data)) {
      data = body.data;
    } else if (Array.isArray(body?.data?.data)) {
      data = body.data.data;
    } else if (Array.isArray(body?.data?.attendance)) {
      data = body.data.attendance;
    } else {
      data = [];
    }

    // Helper to format time to 12h format
    const formatTime12h = (time24h) => {
      if (!time24h) return null;
      try {
        const [hours, minutes] = time24h.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      } catch {
        return time24h;
      }
    };

    // Process the data to match component expectations
    const processedData = data.map(record => {
      // Calculate status
      let status = "absent";
      if (record.checkIn && record.checkOut) {
        status = "present";
      } else if (record.checkIn) {
        status = "present"; // Assuming if checked in, present
      }

      // Calculate hours worked
      let hoursWorked = 0;
      if (record.checkIn && record.checkOut) {
        try {
          const checkInTime = new Date(`1970-01-01T${record.checkIn}`);
          let checkOutTime = new Date(`1970-01-01T${record.checkOut}`);
          
          // If checkOut is before checkIn, assume it's next day
          if (checkOutTime < checkInTime) {
            checkOutTime.setDate(checkOutTime.getDate() + 1);
          }
          
          const diffMs = checkOutTime - checkInTime;
          hoursWorked = Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
          hoursWorked = Math.round(hoursWorked * 100) / 100; // Round to 2 decimal places
        } catch (error) {
          console.error("Error calculating hours worked:", error);
          hoursWorked = 0;
        }
      }

      return {
        id: record.id,
        date: record.date,
        checkIn: formatTime12h(record.checkIn),
        checkOut: formatTime12h(record.checkOut),
        status,
        hoursWorked,
        remarks: record.remarks || "",
        onsite_or_remote: record.onsite_or_remote,
      };
    });

    return { success: true, data: processedData };
  } catch (error) {
    console.error("Error fetching my attendance:", error);
    return { success: false, error: error.message };
  }
}

// Get attendance records for a specific employee
export async function getEmployeeAttendances(employeeId, startDate, endDate) {
  try {
    // Default to last 30 days if dates not provided
    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const startStr = fmt(start);
    const endStr = fmt(end);

    const response = await fetchFromApi(
      `${Api_path.ATTENDANCE.EMPLOYEE_ATTENDANCE(employeeId)}?startDate=${startStr}&endDate=${endStr}`
    );

    const body = response?.data ?? response;
    let data = [];
    if (Array.isArray(body)) {
      data = body;
    } else if (Array.isArray(body.data)) {
      data = body.data;
    } else if (Array.isArray(body?.data?.data)) {
      data = body.data.data;
    } else if (Array.isArray(body?.data?.attendance)) {
      data = body.data.attendance;
    } else {
      data = [];
    }

    // Process the data similar to getMyAttendance
    const processedData = data.map(record => {
      // Calculate status
      let status = "absent";
      if (record.checkIn && record.checkOut) {
        status = "present";
      } else if (record.checkIn) {
        status = "present";
      }

      // Calculate hours worked
      let hoursWorked = 0;
      if (record.checkIn && record.checkOut) {
        try {
          const checkInTime = new Date(`1970-01-01T${record.checkIn}`);
          let checkOutTime = new Date(`1970-01-01T${record.checkOut}`);
          
          if (checkOutTime < checkInTime) {
            checkOutTime.setDate(checkOutTime.getDate() + 1);
          }
          
          const diffMs = checkOutTime - checkInTime;
          hoursWorked = Math.max(0, diffMs / (1000 * 60 * 60));
          hoursWorked = Math.round(hoursWorked * 100) / 100;
        } catch (error) {
          console.error("Error calculating hours worked:", error);
          hoursWorked = 0;
        }
      }

      return {
        id: record.id,
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        status,
        hoursWorked,
        remarks: record.remarks || "",
        onsite_or_remote: record.onsite_or_remote,
        checkInIp: record.check_in_ip || "",
        checkOutIp: record.check_out_ip || "",
      };
    });

    return { success: true, data: processedData };
  } catch (error) {
    console.error("Error fetching employee attendances:", error);
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

    // Separate records into new (no attendanceId) and existing (has attendanceId)
    const newRecords = attendanceRecords.filter(
      (record) => !record.attendanceId
    );
    const existingRecords = attendanceRecords.filter(
      (record) => record.attendanceId
    );

    const results = [];

    // Handle new records with bulk create
    if (newRecords.length > 0) {
      const attendances = newRecords.map((record) => ({
        date: record.date,
        checkIn: formatTime(record.checkInTime),
        checkOut: record.checkOutTime ? formatTime(record.checkOutTime) : null,
        remarks: record.remarks || "",
        onsite_or_remote: true,
        check_in_ip: "",
        check_out_ip: "",
        employee: record.employeeId,
      }));

      console.log(
        `Bulk creating ${newRecords.length} new attendance records:`,
        JSON.stringify({ attendances }, null, 2)
      );

      try {
        const response = await fetchFromApi(Api_path.ATTENDANCE.BULK_CREATE, {
          method: "POST",
          body: { attendances },
        });

        console.log("Bulk create response:", JSON.stringify(response, null, 2));

        const responseData = response?.data ?? response;

        // Check for successful response
        if (
          responseData?.success ||
          response?.status === 201 ||
          responseData?.statusCode === 201
        ) {
          newRecords.forEach((record) => {
            results.push({
              success: true,
              employeeId: record.employeeId,
            });
          });
        } else {
          throw new Error(
            responseData?.message || "Failed to create attendances"
          );
        }
      } catch (error) {
        console.error("Bulk create error:", error);
        newRecords.forEach((record) => {
          results.push({
            success: false,
            employeeId: record.employeeId,
            error: error.message || "Failed to create attendance",
          });
        });
      }
    }

    // Handle existing records with individual PATCH requests
    if (existingRecords.length > 0) {
      const updatePromises = existingRecords.map(async (record) => {
        const payload = {
          date: record.date,
          checkIn: formatTime(record.checkInTime),
          checkOut: record.checkOutTime
            ? formatTime(record.checkOutTime)
            : null,
          remarks: record.remarks || "",
          onsite_or_remote: true,
          check_in_ip: "",
          check_out_ip: "",
          employee: record.employeeId,
        };

        try {
          console.log(
            `Updating attendance ${record.attendanceId} for employee ${record.employeeId}:`,
            JSON.stringify(payload, null, 2)
          );

          const response = await fetchFromApi(
            Api_path.ATTENDANCE.UPDATE(record.attendanceId),
            {
              method: "PATCH",
              body: payload,
            }
          );

          const responseData =
            response?.data?.data ?? response?.data ?? response;

          console.log(
            `Update response for employee ${record.employeeId}:`,
            JSON.stringify(responseData, null, 2)
          );

          if (responseData?.statusCode >= 400) {
            throw new Error(
              responseData?.message || "Failed to update attendance"
            );
          }

          return {
            success: true,
            employeeId: record.employeeId,
          };
        } catch (error) {
          console.error(
            `Error updating attendance for employee ${record.employeeId}:`,
            error
          );
          return {
            success: false,
            employeeId: record.employeeId,
            error: error.message || "Failed to update attendance",
          };
        }
      });

      const updateResults = await Promise.all(updatePromises);
      results.push(...updateResults);
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    // Log all errors for debugging
    const errors = results.filter((r) => !r.success);
    if (errors.length > 0) {
      console.error("Attendance save errors:", errors);
    }

    return {
      success: failCount === 0,
      successCount,
      failCount,
      results,
      error:
        errors.length > 0
          ? errors.map((e) => `Employee ${e.employeeId}: ${e.error}`).join("; ")
          : null,
    };
  } catch (error) {
    console.error("Error in bulk save attendance:", error);

    // Return failure for all records
    return {
      success: false,
      successCount: 0,
      failCount: attendanceRecords.length,
      results: attendanceRecords.map((record) => ({
        success: false,
        employeeId: record.employeeId,
        error: error.message || error.toString(),
      })),
      error: error.message || error.toString(),
    };
  }
}
