"use server";

import { fetchFromApi } from "@/lib/axios";
import { Department_path } from "@/constant/api-path";

export async function getDepartmentsList() {
  try {
    const response = await fetchFromApi(Department_path.LIST);
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
      ? rawList
          .map((item) => {
            const id =
              item?.id ??
              item?._id ??
              item?.department_id ??
              item?.attributes?.id ??
              item?.attributes?._id;
            if (id === undefined || id === null) return null;
            return {
              id,
              name: item?.name ?? item?.attributes?.name ?? "",
              description:
                item?.description ?? item?.attributes?.description ?? "",
              createdAt:
                item?.createdAt ??
                item?.created_at ??
                item?.attributes?.createdAt ??
                item?.attributes?.created_at ??
                null,
              raw: item,
            };
          })
          .filter(Boolean)
      : [];

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return { success: false, error: error.message };
  }
}

export async function createDepartment(data) {
  try {
    const response = await fetchFromApi(Department_path.LIST, {
      method: "POST",
      data: {
        name: data.name,
        description: data.description || "",
      },
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error creating department:", error);
    return { success: false, error: error.message };
  }
}

export async function updateDepartment(id, data) {
  try {
    const response = await fetchFromApi(`${Department_path.LIST}/${id}`, {
      method: "PATCH",
      data: {
        name: data.name,
        description: data.description || "",
      },
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error updating department:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDepartment(id) {
  try {
    const response = await fetchFromApi(`${Department_path.LIST}/${id}`, {
      method: "DELETE",
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error deleting department:", error);
    return { success: false, error: error.message };
  }
}

export async function getDepartment(id) {
  try {
    const endpoint = `${Department_path.LIST}/${id}`;
    const response = await fetchFromApi(endpoint);
    const body = response?.data ?? response;
    // Try to extract the department object from known shapes
    let dept = null;
    if (body && typeof body === "object") {
      if (
        body.data &&
        typeof body.data === "object" &&
        !Array.isArray(body.data)
      ) {
        dept = body.data;
      } else if (body?.data?.data && !Array.isArray(body.data.data)) {
        dept = body.data.data;
      } else if (body.id) {
        dept = body;
      }
    }

    if (!dept) {
      return { success: false, error: "Department not found" };
    }

    const data = {
      id: dept.id,
      name: dept.name,
      description: dept.description || "",
      createdAt: dept.createdAt || dept.created_at || null,
      updatedAt: dept.updatedAt || dept.updated_at || null,
      raw: dept,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching department:", error);
    return { success: false, error: error.message };
  }
}
