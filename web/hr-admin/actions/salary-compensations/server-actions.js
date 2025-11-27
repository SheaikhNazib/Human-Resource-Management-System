"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

export async function getSalaryCompensationsList(params = {}) {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params.date) queryParams.append("date", params.date);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${Api_path.EMPLOYEE_SALARY_COMPENSATIONS.LIST}?${queryString}`
      : Api_path.EMPLOYEE_SALARY_COMPENSATIONS.LIST;

    const response = await fetchFromApi(url);
    console.log("Raw salary compensations response:", JSON.stringify(response));

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

          const firstName =
            item.employee?.first_name || item.employee?.firstName || "";
          const lastName =
            item.employee?.last_name || item.employee?.lastName || "";
          const employeeName =
            firstName || lastName
              ? `${firstName} ${lastName}`.trim()
              : item.employee_name || item.employeeName || "—";

          return {
            id: item.id,
            employeeId: empId,
            employeeName,
            baseSalary: parseFloat(item.base_salary) || 0,
            bonus: parseFloat(item.bonus) || 0,
            allowance: parseFloat(item.allowance) || 0,
            deduction: parseFloat(item.deduction) || 0,
            deductionReason:
              item.deduction_reason || item.deductionReason || "",
            netSalary: parseFloat(item.net_salary) || 0,
            payableDate: item.payable_date || item.payableDate || null,
            effectiveDate: item.effective_date || item.effectiveDate || null,
            remarks: item.remarks || item.note || "",
            createdAt: item.created_at || item.createdAt || null,
            updatedAt: item.updated_at || item.updatedAt || null,
            raw: item,
          };
        })
      : [];

    return { success: true, data, metaData };
  } catch (error) {
    console.error("Error fetching salary compensations:", error);
    return { success: false, error: error.message };
  }
}

export async function getSalaryCompensationById(id) {
  try {
    const response = await fetchFromApi(
      Api_path.EMPLOYEE_SALARY_COMPENSATIONS.GET_ONE(id)
    );
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

    const firstName =
      item.employee?.first_name || item.employee?.firstName || "";
    const lastName = item.employee?.last_name || item.employee?.lastName || "";
    const employeeName =
      firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : item.employee_name || item.employeeName || "—";

    const data = {
      id: item.id,
      employeeId: empId,
      employeeName,
      baseSalary: parseFloat(item.base_salary) || 0,
      bonus: parseFloat(item.bonus) || 0,
      allowance: parseFloat(item.allowance) || 0,
      deduction: parseFloat(item.deduction) || 0,
      deductionReason: item.deduction_reason || item.deductionReason || "",
      netSalary: parseFloat(item.net_salary) || 0,
      payableDate: item.payable_date || item.payableDate || null,
      effectiveDate: item.effective_date || item.effectiveDate || null,
      remarks: item.remarks || item.note || "",
      createdAt: item.created_at || item.createdAt || null,
      updatedAt: item.updated_at || item.updatedAt || null,
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
      employee:
        compData.employee || compData.employeeId || compData.employee_id,
      base_salary: parseFloat(compData.baseSalary || compData.base_salary || 0),
      bonus: parseFloat(compData.bonus || 0),
      allowance: parseFloat(compData.allowance || 0),
      deduction: parseFloat(compData.deduction || 0),
      net_salary: parseFloat(compData.netSalary || compData.net_salary || 0),
      payable_date: compData.payableDate || compData.payable_date,
      effective_date: compData.effectiveDate || compData.effective_date,
      remarks: compData.remarks || compData.note || "",
    };

    const response = await fetchFromApi(
      Api_path.EMPLOYEE_SALARY_COMPENSATIONS.CREATE,
      {
        method: "POST",
        body: payload,
      }
    );

    const responseData = response?.data?.data ?? response?.data ?? response;

    if (responseData?.statusCode >= 400) {
      return {
        success: false,
        error: responseData?.message || "Failed to create salary compensation",
      };
    }
    if (!responseData?.id) {
      return {
        success: false,
        error: "Salary compensation created but no ID returned",
      };
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error creating salary compensation:", error);
    return {
      success: false,
      error: error.message || "Failed to create salary compensation",
    };
  }
}

export async function updateSalaryCompensation(id, compData) {
  try {
    const payload = {
      employee:
        compData.employee || compData.employeeId || compData.employee_id,
      base_salary: parseFloat(compData.baseSalary || compData.base_salary || 0),
      bonus: parseFloat(compData.bonus || 0),
      allowance: parseFloat(compData.allowance || 0),
      deduction: parseFloat(compData.deduction || 0),
      net_salary: parseFloat(compData.netSalary || compData.net_salary || 0),
      payable_date: compData.payableDate || compData.payable_date,
      effective_date: compData.effectiveDate || compData.effective_date,
      remarks: compData.remarks || compData.note || "",
    };

    const response = await fetchFromApi(
      Api_path.EMPLOYEE_SALARY_COMPENSATIONS.UPDATE(id),
      {
        method: "PATCH",
        body: payload,
      }
    );

    const responseData = response?.data?.data ?? response?.data ?? response;

    if (responseData?.statusCode >= 400) {
      return {
        success: false,
        error: responseData?.message || "Failed to update salary compensation",
      };
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error updating salary compensation:", error);
    return {
      success: false,
      error: error.message || "Failed to update salary compensation",
    };
  }
}

export async function deleteSalaryCompensation(id) {
  try {
    const response = await fetchFromApi(
      Api_path.EMPLOYEE_SALARY_COMPENSATIONS.DELETE(id),
      {
        method: "DELETE",
      }
    );
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error deleting salary compensation:", error.message);
    return { success: false, error: error.message };
  }
}
