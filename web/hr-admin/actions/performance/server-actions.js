"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

export async function getPerformanceList() {
  try {
    const response = await fetchFromApi(Api_path.EMPLOYEE_PERFORMANCE.LIST);
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
          id: item.id ?? item._id,
          employeeId: item.employee_id ?? item.employee?.id,
          employeeName: item.employee?.name ?? item.employee_name ?? "",
          rating: item.rating ?? item.score ?? 0,
          notes: item.notes ?? item.feedback ?? "",
          createdAt: item.createdAt ?? item.created_at ?? null,
          updatedAt: item.updatedAt ?? item.updated_at ?? null,
          raw: item,
        }))
      : [];

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching performance records:", error);
    return { success: false, error: error.message };
  }
}

export async function createPerformance(data) {
  try {
    // API expects: employee (integer), score (integer), review_date (ISO string), feedback, reviewer
    const payload = {
      employee: Number(data.employee_id ?? data.employee) || null,
      score: Number(data.rating ?? data.score) || 0,
      review_date: new Date().toISOString(),
      feedback: data.notes || data.feedback || "",
      reviewer: data.reviewer || "",
    };

    if (!payload.employee) {
      return { success: false, error: "Employee is required" };
    }

    // Ensure score is integer between 1 and 10
    payload.score = Math.round(payload.score);
    if (payload.score < 1 || payload.score > 10) {
      return {
        success: false,
        error: "Score must be an integer between 1 and 10",
      };
    }

    const response = await fetchFromApi(Api_path.EMPLOYEE_PERFORMANCE.CREATE, {
      method: "POST",
      body: payload,
    });
    const responseData = response?.data?.data ?? response?.data ?? response;
    if (responseData?.statusCode >= 400) {
      return {
        success: false,
        error: responseData?.message || "Failed to create performance",
      };
    }
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error creating performance:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePerformance(id, data) {
  try {
    const payload = {
      employee: Number(data.employee_id ?? data.employee) || null,
      score: Number(data.rating ?? data.score) || 0,
      review_date: new Date().toISOString(),
      feedback: data.notes || data.feedback || "",
      reviewer: data.reviewer || "",
    };

    payload.score = Math.round(payload.score);

    const response = await fetchFromApi(
      Api_path.EMPLOYEE_PERFORMANCE.UPDATE(id),
      {
        method: "PATCH",
        body: payload,
      }
    );
    const responseData = response?.data?.data ?? response?.data ?? response;
    if (responseData?.statusCode >= 400) {
      return {
        success: false,
        error: responseData?.message || "Failed to update performance",
      };
    }
    return { success: true, data: responseData };
  } catch (error) {
    console.error("Error updating performance:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePerformance(id) {
  try {
    const response = await fetchFromApi(
      Api_path.EMPLOYEE_PERFORMANCE.DELETE(id),
      {
        method: "DELETE",
      }
    );
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error deleting performance:", error);
    return { success: false, error: error.message };
  }
}

export async function getPerformance(id) {
  try {
    const response = await fetchFromApi(
      Api_path.EMPLOYEE_PERFORMANCE.GET_ONE(id)
    );
    const body = response?.data ?? response;
    const performanceData = body?.data ?? body;

    if (!performanceData || !performanceData.id) {
      return { success: false, error: "Performance record not found" };
    }

    return { success: true, data: performanceData };
  } catch (error) {
    console.error("Error fetching performance:", error);
    return { success: false, error: error.message };
  }
}
