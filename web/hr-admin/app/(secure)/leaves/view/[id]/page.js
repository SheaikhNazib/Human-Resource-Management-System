"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLeaveById } from "@/actions/leaves/server-actions";
import LeaveStatusDropdown from "@/components/LeaveStatusDropdown";
import { useLeaves } from "@/actions/leaves/business";
import { AlertCircle, Calendar, Clock, FileText, User } from "lucide-react";

const LeaveDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const { updateLeaveStatus } = useLeaves();
    const [leave, setLeave] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeave = async () => {
            if (!params.id) return;

            setLoading(true);
            setError(null);

            try {
                const response = await getLeaveById(params.id);

                if (response.success) {
                    setLeave(response.data);
                } else {
                    setError(response.error || "Failed to fetch leave details");
                }
            } catch (err) {
                setError(err.message || "An unexpected error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchLeave();
    }, [params.id]);

    const handleStatusChange = async (leaveId, newStatus) => {
        const result = await updateLeaveStatus(leaveId, newStatus, "Admin");
        if (result.success) {
            // Update local state
            setLeave((prev) => ({ ...prev, status: newStatus }));
        } else {
            alert(result.error || "Failed to update status");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 dark:text-zinc-300 font-medium">
                        Loading leave details...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !leave) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-2">
                        Error
                    </h2>
                    <p className="text-gray-600 dark:text-zinc-400 mb-6">
                        {error || "Leave request not found"}
                    </p>
                    <button
                        onClick={() => router.push("/leaves")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                        Back to Leaves
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Not specified";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "Not specified";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const calculateDuration = () => {
        const start = leave.startDate || leave.raw?.start_date;
        const end = leave.endDate || leave.raw?.end_date;
        if (!start || !end) return "Not calculated";

        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    };

    const getLeaveTypeColor = (type) => {
        const colors = {
            sick: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            vacation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            personal: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            casual: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            annual: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        };
        return colors[type?.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 px-4 py-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-2xl overflow-hidden mb-6">
                    <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">
                                    Leave Request Details
                                </h1>
                                <p className="text-blue-100 text-sm">Request ID: #{leave.id}</p>
                            </div>
                            <button
                                onClick={() => router.push("/leaves")}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all backdrop-blur-sm"
                            >
                                ← Back to Leaves
                            </button>
                        </div>
                    </div>

                    {/* Employee Info Section */}
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-zinc-700">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                                    {leave.employeeName}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-zinc-400">
                                    Employee ID: {leave.employeeId}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Leave Type and Status */}
                    <div className="px-6 py-5 bg-gray-50 dark:bg-zinc-900/50 grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                                Status
                            </label>
                            <LeaveStatusDropdown
                                currentStatus={leave.status}
                                onStatusChange={handleStatusChange}
                                leaveId={leave.id}
                            />
                        </div>
                    </div>
                </div>

                {/* Leave Details Card */}
                <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-2xl overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Leave Duration
                        </h3>
                    </div>
                    <div className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                                    Start Date
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-zinc-100">
                                    {formatDate(leave.startDate)}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                                    End Date
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-zinc-100">
                                    {formatDate(leave.endDate)}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                                    Total Duration
                                </label>
                                <p className="text-base font-medium text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    {calculateDuration()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reason Card */}
                <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-2xl overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Reason for Leave
                        </h3>
                    </div>
                    <div className="px-6 py-5">
                        <p className="text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {leave.reason || "No reason provided"}
                        </p>
                    </div>
                </div>


                {/* Metadata */}
                <div className="mt-6 text-center text-sm text-gray-500 dark:text-zinc-500">
                    <p>
                        Request submitted on{" "}
                        {formatDateTime(leave.createdAt || leave.raw?.created_at)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LeaveDetailPage;
