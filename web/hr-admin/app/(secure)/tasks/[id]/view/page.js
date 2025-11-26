"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTaskByIdClient, updateTaskClient } from "@/actions/tasks";
import { getEmployeesList } from "@/actions/employees";
import { useTaskStatuses } from "@/actions/task-statuses";
import { useTaskWorkItems } from "@/actions/task-work-items";

export default function TaskViewPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id ? parseInt(params.id, 10) : null;

  const [task, setTask] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWorkItemModal, setShowWorkItemModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [savingEmployees, setSavingEmployees] = useState(false);
  const [newWorkItem, setNewWorkItem] = useState({
    title: "",
    description: "",
    start_date_time: "",
    end_date_time: "",
    estimated_time: "1h",
    employee: null,
    task_status: 1,
  });
  const [submittingWorkItem, setSubmittingWorkItem] = useState(false);
  const [notification, setNotification] = useState(null);

  const { statuses } = useTaskStatuses();
  const {
    workItems,
    loading: workItemsLoading,
    createWorkItem,
    deleteWorkItem,
    refetch: refetchWorkItems,
  } = useTaskWorkItems(taskId);

  console.log(
    "TaskViewPage - taskId:",
    taskId,
    "workItems:",
    workItems,
    "loading:",
    workItemsLoading
  );

  useEffect(() => {
    async function fetchData() {
      if (!taskId) return;

      setLoading(true);
      try {
        const [taskRes, employeesRes] = await Promise.all([
          getTaskByIdClient(taskId),
          getEmployeesList(),
        ]);

        if (taskRes.success) {
          setTask(taskRes.data);
          // Initialize selected employees from task
          setSelectedEmployees(
            Array.isArray(taskRes.data.assigned_employees)
              ? taskRes.data.assigned_employees
              : []
          );
        } else {
          setError(taskRes.error || "Failed to load task");
        }

        if (employeesRes.success) {
          setEmployees(employeesRes.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [taskId]);

  // Auto-dismiss notification after a short time
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  const handleAddWorkItem = async () => {
    if (!newWorkItem.title.trim()) return;

    setSubmittingWorkItem(true);
    try {
      // Use first assigned employee or default to 1
      const assignedEmployees = getAssignedEmployees();
      const employeeId = newWorkItem.employee || assignedEmployees[0]?.id || 1;

      const result = await createWorkItem({
        title: newWorkItem.title,
        description: newWorkItem.description,
        start_date_time:
          newWorkItem.start_date_time || new Date().toISOString().split("T")[0],
        end_date_time:
          newWorkItem.end_date_time || new Date().toISOString().split("T")[0],
        estimated_time: newWorkItem.estimated_time || "1h",
        employee: employeeId,
        task_status: newWorkItem.task_status || 1,
      });

      if (result.success) {
        setNewWorkItem({
          title: "",
          description: "",
          start_date_time: "",
          end_date_time: "",
          estimated_time: "1h",
          employee: null,
          task_status: 1,
        });
        setShowWorkItemModal(false);
        refetchWorkItems();
      } else {
        alert(result.error || "Failed to add work item");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingWorkItem(false);
    }
  };

  const handleDeleteWorkItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this work item?")) return;

    const result = await deleteWorkItem(itemId);
    if (!result.success) {
      alert(result.error || "Failed to delete work item");
    }
  };

  const handleSaveEmployees = async () => {
    setSavingEmployees(true);
    try {
      console.log("Selected Employees before save:", selectedEmployees);
      const assignedEmployeesArray = selectedEmployees.map((id) => Number(id));
      console.log("Assigned Employees Array:", assignedEmployeesArray);

      // Format dates properly
      const formatDateForAPI = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr.includes("T")) return dateStr.split("T")[0];
        return dateStr;
      };

      const payload = {
        title: task.title,
        description: task.description,
        start_date_time: formatDateForAPI(task.start_date_time),
        end_date_time: formatDateForAPI(task.end_date_time),
        estimated_time: task.estimated_time,
        assigned_employees: assignedEmployeesArray,
        task_status:
          typeof task.task_status === "object"
            ? Number(task.task_status.id)
            : Number(task.task_status),
      };

      console.log("Save Employees Payload:", JSON.stringify(payload, null, 2));
      const result = await updateTaskClient(taskId, payload);
      console.log("Update result:", result);

      if (result.success) {
        console.log("Update successful, refetching task...");
        // Refetch task data to ensure consistency
        const taskRes = await getTaskByIdClient(taskId);
        console.log("Refetched task:", taskRes);

        if (taskRes.success) {
          console.log("Task data:", taskRes.data);
          console.log(
            "Assigned employees from API:",
            taskRes.data.assigned_employees
          );
          setTask(taskRes.data);
          setSelectedEmployees(
            Array.isArray(taskRes.data.assigned_employees)
              ? taskRes.data.assigned_employees
              : []
          );
          setShowAddMemberModal(false);
          setNotification({
            type: "success",
            message: "Team members updated successfully!",
          });
        } else {
          alert("Failed to refresh task data");
        }
      } else {
        console.error("Update failed:", result.error);
        alert(result.error || "Failed to update team members");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingEmployees(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusInfo = () => {
    if (!task?.task_status) return { name: "Unknown", color: "bg-gray-500" };

    const statusId =
      typeof task.task_status === "object"
        ? task.task_status.id
        : task.task_status;
    const status = statuses.find((s) => s.id === statusId);

    if (!status) return { name: "Unknown", color: "bg-gray-500" };

    const colorMap = {
      Open: "bg-blue-500",
      "In Progress": "bg-yellow-500",
      Completed: "bg-green-500",
      Closed: "bg-gray-500",
      Cancelled: "bg-red-500",
    };

    return {
      name: status.name,
      color: colorMap[status.name] || "bg-purple-500",
    };
  };

  const getPriorityInfo = () => {
    // You can extend this based on your backend priority field
    return { label: "Low", color: "bg-green-100 text-green-800" };
  };

  const getAssignedEmployees = () => {
    if (!task?.assigned_employees || !Array.isArray(task.assigned_employees))
      return [];

    return task.assigned_employees.map((empId) => {
      const emp = employees.find((e) => e.id === empId);
      return (
        emp || {
          id: empId,
          name: "Unknown",
          firstName: "Unknown",
          lastName: "",
        }
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Task
          </h2>
          <p className="text-gray-600 mb-4">{error || "Task not found"}</p>
          <button
            onClick={() => router.push("/tasks")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const priorityInfo = getPriorityInfo();
  const assignedEmployees = getAssignedEmployees();

  console.log("Render - task.assigned_employees:", task?.assigned_employees);
  console.log("Render - assignedEmployees:", assignedEmployees);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 lg:py-5">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Left side - Back button and Title */}
            <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
              <button
                onClick={() => router.push("/tasks")}
                className="p-2 lg:p-2.5 hover:bg-slate-100 rounded-lg transition-colors group"
                title="Back to tasks"
              >
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600 group-hover:text-slate-900 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                <div className="p-2.5 lg:p-3 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                  <svg
                    className="w-5 h-5 lg:w-6 lg:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 truncate tracking-tight">
                    Task Details
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-500 font-medium">
                    View and manage task information
                  </p>
                </div>
              </div>
            </div>
            {/* Right side - Action button */}
            <button
              onClick={() => router.push(`/tasks/${taskId}/edit`)}
              className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-semibold text-sm lg:text-base"
            >
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
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
              <span className="hidden sm:inline">Edit Task</span>
              <span className="sm:hidden">Edit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content - 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Task Title & Description */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 lg:p-8 border border-slate-200">
              <div className="flex items-start justify-between gap-3 lg:gap-4 mb-4 lg:mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 flex-1 leading-tight tracking-tight">
                  {task.title}
                </h2>
                <span
                  className={`shrink-0 ${statusInfo.color} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm`}
                >
                  {statusInfo.name}
                </span>
              </div>
              <div className="prose max-w-none">
                <h3 className="text-xs sm:text-sm lg:text-base font-bold text-slate-700 uppercase tracking-wider mb-3 lg:mb-4 flex items-center gap-2">
                  <span className="text-blue-600">Description</span>
                  <button
                    onClick={() => router.push(`/tasks/${taskId}/edit`)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit description"
                  >
                    <svg
                      className="w-4 h-4"
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
                  </button>
                </h3>
                <div className="text-slate-700 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 sm:p-4 lg:p-6 rounded-lg border border-slate-200 font-normal">
                  {task.description || "No description provided."}
                </div>
              </div>
            </div>

            {/* Work Items */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 lg:p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-4 lg:mb-6 flex-wrap gap-3">
                <h3 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2 lg:gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  <span>Work Items</span>
                  <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {workItems.length}
                  </span>
                </h3>
                <button
                  onClick={() => setShowWorkItemModal(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm shadow-md hover:shadow-lg"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="hidden sm:inline">Add Work Item</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>

              {workItemsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-3 text-sm text-slate-500">
                    Loading work items...
                  </p>
                </div>
              ) : workItems.length === 0 ? (
                <div className="text-center py-16 bg-linear-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300">
                  <svg
                    className="w-20 h-20 text-slate-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-slate-600 font-medium text-base">
                    No work items yet
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    Break down this task into smaller work items
                  </p>
                </div>
              ) : (
                <div className="space-y-3 lg:space-y-4">
                  {workItems.map((item, index) => {
                    const statusId =
                      typeof item.task_status === "object"
                        ? item.task_status?.id
                        : item.task_status;
                    const statusObj = statuses.find((s) => s.id === statusId);
                    const statusName = statusObj?.name || "Unknown";

                    return (
                      <div
                        key={item.id}
                        className="group flex items-start gap-3 lg:gap-4 p-3 sm:p-4 lg:p-5 bg-linear-to-r from-white to-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm lg:text-base shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 mb-1 lg:mb-2 text-sm sm:text-base lg:text-lg leading-tight">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                            {item.estimated_time && (
                              <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {item.estimated_time}
                              </span>
                            )}
                            {item.start_date_time && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded">
                                Start: {formatDate(item.start_date_time)}
                              </span>
                            )}
                            {item.end_date_time && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded">
                                Due: {formatDate(item.end_date_time)}
                              </span>
                            )}
                          </div>
                          <span
                            className={`inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full ${
                              statusName === "Completed"
                                ? "bg-green-100 text-green-700"
                                : statusName === "In Progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : statusName === "Open"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {statusName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteWorkItem(item.id)}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete work item"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Status and Team */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Status Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 lg:p-8 border border-slate-200">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Task Status
              </h3>
              <div className="flex items-center justify-center mb-6 lg:mb-8">
                <span
                  className={`${statusInfo.color} text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-full font-bold text-base lg:text-lg shadow-lg`}
                >
                  {statusInfo.name}
                </span>
              </div>

              <div className="space-y-3 lg:space-y-3.5">
                <div className="flex items-center gap-3 lg:gap-4 p-2.5 lg:p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-green-500 rounded-full shrink-0"></div>
                  <span className="text-xs sm:text-sm lg:text-base text-slate-600 font-semibold">
                    Priority
                  </span>
                  <span
                    className={`ml-auto px-2.5 py-1 rounded-full text-xs font-semibold ${priorityInfo.color}`}
                  >
                    {priorityInfo.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                  <span className="text-xs sm:text-sm text-slate-600 font-medium">
                    Start Date
                  </span>
                  <span className="ml-auto text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {formatDate(task.start_date_time)}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0"></div>
                  <span className="text-xs sm:text-sm text-slate-600 font-medium">
                    Due Date
                  </span>
                  <span className="ml-auto text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {formatDate(task.end_date_time)}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0"></div>
                  <span className="text-xs sm:text-sm text-slate-600 font-medium">
                    Est. Time
                  </span>
                  <span className="ml-auto text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {task.estimated_time || "Not set"}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full shrink-0"></div>
                  <span className="text-xs sm:text-sm text-slate-600 font-medium">
                    Created by
                  </span>
                  <span className="ml-auto text-xs sm:text-sm font-semibold text-slate-900">
                    Admin
                  </span>
                </div>
              </div>
            </div>

            {/* Team Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 lg:p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2 lg:gap-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Team</span>
                </h3>
                <span className="text-xs sm:text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-semibold">
                  {assignedEmployees.length}{" "}
                  {assignedEmployees.length === 1 ? "member" : "members"}
                </span>
              </div>

              {assignedEmployees.length === 0 ? (
                <div className="text-center py-10 bg-linear-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <svg
                    className="w-16 h-16 text-slate-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-slate-600">
                    No team members
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Assign members to this task
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 lg:space-y-3">
                  {assignedEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-3 lg:gap-4 p-2.5 sm:p-3 lg:p-4 bg-linear-to-r from-slate-50 to-white rounded-lg hover:bg-slate-100 transition-colors border border-slate-100"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-sm shrink-0">
                        {(
                          emp.firstName?.[0] ||
                          emp.name?.[0] ||
                          "U"
                        ).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate text-sm lg:text-base">
                          {emp.name ||
                            `${emp.firstName} ${emp.lastName}`.trim() ||
                            "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {emp.email || "No email"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowAddMemberModal(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-medium text-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Manage Team Members
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Work Item Modal */}
      {showWorkItemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-scaleIn my-8 border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                Add Work Item
              </h3>
              <button
                onClick={() => setShowWorkItemModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newWorkItem.title}
                    onChange={(e) =>
                      setNewWorkItem({ ...newWorkItem, title: e.target.value })
                    }
                    placeholder="Enter work item title"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newWorkItem.description}
                    onChange={(e) =>
                      setNewWorkItem({
                        ...newWorkItem,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter work item description (optional)"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
                    rows="3"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newWorkItem.start_date_time}
                    onChange={(e) =>
                      setNewWorkItem({
                        ...newWorkItem,
                        start_date_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newWorkItem.end_date_time}
                    onChange={(e) =>
                      setNewWorkItem({
                        ...newWorkItem,
                        end_date_time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    value={newWorkItem.estimated_time}
                    onChange={(e) =>
                      setNewWorkItem({
                        ...newWorkItem,
                        estimated_time: e.target.value,
                      })
                    }
                    placeholder="e.g., 2h 30m"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newWorkItem.task_status}
                    onChange={(e) =>
                      setNewWorkItem({
                        ...newWorkItem,
                        task_status: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  >
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Assign to Employee
                  </label>
                  <select
                    value={newWorkItem.employee || ""}
                    onChange={(e) =>
                      setNewWorkItem({
                        ...newWorkItem,
                        employee: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  >
                    <option value="">Select employee (or use default)</option>
                    {getAssignedEmployees().map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || `${emp.firstName} ${emp.lastName}`.trim()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowWorkItemModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                disabled={submittingWorkItem}
              >
                Cancel
              </button>
              <button
                onClick={handleAddWorkItem}
                disabled={submittingWorkItem || !newWorkItem.title.trim()}
                className="flex-1 px-4 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-medium"
              >
                {submittingWorkItem ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  "Add Work Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-scaleIn border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                Manage Team Members
              </h3>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedEmployees(
                    Array.isArray(task?.assigned_employees)
                      ? task.assigned_employees
                      : []
                  );
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-600">
                Search and select employees to assign to this task.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                  {selectedEmployees.length} selected
                </span>
                {selectedEmployees.length > 0 && (
                  <span className="text-slate-500">
                    IDs: [{selectedEmployees.join(", ")}]
                  </span>
                )}
              </div>
            </div>

            <AssignedEmployeesSelect
              employees={employees}
              value={selectedEmployees}
              onChange={(newValue) => {
                console.log("Modal onChange called with:", newValue);
                setSelectedEmployees(newValue);
              }}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setSelectedEmployees(
                    Array.isArray(task?.assigned_employees)
                      ? task.assigned_employees
                      : []
                  );
                }}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                disabled={savingEmployees}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmployees}
                disabled={savingEmployees}
                className="flex-1 px-4 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-medium"
              >
                {savingEmployees ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Team"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slideInRight">
          <div
            className={`min-w-[300px] max-w-md px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
              notification.type === "success"
                ? "bg-green-600 text-white border-green-700"
                : "bg-red-600 text-white border-red-700"
            }`}
            role="status"
          >
            {notification.type === "success" ? (
              <svg
                className="w-5 h-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <div className="flex-1 font-medium text-sm">
              {notification.message}
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-white/90 hover:text-white font-bold text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Employee selection component (same as in edit page)
function AssignedEmployeesSelect({ employees = [], value = [], onChange }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef(null);

  React.useEffect(() => {
    function handleDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (!query) return employees;
    const q = query.toLowerCase();
    return employees.filter((e) => {
      const name = (
        e.firstName ? `${e.firstName} ${e.lastName || ""}` : e.name || ""
      ).toLowerCase();
      const email = (e.email || "").toLowerCase();
      return name.includes(q) || email.includes(q) || String(e.id).includes(q);
    });
  }, [employees, query]);

  function add(id) {
    console.log("Adding employee:", id, "Current value:", value);
    if ((value || []).includes(id)) {
      console.log("Employee already selected");
      return;
    }
    const newValue = [...(value || []), id];
    console.log("New value:", newValue);
    onChange(newValue);
    setQuery("");
    // Keep dropdown open to allow adding multiple employees
  }

  function remove(id) {
    console.log("Removing employee:", id);
    const newValue = (value || []).filter((v) => v !== id);
    console.log("New value after removal:", newValue);
    onChange(newValue);
  }

  return (
    <div className="relative" ref={rootRef}>
      <div className="flex flex-wrap gap-2 items-center border-2 border-slate-300 rounded-lg px-3 py-3 min-h-14 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
        {(value || []).map((id) => {
          const emp = employees.find((e) => e.id === id) || {
            id,
            name: `#${id}`,
          };
          const label = emp.firstName
            ? `${emp.firstName} ${emp.lastName || ""}`
            : emp.name || emp.email || `#${id}`;
          return (
            <span
              key={id}
              className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold shadow-sm"
            >
              <span>{label}</span>
              <button
                type="button"
                onClick={() => remove(id)}
                className="text-blue-600 hover:text-blue-900 font-bold text-lg leading-none hover:bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </span>
          );
        })}

        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Search employees..."
          className="flex-1 min-w-[200px] outline-none border-none px-2 py-1 text-sm"
        />
      </div>

      {open && filtered && filtered.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white border-2 border-slate-200 rounded-xl shadow-2xl max-h-72 overflow-auto">
          {filtered.map((e) => {
            const label = e.firstName
              ? `${e.firstName} ${e.lastName || ""}`
              : e.name || e.email || `#${e.id}`;
            const isSelected = (value || []).includes(e.id);
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => add(e.id)}
                className={`w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 border-b border-slate-100 last:border-b-0 transition-colors ${
                  isSelected ? "bg-blue-50" : ""
                }`}
              >
                <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0">
                  {(e.firstName?.[0] || e.name?.[0] || "U").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {label}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {e.email || "No email"}
                  </div>
                </div>
                {isSelected && (
                  <svg
                    className="w-5 h-5 text-blue-600 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
