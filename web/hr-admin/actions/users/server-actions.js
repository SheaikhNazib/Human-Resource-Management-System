"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

/**
 * Get all users
 */
export async function getUsersList() {
  try {
    const response = await fetchFromApi(Api_path.USERS.LIST);
    const body = response?.data ?? response;
    const data = body?.data ?? body;

    if (response.status >= 400 || !data) {
      return {
        success: false,
        error: data?.message || body?.message || "Failed to fetch users",
      };
    }

    return {
      success: true,
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to fetch users",
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id) {
  try {
    const response = await fetchFromApi(Api_path.USERS.GET_ONE(id));
    const body = response?.data ?? response;
    const data = body?.data ?? body;

    if (response.status >= 400 || !data) {
      return {
        success: false,
        error: data?.message || body?.message || "Failed to fetch user",
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to fetch user",
    };
  }
}

/**
 * Create a new user
 */
export async function createUser(userData) {
  try {
    const response = await fetchFromApi(Api_path.USERS.CREATE, {
      method: "POST",
      body: userData,
    });

    const body = response?.data ?? response;
    const data = body?.data ?? body;

    if (response.status >= 400 || body?.success === false) {
      return {
        success: false,
        error: data?.message || body?.message || "Failed to create user",
      };
    }

    return {
      success: true,
      data: data,
      message: "User created successfully",
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to create user",
    };
  }
}

/**
 * Update user by ID
 */
export async function updateUser(id, userData) {
  try {
    const response = await fetchFromApi(Api_path.USERS.UPDATE(id), {
      method: "PATCH",
      body: userData,
    });

    const body = response?.data ?? response;
    const data = body?.data ?? body;

    if (response.status >= 400 || body?.success === false) {
      return {
        success: false,
        error: data?.message || body?.message || "Failed to update user",
      };
    }

    return {
      success: true,
      data: data,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to update user",
    };
  }
}

/**
 * Delete user by ID
 */
export async function deleteUser(id) {
  try {
    const response = await fetchFromApi(Api_path.USERS.DELETE(id), {
      method: "DELETE",
    });

    const body = response?.data ?? response;

    if (response.status >= 400) {
      return {
        success: false,
        error: body?.message || "Failed to delete user",
      };
    }

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Failed to delete user",
    };
  }
}
