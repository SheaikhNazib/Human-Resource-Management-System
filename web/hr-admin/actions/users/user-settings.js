"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

/**
 * Get user profile data with complete information
 */
export async function getUserProfile(id) {
  try {
    const response = await fetchFromApi(Api_path.USERS.GET_ONE(id));
    const body = response?.data ?? response;
    const data = body?.data ?? body;

    if (response.status >= 400 || !data) {
      return {
        success: false,
        error: data?.message || body?.message || "Failed to fetch user profile",
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to fetch user profile",
    };
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(id, profileData) {
  try {
    const response = await fetchFromApi(Api_path.USERS.UPDATE(id), {
      method: "PATCH",
      body: profileData,
    });

    const body = response?.data ?? response;
    const data = body?.data ?? body;

    if (response.status >= 400 || body?.success === false) {
      return {
        success: false,
        error: data?.message || body?.message || "Failed to update profile",
      };
    }

    return {
      success: true,
      data: data,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to update profile",
    };
  }
}

/**
 * Change user password
 */
export async function changeUserPassword(id, passwordData) {
  try {
    // Assuming the password change endpoint might be different
    // You may need to adjust this based on your actual API
    const response = await fetchFromApi(`/api/v1/users/${id}/change-password`, {
      method: "PATCH",
      body: passwordData,
    });

    const body = response?.data ?? response;
    const data = body?.data ?? body;

    if (response.status >= 400 || body?.success === false) {
      return {
        success: false,
        error: data?.message || body?.message || "Failed to change password",
      };
    }

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to change password",
    };
  }
}

/**
 * Get departments list for dropdown
 */
export async function getDepartmentsForSelect() {
  try {
    const response = await fetchFromApi(Api_path.DEPARTMENT.LIST);
    const body = response?.data ?? response;
    let rawList = [];
    
    if (Array.isArray(body)) {
      rawList = body;
    } else if (Array.isArray(body.data)) {
      rawList = body.data;
    } else if (Array.isArray(body?.data?.data)) {
      rawList = body.data.data;
    }

    const data = Array.isArray(rawList)
      ? rawList
          .map((item) => {
            const id = item?.id ?? item?._id ?? item?.department_id;
            if (id === undefined || id === null) return null;
            return {
              id,
              name: item?.name ?? "",
              description: item?.description ?? "",
            };
          })
          .filter(Boolean)
      : [];

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch departments",
      data: [],
    };
  }
}

/**
 * Get job titles list for dropdown
 */
export async function getJobTitlesForSelect() {
  try {
    const response = await fetchFromApi(Api_path.JOB_TITLE.LIST);
    const body = response?.data ?? response;
    let rawList = [];
    
    if (Array.isArray(body)) {
      rawList = body;
    } else if (Array.isArray(body.data)) {
      rawList = body.data;
    } else if (Array.isArray(body?.data?.data)) {
      rawList = body.data.data;
    }

    const data = Array.isArray(rawList)
      ? rawList
          .map((item) => {
            const id = item?.id ?? item?._id ?? item?.job_title_id;
            if (id === undefined || id === null) return null;
            return {
              id,
              name: item?.name ?? "",
              description: item?.description ?? "",
            };
          })
          .filter(Boolean)
      : [];

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching job titles:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch job titles",
      data: [],
    };
  }
}