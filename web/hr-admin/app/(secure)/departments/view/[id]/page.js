import React from "react";
import { fetchFromApi } from "@/lib/axios";
import { Api_path } from "@/constant/api-path";
import Link from "next/link";

export default async function DepartmentDetailPage({ params } = {}) {
  // In Next.js 15+, params is a Promise and must be awaited
  const resolvedParams = await params;

  // Defensive logging to help diagnose why `params.id` may be missing
  try {
    console.log("DepartmentDetailPage params:", JSON.stringify(resolvedParams));
  } catch (e) {
    console.log("DepartmentDetailPage params (unserializable)", resolvedParams);
  }

  // Robust extraction: support string id, array id (catch-all style), or alternative keys
  let id = resolvedParams?.id ?? resolvedParams?.slug ?? null;
  if (Array.isArray(id)) id = id[0];

  if (!id) {
    console.warn("DepartmentDetailPage: missing id in route params", {
      params: resolvedParams,
    });
    return (
      <div className="p-6 bg-yellow-50 text-yellow-800 rounded">
        Missing department id in route.
      </div>
    );
  }

  try {
    const res = await fetchFromApi(
      Api_path.DEPARTMENT.GET_ONE(encodeURIComponent(id))
    );
    const body = res?.data ?? res;

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
      return (
        <div className="p-6 bg-red-50 text-red-700 rounded">
          Error: Department not found
        </div>
      );
    }

    const d = {
      id: dept.id,
      name: dept.name,
      description: dept.description || "",
      createdAt: dept.createdAt || dept.created_at || null,
      updatedAt: dept.updatedAt || dept.updated_at || null,
    };

    // Fetch employees for this department (filtered by emp_department)
    let employees = [];
    try {
      const empRes = await fetchFromApi(
        `${Api_path.EMPLOYEE.LIST}?emp_department=${encodeURIComponent(id)}`
      );
      const empBody = empRes?.data ?? empRes;
      if (empBody && typeof empBody === "object") {
        if (Array.isArray(empBody.data)) {
          employees = empBody.data;
        } else if (Array.isArray(empBody?.data?.data)) {
          employees = empBody.data.data;
        } else if (Array.isArray(empBody)) {
          employees = empBody;
        }
      }
    } catch (err) {
      console.error("Error fetching employees for department:", err);
    }

    return (
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
        {/* Header with Back and Edit buttons */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <Link
            href="/departments"
            className="inline-flex items-center text-base font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Departments
          </Link>
          <Link
            href={`/departments/edit/${d.id}`}
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-500 text-white text-base font-medium hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Department
          </Link>
        </div>

        {/* Main content card */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Department header */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 px-8 py-10 sm:px-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  {d.name}
                </h1>
                <div className="flex items-center gap-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    ID: {d.id}
                  </span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm sm:text-base lg:items-end">
                <div className="bg-white dark:bg-zinc-900 rounded-lg px-5 py-3 shadow-sm border border-zinc-200 dark:border-zinc-700 min-w-40 text-center">
                  <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Created
                  </div>
                  <div className="text-zinc-900 dark:text-zinc-100 font-semibold">
                    {d.createdAt ? new Date(d.createdAt).toLocaleString() : "-"}
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-lg px-5 py-3 shadow-sm border border-zinc-200 dark:border-zinc-700 min-w-40 text-center">
                  <div className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Last Updated
                  </div>
                  <div className="text-zinc-900 dark:text-zinc-100 font-semibold">
                    {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description section */}
          <div className="px-8 py-8 sm:px-10 sm:py-10">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                Description
              </h3>
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {d.description || (
                    <span className="italic text-zinc-500 dark:text-zinc-500">
                      No description provided
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          {/* Employees list section */}
          <div className="px-8 pb-10 sm:px-10 sm:py-10 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Employees
              </h3>
              <div className="text-sm text-zinc-500">
                {employees.length} found
              </div>
            </div>

            {employees.length === 0 ? (
              <div className="text-zinc-600 dark:text-zinc-400 italic">
                No employees in this department.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((emp) => {
                  const fullName =
                    emp.name ||
                    `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
                  return (
                    <Link
                      key={emp.id}
                      href={`/employees/${emp.id}/view`}
                      className="block bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-sm text-zinc-500">
                            {emp.role || "Employee"}
                          </div>
                          <div className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            {fullName || "—"}
                          </div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            {emp?.emp_job_title?.name || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                        <div>
                          <strong className="text-zinc-700 dark:text-zinc-200 mr-2">
                            Email:
                          </strong>
                          {emp.work_email || emp.personal_email || "-"}
                        </div>
                        <div>
                          <strong className="text-zinc-700 dark:text-zinc-200 mr-2">
                            Mobile:
                          </strong>
                          {emp.mobile || emp.office_phone || "-"}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading department:", error);
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded">
        Error loading department
      </div>
    );
  }
}
