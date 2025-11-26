"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

export async function getLeavesList() {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE_LEAVE.LIST);
    console.log("Raw leaves response from backend:", JSON.stringify(response));

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
      ? rawList.map((item) => {
          const firstName = item.employee?.first_name || '';
          const lastName = item.employee?.last_name || '';
          const employeeName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '—';
          
          return {
            id: item.id,
            employeeId: item.employee_id || item.employeeId,
            employeeName,
            leaveType: item.leave_type || item.leaveType || '—',
            startDate: item.start_date || item.startDate || null,
            endDate: item.end_date || item.endDate || null,
            reason: item.reason || '—',
            status: item.status || 'pending',
            approvedBy: item.approved_by || item.approvedBy || null,
            approvedAt: item.approved_at || item.approvedAt || null,
            createdAt: item.created_at || item.createdAt || null,
            raw: item,
          };
        })
      : [];

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching leaves:", error);
    return { success: false, error: error.message };
  }
}

export async function getLeaveById(id) {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE_LEAVE.GET_ONE(id));
    const body = response?.data ?? response;
    
    // Handle nested data structure
    let item = body?.data?.data || body?.data || body;
    
    const firstName = item.employee?.first_name || '';
    const lastName = item.employee?.last_name || '';
    const employeeName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || '—';
    
    const data = {
      id: item.id,
      employeeId: item.employee_id || item.employeeId,
      employeeName,
      leaveType: item.leave_type || item.leaveType || '—',
      startDate: item.start_date || item.startDate || null,
      endDate: item.end_date || item.endDate || null,
      reason: item.reason || '—',
      status: item.status || 'pending',
      approvedBy: item.approved_by || item.approvedBy || null,
      approvedAt: item.approved_at || item.approvedAt || null,
      createdAt: item.created_at || item.createdAt || null,
      raw: item,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching leave:", error);
    return { success: false, error: error.message };
  }
}

export async function createLeave(leaveData) {
  try {
    console.log("Server action received data:", JSON.stringify(leaveData, null, 2));
    
    // Build payload matching backend API expectations
    const payload = {
      employee: leaveData.employee,
      start_date: leaveData.start_date,
      end_date: leaveData.end_date,
      reason: leaveData.reason,
      status: leaveData.status,
      leave_days: leaveData.leave_days,
    };

    console.log("Sending payload to API:", JSON.stringify(payload, null, 2));

    const response = await fetchFromApi(Api_path.EMPLOYEE_LEAVE.CREATE, {
      method: "POST",
      body: payload,
    });
    
    console.log("Raw API response:", JSON.stringify(response, null, 2));
    
    let responseData = response?.data;
    if (responseData?.data) {
      responseData = responseData.data;
    }
    
    console.log("Extracted responseData:", JSON.stringify(responseData, null, 2));
    
    if (responseData?.statusCode && responseData.statusCode >= 400) {
      const errorMsg = responseData.message || responseData.error || 'Failed to create leave';
      console.error("API returned error status:", responseData.statusCode, errorMsg);
      return { success: false, error: errorMsg };
    }
    if (!responseData?.id) {
      const errorMsg = responseData?.message || responseData?.error || 'Leave created but no ID returned';
      console.error("No ID in response:", errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log("Leave created successfully with ID:", responseData.id);
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error creating leave - Full error:", error);
    console.error("Error message:", error.message);
    console.error("Error response data:", error.response?.data);
    console.error("Error response status:", error.response?.status);
    
    let errorMsg = 'Failed to create leave';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      errorMsg = errorData.message || errorData.error || errorData.statusCode || JSON.stringify(errorData);
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    return { success: false, error: errorMsg };
  }
}

export async function updateLeave(id, leaveData) {
  try {
    console.log("Updating leave with data:", JSON.stringify(leaveData, null, 2));
    
    const payload = {
      employee_id: leaveData.employee_id || leaveData.employeeId,
      leave_type: leaveData.leave_type || leaveData.leaveType,
      start_date: leaveData.start_date || leaveData.startDate,
      end_date: leaveData.end_date || leaveData.endDate,
      reason: leaveData.reason || '',
      status: leaveData.status || 'pending',
    };

    const response = await fetchFromApi(Api_path.EMPLOYEE_LEAVE.UPDATE(id), {
      method: "PATCH",
      body: payload,
    });
    
    console.log("Update response:", JSON.stringify(response, null, 2));
    
    let responseData = response?.data;
    if (responseData?.data) {
      responseData = responseData.data;
    }
    
    if (responseData?.statusCode && responseData.statusCode >= 400) {
      const errorMsg = responseData.message || responseData.error || 'Failed to update leave';
      return { success: false, error: errorMsg };
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error updating leave:", error);
    
    let errorMsg = 'Failed to update leave';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    return { success: false, error: errorMsg };
  }
}

export async function deleteLeave(id) {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE_LEAVE.DELETE(id), {
      method: "DELETE",
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error deleting leave:", error);
    const errBody = error?.response?.data ?? error?.message ?? String(error);
    return { success: false, error: errBody };
  }
}

export async function updateLeaveStatus(id, status, approvedBy = null) {
  try {
    console.log("Updating leave status:", { id, status, approvedBy });
    
    const payload = {
      status,
    };
    
    if (approvedBy) {
      payload.approved_by = approvedBy;
      payload.approved_at = new Date().toISOString();
    }

    const response = await fetchFromApi(Api_path.EMPLOYEE_LEAVE.UPDATE(id), {
      method: "PATCH",
      body: payload,
    });
    
    console.log("Status update response:", JSON.stringify(response, null, 2));
    
    let responseData = response?.data;
    if (responseData?.data) {
      responseData = responseData.data;
    }
    
    if (responseData?.statusCode && responseData.statusCode >= 400) {
      const errorMsg = responseData.message || responseData.error || 'Failed to update status';
      return { success: false, error: errorMsg };
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error updating leave status:", error);
    
    let errorMsg = 'Failed to update status';
    
    if (error.response?.data) {
      const errorData = error.response.data;
      errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    return { success: false, error: errorMsg };
  }
}
