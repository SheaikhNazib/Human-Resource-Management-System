"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSalaryCompensationById } from "@/actions/salary-compensations/server-actions";
import { getEmployeeById } from "@/actions/employees/server-actions";
import {
  AlertCircle,
  ChevronLeft,
  Edit,
  DollarSign,
  Calendar,
  FileText,
  User,
  TrendingUp,
  TrendingDown,
  Award,
  Plus,
  Minus,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import { toast } from "sonner";

const SalaryCompensationViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const [compensation, setCompensation] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getSalaryCompensationById(params.id);

        if (response.success) {
          setCompensation(response.data);
          
          // Fetch employee details if employeeId is available
          if (response.data.employeeId) {
            const empResponse = await getEmployeeById(response.data.employeeId);
            if (empResponse.success) {
              setEmployee(empResponse.data);
            }
          }
        } else {
          setError(response.error || "Failed to fetch salary compensation details");
          toast.error(response.error || "Failed to fetch salary compensation details");
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        toast.error(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0.00";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = () => {
    if (!employee) return "?";
    const first = employee.first_name || compensation?.employeeName?.split(' ')[0] || "";
    const last = employee.last_name || compensation?.employeeName?.split(' ')[1] || "";
    return `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "?";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} />
          <p className="mt-4 text-gray-600 dark:text-zinc-400 font-medium">
            Loading salary compensation details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !compensation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-zinc-800">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-zinc-400 mb-6">
            {error || "Salary compensation record not found"}
          </p>
          <button
            onClick={() => router.push("/salary-compensations/salary-list")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Back to Salary List
          </button>
        </div>
      </div>
    );
  }

  const payableDate = compensation.payableDate ? new Date(compensation.payableDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let paymentStatus = "Pending";
  let statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  
  if (payableDate) {
    if (payableDate <= today) {
      paymentStatus = "Paid";
      statusColor = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    } else {
      paymentStatus = "Scheduled";
      statusColor = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 shadow-lg border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {getInitials()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-zinc-100">
                  Salary Compensation Details
                </h1>
                <p className="text-gray-600 dark:text-zinc-400 text-sm md:text-base mt-1">
                  {compensation.employeeName || "Unknown Employee"}
                </p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                  {paymentStatus}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/salary-compensations/salary-list")}
                className="inline-flex items-center gap-2 h-10 px-3 bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Back to List</span>
              </button>
              <button
                onClick={() => router.push(`/salary-compensations/edit/${compensation.id}`)}
                className="inline-flex items-center gap-2 h-10 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-shadow shadow-md"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Net Salary Card - Prominent */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-emerald-100 text-sm font-medium mb-2">Net Salary</div>
              <div className="text-5xl font-bold">{formatCurrency(compensation.netSalary)}</div>
              <div className="text-emerald-100 text-sm mt-2">
                After all additions and deductions
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
              <DollarSign className="w-12 h-12" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Salary Breakdown */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Salary Breakdown
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">Base Salary</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500">Primary compensation</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  {formatCurrency(compensation.baseSalary)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">Bonus</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500">Performance incentive</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  +{formatCurrency(compensation.bonus)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">Allowance</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500">Additional benefits</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  +{formatCurrency(compensation.allowance)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Minus className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">Deduction</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500">Taxes & withholdings</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  -{formatCurrency(compensation.deduction)}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                  Calculation:
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 text-right">
                  ${compensation.baseSalary?.toFixed(2) || "0.00"} + ${compensation.bonus?.toFixed(2) || "0.00"} + ${compensation.allowance?.toFixed(2) || "0.00"} - ${compensation.deduction?.toFixed(2) || "0.00"}
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Important Dates
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-900/30">
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                  Effective Date
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  {formatDate(compensation.effectiveDate)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  When this compensation takes effect
                </div>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-200 dark:border-indigo-900/30">
                <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                  Payable Date
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  {formatDate(compensation.payableDate)}
                </div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                  Scheduled payment date
                </div>
              </div>
            </div>

            {/* Employee Information */}
            {employee && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-zinc-400">Name:</span>
                    <span className="font-medium text-gray-900 dark:text-zinc-100">
                      {employee.first_name} {employee.last_name}
                    </span>
                  </div>
                  {employee.work_email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-zinc-400">Email:</span>
                      <span className="font-medium text-gray-900 dark:text-zinc-100">
                        {employee.work_email}
                      </span>
                    </div>
                  )}
                  {employee.emp_job_title?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-zinc-400">Position:</span>
                      <span className="font-medium text-gray-900 dark:text-zinc-100">
                        {employee.emp_job_title.name}
                      </span>
                    </div>
                  )}
                  {employee.emp_department?.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-zinc-400">Department:</span>
                      <span className="font-medium text-gray-900 dark:text-zinc-100">
                        {employee.emp_department.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remarks Section */}
        {compensation.remarks && (
          <div className="mt-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Remarks
            </h2>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/30">
              <p className="text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">
                {compensation.remarks}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-6 bg-gray-100 dark:bg-zinc-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {compensation.createdAt && (
              <div>
                <span className="text-gray-600 dark:text-zinc-400">Created:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-zinc-100">
                  {new Date(compensation.createdAt).toLocaleString()}
                </span>
              </div>
            )}
            {compensation.updatedAt && (
              <div>
                <span className="text-gray-600 dark:text-zinc-400">Last Updated:</span>{" "}
                <span className="font-medium text-gray-900 dark:text-zinc-100">
                  {new Date(compensation.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCompensationViewPage;
