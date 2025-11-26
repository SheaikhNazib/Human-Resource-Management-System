"use server";

import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";

export async function getJobTitlesList() {
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
    } else {
      rawList = [];
    }

    const data = Array.isArray(rawList)
      ? rawList
          .map((item) => {
            const id =
              item?.id ??
              item?._id ??
              item?.job_title_id ??
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
    console.error("Error fetching job titles:", error);
    return { success: false, error: error.message };
  }
}

export async function createJobTitle(data) {
  try {
    const response = await fetchFromApi(Api_path.JOB_TITLE.LIST, {
      method: "POST",
      data: {
        name: data.name,
        description: data.description || "",
      },
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error creating job title:", error);
    return { success: false, error: error.message };
  }
}

export async function updateJobTitle(id, data) {
  try {
    const response = await fetchFromApi(`${Api_path.JOB_TITLE.LIST}/${id}`, {
      method: "PATCH",
      data: {
        name: data.name,
        description: data.description || "",
      },
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error updating job title:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteJobTitle(id) {
  try {
    const response = await fetchFromApi(`${Api_path.JOB_TITLE.LIST}/${id}`, {
      method: "DELETE",
    });
    return { success: true, data: response?.data ?? response };
  } catch (error) {
    console.error("Error deleting job title:", error);
    return { success: false, error: error.message };
  }
}

export async function getJobTitle(id) {
  try {
    const response = await fetchFromApi(Api_path.JOB_TITLE.GET_ONE(id));
    const body = response?.data ?? response;
    const item = body?.data ?? body;

    if (!item) {
      return { success: false, error: "Job title not found" };
    }

    const id_value =
      item?.id ??
      item?._id ??
      item?.job_title_id ??
      item?.attributes?.id ??
      item?.attributes?._id;

    const data = {
      id: id_value,
      name: item?.name ?? item?.attributes?.name ?? "",
      description: item?.description ?? item?.attributes?.description ?? "",
      createdAt:
        item?.createdAt ??
        item?.created_at ??
        item?.attributes?.createdAt ??
        item?.attributes?.created_at ??
        null,
      raw: item,
    };

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching job title:", error);
    return { success: false, error: error.message };
  }
}
