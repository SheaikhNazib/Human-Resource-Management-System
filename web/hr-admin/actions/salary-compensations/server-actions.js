"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

export async function getSalaryCompensationsList() {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE_SALARY_COMPENSATIONS.LIST);
    console.log("Raw salary compensations response:", JSON.stringify(response));

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
          // Extract employee ID from various possible formats
          let empId = null;
          if (typeof item.employee === "number") {
            empId = item.employee;
          } else if (typeof item.employee === "object" && item.employee?.id) {
            empId = item.employee.id;
          } else {
            empId = item.employee_id || item.employeeId;
          }

          const firstName = item.employee?.first_name || item.employee?.firstName || "";
          const lastName = item.employee?.last_name || item.employee?.lastName || "";
          const employeeName = firstName || lastName ? `${firstName} ${lastName}`.trim() : item.employee_name || item.employeeName || "—";

          return {
            id: item.id,
            employeeId: empId,
            employeeName,
            amount: item.amount || item.compensation_amount || 0,
            currency: item.currency || item.currency_code || "",
            type: item.compensation_type || item.type || "",
            effectiveDate: item.effective_date || item.effectiveDate || null,
            notes: item.note || item.notes || "",
            createdAt: item.created_at || item.createdAt || null,
            raw: item,
          };
        })
      : [];

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching salary compensations:", error);
    return { success: false, error: error.message };
  }
}

export async function getSalaryCompensationById(id) {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE_SALARY_COMPENSATIONS.GET_ONE(id));
    const body = response?.data ?? response;

    // Handle nested data structure
    let item = body?.data?.data || body?.data || body;

    if (!item || !item.id) {
      return { success: false, error: "Salary compensation not found" };
    }

    let empId = null;
    if (typeof item.employee === "number") {
      empId = item.employee;
    } else if (typeof item.employee === "object" && item.employee?.id) {
      empId = item.employee.id;
    } else {
      empId = item.employee_id || item.employeeId;
    }

    const firstName = item.employee?.first_name || item.employee?.firstName || "";
    const lastName = item.employee?.last_name || item.employee?.lastName || "";
    const employeeName = firstName || lastName ? `${firstName} ${lastName}`.trim() : item.employee_name || item.employeeName || "—";

    const data = {
      id: item.id,
      employeeId: empId,
      employeeName,
      amount: item.amount || item.compensation_amount || 0,
      currency: item.currency || item.currency_code || "",
      type: item.compensation_type || item.type || "",
      effectiveDate: item.effective_date || item.effectiveDate || null,
      notes: item.note || item.notes || "",
      createdAt: item.created_at || item.createdAt || null,
      raw: item,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching salary compensation:", error);
    return { success: false, error: error.message };
  }
}

export async function createSalaryCompensation(compData) {
  try {
    const payload = {
      employee: compData.employee || compData.employeeId || compData.employee_id,
      amount: compData.amount,
      compensation_type: compData.type || compData.compensation_type,
      effective_date: compData.effectiveDate || compData.effective_date,
      note: compData.notes || compData.note || "",
      currency: compData.currency || compData.currency_code || undefined,
    };

    const response = await fetchFromApi(Api_path.EMPLOYEE_SALARY_COMPENSATIONS.CREATE, {
      method: "POST",
      body: payload,
    });

    const responseData = response?.data?.data ?? response?.data ?? response;

    if (responseData?.statusCode >= 400) {
      return { success: false, error: responseData?.message || "Failed to create salary compensation" };
    }
    if (!responseData?.id) {
      return { success: false, error: "Salary compensation created but no ID returned" };
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error creating salary compensation:", error);
    return { success: false, error: error.message || "Failed to create salary compensation" };
  }
}

export async function updateSalaryCompensation(id, compData) {
  try {
    const payload = {
      employee: compData.employee || compData.employeeId || compData.employee_id,
      amount: compData.amount,
      compensation_type: compData.type || compData.compensation_type,
      effective_date: compData.effectiveDate || compData.effective_date,
      note: compData.notes || compData.note || "",
      currency: compData.currency || compData.currency_code || undefined,
    };

    const response = await fetchFromApi(Api_path.EMPLOYEE_SALARY_COMPENSATIONS.UPDATE(id), {
      method: "PATCH",
      body: payload,
    });

    const responseData = response?.data?.data ?? response?.data ?? response;

    if (responseData?.statusCode >= 400) {
      return { success: false, error: responseData?.message || "Failed to update salary compensation" };
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error updating salary compensation:", error);
    return { success: false, error: error.message || "Failed to update salary compensation" };
  }
}

export async function deleteSalaryCompensation(id) {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE_SALARY_COMPENSATIONS.DELETE(id), {
      method: "DELETE",
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error deleting salary compensation:", error.message);
    return { success: false, error: error.message };
  }
}
