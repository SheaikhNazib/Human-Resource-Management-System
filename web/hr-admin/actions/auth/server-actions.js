"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";
import { cookies } from "next/headers";

/**
 * Login user with email and password
 */
export async function loginUser(credentials) {
  try {
    const response = await fetchFromApi(Api_path.AUTH.LOGIN, {
      method: "POST",
      body: credentials,
    });

    const body = response?.data ?? response;
    const data = body?.data ?? body;

    // Check for error in response
    if (response.status >= 400 || body?.success === false || !data) {
      const errorMessage = body?.message || data?.message || "Login failed";
      console.error("Login failed:", errorMessage, "Status:", response.status);
      return {
        success: false,
        error: errorMessage,
      };
    }

    // Store the access token and user data in cookies
    if (data.access_token || data.accessToken) {
      const token = data.access_token || data.accessToken;
      const cookieStore = await cookies();
      
      // Set httpOnly cookie for security
      cookieStore.set("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      // Store user data for quick access
      if (data.user) {
        cookieStore.set("user_data", JSON.stringify(data.user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        });
      }
    }

    return {
      success: true,
      data: {
        user: data.user || data,
        token: data.access_token || data.accessToken,
      },
    };
  } catch (error) {
    console.error("Error logging in:", error);
    const errorMessage = 
      error?.response?.data?.message || 
      error?.response?.data?.error ||
      error.message || 
      "Login failed";
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Register a new user
 */
export async function registerUser(userData) {
  try {
    const response = await fetchFromApi(Api_path.AUTH.REGISTER, {
      method: "POST",
      body: userData,
    });

    const body = response?.data ?? response;
    const data = body?.data ?? body;

    if (response.status >= 400 || !data) {
      return {
        success: false,
        error: data?.message || body?.message || "Registration failed",
      };
    }

    // Store the access token and user data in cookies if provided
    if (data.access_token || data.accessToken) {
      const token = data.access_token || data.accessToken;
      const cookieStore = await cookies();
      
      cookieStore.set("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      // Store user data for quick access
      if (data.user) {
        cookieStore.set("user_data", JSON.stringify(data.user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        });
      }
    }

    return {
      success: true,
      data: {
        user: data.user || data,
        token: data.access_token || data.accessToken,
      },
    };
  } catch (error) {
    console.error("Error registering:", error);
    return {
      success: false,
      error:
        error?.response?.data?.message ||
        error.message ||
        "Registration failed",
    };
  }
}

/**
 * Logout user
 */
export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    // Call backend logout endpoint if token exists (optional - endpoint may not exist)
    if (token) {
      try {
        await fetchFromApi(Api_path.AUTH.LOGOUT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Gracefully handle missing logout endpoint (404) or other errors
        if (error?.response?.status === 404) {
          console.log("/auth/logout endpoint not available, skipping backend call");
        } else {
          console.error("Error calling logout endpoint:", error);
        }
        // Continue with cookie deletion even if backend call fails
      }
    }

    // Delete the access token and user data cookies
    cookieStore.delete("access_token");
    cookieStore.delete("user_data");

    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    // Try to get user data from cookie first
    const userData = cookieStore.get("user_data")?.value;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return { success: true, data: user };
      } catch (e) {
        console.error("Error parsing user data from cookie:", e);
      }
    }

    // If no user data in cookie, try to fetch from backend (if endpoint exists)
    try {
      const response = await fetchFromApi(Api_path.AUTH.ME, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const body = response?.data ?? response;
      const data = body?.data ?? body;

      if (response.status >= 400 || !data) {
        return {
          success: false,
          error: data?.message || body?.message || "Failed to get user",
        };
      }

      return { success: true, data };
    } catch (error) {
      // If /auth/me endpoint doesn't exist (404), consider user authenticated if token exists
      if (error?.response?.status === 404) {
        console.log("/auth/me endpoint not available, relying on token");
        return { 
          success: true, 
          data: { authenticated: true } 
        };
      }
      
      console.error("Error getting current user:", error);
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error.message ||
          "Failed to get user",
      };
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify if user is authenticated
 */
export async function verifyAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return { success: false, authenticated: false };
    }

    // Optionally verify token with backend
    const result = await getCurrentUser();

    return {
      success: true,
      authenticated: result.success,
      user: result.data || null,
    };
  } catch (error) {
    return { success: false, authenticated: false };
  }
}
