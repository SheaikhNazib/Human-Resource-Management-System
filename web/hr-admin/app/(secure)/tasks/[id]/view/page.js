"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTaskByIdClient, updateTaskClient } from '@/actions/tasks';
import { getEmployeesList } from '@/actions/employees';
import { useTaskStatuses } from '@/actions/task-statuses';
import { useTaskWorkItems } from '@/actions/task-work-items';

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
        title: '',
        description: '',
        start_date_time: '',
        end_date_time: '',
        estimated_time: '1h',
        employee: null,
        task_status: 1
    });
    const [submittingWorkItem, setSubmittingWorkItem] = useState(false);

    const { statuses } = useTaskStatuses();
    const { workItems, loading: workItemsLoading, createWorkItem, deleteWorkItem, refetch: refetchWorkItems } = useTaskWorkItems(taskId);

    console.log('TaskViewPage - taskId:', taskId, 'workItems:', workItems, 'loading:', workItemsLoading);

    useEffect(() => {
        async function fetchData() {
            if (!taskId) return;

            setLoading(true);
            try {
                const [taskRes, employeesRes] = await Promise.all([
                    getTaskByIdClient(taskId),
                    getEmployeesList()
                ]);

                if (taskRes.success) {
                    setTask(taskRes.data);
                    // Initialize selected employees from task
                    setSelectedEmployees(Array.isArray(taskRes.data.assigned_employees) ? taskRes.data.assigned_employees : []);
                } else {
                    setError(taskRes.error || 'Failed to load task');
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
                start_date_time: newWorkItem.start_date_time || new Date().toISOString().split('T')[0],
                end_date_time: newWorkItem.end_date_time || new Date().toISOString().split('T')[0],
                estimated_time: newWorkItem.estimated_time || '1h',
                employee: employeeId,
                task_status: newWorkItem.task_status || 1
            });

            if (result.success) {
                setNewWorkItem({
                    title: '',
                    description: '',
                    start_date_time: '',
                    end_date_time: '',
                    estimated_time: '1h',
                    employee: null,
                    task_status: 1
                });
                setShowWorkItemModal(false);
                refetchWorkItems();
            } else {
                alert(result.error || 'Failed to add work item');
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmittingWorkItem(false);
        }
    };

    const handleDeleteWorkItem = async (itemId) => {
        if (!confirm('Are you sure you want to delete this work item?')) return;

        const result = await deleteWorkItem(itemId);
        if (!result.success) {
            alert(result.error || 'Failed to delete work item');
        }
    };

    const handleSaveEmployees = async () => {
        setSavingEmployees(true);
        try {
            console.log('Selected Employees before save:', selectedEmployees);
            const assignedEmployeesArray = selectedEmployees.map(id => Number(id));
            console.log('Assigned Employees Array:', assignedEmployeesArray);
            
            // Format dates properly
            const formatDateForAPI = (dateStr) => {
                if (!dateStr) return null;
                if (dateStr.includes('T')) return dateStr.split('T')[0];
                return dateStr;
            };
            
            const payload = {
                title: task.title,
                description: task.description,
                start_date_time: formatDateForAPI(task.start_date_time),
                end_date_time: formatDateForAPI(task.end_date_time),
                estimated_time: task.estimated_time,
                assigned_employees: assignedEmployeesArray,
                task_status: typeof task.task_status === 'object' ? Number(task.task_status.id) : Number(task.task_status),
            };

            console.log('Save Employees Payload:', JSON.stringify(payload, null, 2));
            const result = await updateTaskClient(taskId, payload);
            console.log('Update result:', result);
            
            if (result.success) {
                console.log('Update successful, refetching task...');
                // Refetch task data to ensure consistency
                const taskRes = await getTaskByIdClient(taskId);
                console.log('Refetched task:', taskRes);
                
                if (taskRes.success) {
                    console.log('Task data:', taskRes.data);
                    console.log('Assigned employees from API:', taskRes.data.assigned_employees);
                    setTask(taskRes.data);
                    setSelectedEmployees(Array.isArray(taskRes.data.assigned_employees) ? taskRes.data.assigned_employees : []);
                    setShowAddMemberModal(false);
                    alert('Team members updated successfully!');
                } else {
                    alert('Failed to refresh task data');
                }
            } else {
                console.error('Update failed:', result.error);
                alert(result.error || 'Failed to update team members');
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setSavingEmployees(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not set';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusInfo = () => {
        if (!task?.task_status) return { name: 'Unknown', color: 'bg-gray-500' };

        const statusId = typeof task.task_status === 'object' ? task.task_status.id : task.task_status;
        const status = statuses.find(s => s.id === statusId);

        if (!status) return { name: 'Unknown', color: 'bg-gray-500' };

        const colorMap = {
            'Open': 'bg-blue-500',
            'In Progress': 'bg-yellow-500',
            'Completed': 'bg-green-500',
            'Closed': 'bg-gray-500',
            'Cancelled': 'bg-red-500',
        };

        return {
            name: status.name,
            color: colorMap[status.name] || 'bg-purple-500'
        };
    };

    const getPriorityInfo = () => {
        // You can extend this based on your backend priority field
        return { label: 'Low', color: 'bg-green-100 text-green-800' };
    };

    const getAssignedEmployees = () => {
        if (!task?.assigned_employees || !Array.isArray(task.assigned_employees)) return [];

        return task.assigned_employees.map(empId => {
            const emp = employees.find(e => e.id === empId);
            return emp || { id: empId, name: 'Unknown', firstName: 'Unknown', lastName: '' };
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Task</h2>
                    <p className="text-gray-600 mb-4">{error || 'Task not found'}</p>
                    <button
                        onClick={() => router.push('/tasks')}
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
    
    console.log('Render - task.assigned_employees:', task?.assigned_employees);
    console.log('Render - assignedEmployees:', assignedEmployees);

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/tasks')}
                            className="p-2 hover:bg-white rounded-lg transition shadow-sm"
                            title="Back to tasks"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/tasks/${taskId}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task Title & Description */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{task.title}</h2>
                            <div className="prose max-w-none">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <span className="text-purple-600">Description</span>
                                    <button
                                        onClick={() => router.push(`/tasks/${taskId}/edit`)}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Edit description"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </h3>
                                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    {task.description || 'No description provided.'}
                                </div>
                            </div>
                        </div>

                        {/* Work Items */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    Work Items
                                    <span className="text-sm font-normal text-gray-500">
                                        Total: {workItems.length}
                                    </span>
                                </h3>
                                <button
                                    onClick={() => setShowWorkItemModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Work Item
                                </button>
                            </div>

                            {workItemsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                </div>
                            ) : workItems.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 font-medium">No work items available.</p>
                                    <p className="text-gray-400 text-sm mt-1">Add your first work item to get started.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {workItems.map((item, index) => {
                                        const statusId = typeof item.task_status === 'object' ? item.task_status?.id : item.task_status;
                                        const statusObj = statuses.find(s => s.id === statusId);
                                        const statusName = statusObj?.name || 'Unknown';

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-start gap-3 p-4 bg-linear-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition group"
                                            >
                                                <div className="shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                                                    {item.description && (
                                                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                                    )}
                                                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                                        {item.estimated_time && (
                                                            <span className="flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {item.estimated_time}
                                                            </span>
                                                        )}
                                                        {item.start_date_time && (
                                                            <span>Start: {formatDate(item.start_date_time)}</span>
                                                        )}
                                                        {item.end_date_time && (
                                                            <span>Due: {formatDate(item.end_date_time)}</span>
                                                        )}
                                                    </div>
                                                    <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${statusName === 'Completed' ? 'bg-green-100 text-green-800' :
                                                            statusName === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                                                statusName === 'Open' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {statusName}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteWorkItem(item.id)}
                                                    className="shrink-0 opacity-0 group-hover:opacity-100 transition p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete work item"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
                            <div className="flex items-center justify-center">
                                <span className={`${statusInfo.color} text-white px-6 py-2 rounded-full font-semibold text-lg shadow-lg`}>
                                    {statusInfo.name}
                                </span>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Priority:</span>
                                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                                        {priorityInfo.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Start:</span>
                                    <span className="ml-auto text-sm font-medium text-gray-900">
                                        {formatDate(task.start_date_time)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Due:</span>
                                    <span className="ml-auto text-sm font-medium text-gray-900">
                                        {formatDate(task.end_date_time)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Estimated Time:</span>
                                    <span className="ml-auto text-sm font-medium text-gray-900">
                                        {task.estimated_time || 'Not set'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Created by:</span>
                                    <span className="ml-auto text-sm font-medium text-gray-900">
                                        Admin
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Team Card */}
                        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Team</h3>
                                <span className="text-sm text-gray-500">- {assignedEmployees.length}</span>
                            </div>

                            {assignedEmployees.length === 0 ? (
                                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="text-sm text-gray-500">No team members assigned</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {assignedEmployees.map((emp) => (
                                        <div key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                            <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                                {(emp.firstName?.[0] || emp.name?.[0] || 'U').toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate">
                                                    {emp.name || `${emp.firstName} ${emp.lastName}`.trim() || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{emp.email || 'No email'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button 
                                onClick={() => setShowAddMemberModal(true)}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Add Member
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Add Work Item Modal */}
            {showWorkItemModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-scaleIn my-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Add Work Item</h3>
                            <button
                                onClick={() => setShowWorkItemModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={newWorkItem.title}
                                        onChange={(e) => setNewWorkItem({ ...newWorkItem, title: e.target.value })}
                                        placeholder="Enter work item title"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={newWorkItem.description}
                                        onChange={(e) => setNewWorkItem({ ...newWorkItem, description: e.target.value })}
                                        placeholder="Enter work item description (optional)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows="3"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={newWorkItem.start_date_time}
                                        onChange={(e) => setNewWorkItem({ ...newWorkItem, start_date_time: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={newWorkItem.end_date_time}
                                        onChange={(e) => setNewWorkItem({ ...newWorkItem, end_date_time: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Time</label>
                                    <input
                                        type="text"
                                        value={newWorkItem.estimated_time}
                                        onChange={(e) => setNewWorkItem({ ...newWorkItem, estimated_time: e.target.value })}
                                        placeholder="e.g., 2h 30m"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                    <select
                                        value={newWorkItem.task_status}
                                        onChange={(e) => setNewWorkItem({ ...newWorkItem, task_status: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status.id} value={status.id}>
                                                {status.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to Employee</label>
                                    <select
                                        value={newWorkItem.employee || ''}
                                        onChange={(e) => setNewWorkItem({ ...newWorkItem, employee: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                disabled={submittingWorkItem}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddWorkItem}
                                disabled={submittingWorkItem || !newWorkItem.title.trim()}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                {submittingWorkItem ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-scaleIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Manage Team Members</h3>
                            <button
                                onClick={() => {
                                    setShowAddMemberModal(false);
                                    setSelectedEmployees(Array.isArray(task?.assigned_employees) ? task.assigned_employees : []);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg transition"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Search and add employees to this task. Click on employees to add/remove them.</p>
                            <p className="text-xs text-blue-600 mt-1">Selected: {selectedEmployees.length} employees - IDs: [{selectedEmployees.join(', ')}]</p>
                        </div>

                        <AssignedEmployeesSelect
                            employees={employees}
                            value={selectedEmployees}
                            onChange={(newValue) => {
                                console.log('Modal onChange called with:', newValue);
                                setSelectedEmployees(newValue);
                            }}
                        />

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAddMemberModal(false);
                                    setSelectedEmployees(Array.isArray(task?.assigned_employees) ? task.assigned_employees : []);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                disabled={savingEmployees}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEmployees}
                                disabled={savingEmployees}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                {savingEmployees ? 'Saving...' : 'Save Team'}
                            </button>
                        </div>
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
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('click', handleDocClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('click', handleDocClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    const filtered = React.useMemo(() => {
        if (!query) return employees;
        const q = query.toLowerCase();
        return employees.filter((e) => {
            const name = (e.firstName ? `${e.firstName} ${e.lastName || ''}` : e.name || '').toLowerCase();
            const email = (e.email || '').toLowerCase();
            return name.includes(q) || email.includes(q) || String(e.id).includes(q);
        });
    }, [employees, query]);

    function add(id) {
        console.log('Adding employee:', id, 'Current value:', value);
        if ((value || []).includes(id)) {
            console.log('Employee already selected');
            return;
        }
        const newValue = [...(value || []), id];
        console.log('New value:', newValue);
        onChange(newValue);
        setQuery("");
        // Keep dropdown open to allow adding multiple employees
    }

    function remove(id) {
        console.log('Removing employee:', id);
        const newValue = (value || []).filter((v) => v !== id);
        console.log('New value after removal:', newValue);
        onChange(newValue);
    }

    return (
        <div className="relative" ref={rootRef}>
            <div className="flex flex-wrap gap-2 items-center border-2 border-gray-300 rounded-lg px-3 py-3 min-h-[50px] bg-white">
                {(value || []).map((id) => {
                    const emp = employees.find((e) => e.id === id) || { id, name: `#${id}` };
                    const label = emp.firstName ? `${emp.firstName} ${emp.lastName || ''}` : emp.name || emp.email || `#${id}`;
                    return (
                        <span key={id} className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
                            <span>{label}</span>
                            <button type="button" onClick={() => remove(id)} className="text-blue-600 hover:text-blue-900 font-bold text-lg leading-none">×</button>
                        </span>
                    );
                })}

                <input
                    value={query}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    placeholder="Search employees..."
                    className="flex-1 min-w-[200px] outline-none border-none px-2 py-1"
                />
            </div>

            {open && filtered && filtered.length > 0 && (
                <div className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                    {filtered.map((e) => {
                        const label = e.firstName ? `${e.firstName} ${e.lastName || ''}` : e.name || e.email || `#${e.id}`;
                        const isSelected = (value || []).includes(e.id);
                        return (
                            <button
                                key={e.id}
                                type="button"
                                onClick={() => add(e.id)}
                                className={`w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}
                            >
                                <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {(e.firstName?.[0] || e.name?.[0] || 'U').toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{label}</div>
                                    <div className="text-xs text-gray-500">{e.email || 'No email'}</div>
                                </div>
                                {isSelected && (
                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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