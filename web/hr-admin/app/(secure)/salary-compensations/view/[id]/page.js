"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSalaryCompensationById } from "@/actions/salary-compensations/server-actions";
import { getEmployeeById } from "@/actions/employees/server-actions";
import { getLeavesList } from "@/actions/leaves/server-actions";
import { getAttendancesList } from "@/actions/attendances/server-actions";
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
  Clock,
  CalendarX,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import { toast } from "sonner";
import {
  calculateTotalDeduction,
  getApprovedLeaveDays,
  getMonthlyAttendance,
  calculateLateDeduction,
} from "@/lib/salary-calculations";

const SalaryCompensationViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const [compensation, setCompensation] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deductionBreakdown, setDeductionBreakdown] = useState({
    leaveDeduction: 0,
    leaveDays: 0,
    attendanceDeduction: 0,
    lateAttendances: [],
    otherDeduction: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        const [compResponse, leavesResponse, attendancesResponse] = await Promise.all([
          getSalaryCompensationById(params.id),
          getLeavesList(),
          getAttendancesList(),
        ]);

        if (compResponse.success) {
          setCompensation(compResponse.data);
          
          // Fetch employee details if employeeId is available
          if (compResponse.data.employeeId) {
            const empResponse = await getEmployeeById(compResponse.data.employeeId);
            if (empResponse.success) {
              setEmployee(empResponse.data);
            }

            // Calculate deduction breakdown
            if (compResponse.data.effectiveDate) {
              const date = new Date(compResponse.data.effectiveDate);
              const month = date.getMonth() + 1;
              const year = date.getFullYear();

              const leaves = leavesResponse.success ? leavesResponse.data : [];
              const attendances = attendancesResponse.success ? attendancesResponse.data : [];

              // Get approved leave days
              const leaveDays = getApprovedLeaveDays(leaves, compResponse.data.employeeId, month, year);

              // Get attendance records
              const monthlyAttendance = getMonthlyAttendance(attendances, compResponse.data.employeeId, month, year);

              // Calculate deductions
              const deductions = calculateTotalDeduction(
                compResponse.data.baseSalary,
                leaveDays,
                monthlyAttendance
              );

              // Find late attendances
              const lateAttendances = monthlyAttendance
                .map(att => {
                  const checkIn = att.checkIn || att.check_in || att.checkInTime;
                  const lateDeduction = calculateLateDeduction(compResponse.data.baseSalary, checkIn);
                  if (lateDeduction > 0) {
                    return {
                      date: att.date,
                      checkIn,
                      deduction: lateDeduction,
                    };
                  }
                  return null;
                })
                .filter(Boolean);

              // Calculate other deductions (manual deductions not from leave/attendance)
              const autoDeduction = deductions.leaveDeduction + deductions.attendanceDeduction;
              const otherDeduction = Math.max(0, compResponse.data.deduction - autoDeduction);

              setDeductionBreakdown({
                leaveDeduction: deductions.leaveDeduction,
                leaveDays,
                attendanceDeduction: deductions.attendanceDeduction,
                lateAttendances,
                otherDeduction,
              });
            }
          }
        } else {
          setError(compResponse.error || "Failed to fetch salary compensation details");
          toast.error(compResponse.error || "Failed to fetch salary compensation details");
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

  // Calculate days worked between effective date and payable date
  const calculateDaysWorked = () => {
    if (!compensation?.effectiveDate || !compensation?.payableDate) {
      return { daysWorked: 30, isProrated: false };
    }

    const effectiveDate = new Date(compensation.effectiveDate);
    const payableDate = new Date(compensation.payableDate);

    // Calculate the difference in milliseconds
    const diffTime = Math.abs(payableDate - effectiveDate);
    // Convert to days (including both start and end dates)
    const daysWorked = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return {
      daysWorked: daysWorked,
      isProrated: daysWorked < 30,
      effectiveDate,
      payableDate,
    };
  };

  // Calculate prorated salary based on days worked
  const calculateProratedSalary = () => {
    const { daysWorked, isProrated } = calculateDaysWorked();
    const fullMonthSalary = compensation?.baseSalary || 0;
    
    if (!isProrated || daysWorked >= 30) {
      return {
        proratedSalary: fullMonthSalary,
        daysWorked: 30,
        isProrated: false,
        fullMonthSalary,
      };
    }

    // Calculate daily rate and prorated salary
    const dailyRate = fullMonthSalary / 30;
    const proratedSalary = dailyRate * daysWorked;

    return {
      proratedSalary,
      daysWorked,
      isProrated: true,
      fullMonthSalary,
      dailyRate,
    };
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 shadow-lg border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {getInitials()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-zinc-100">
                  Salary Compensation Details
                </h1>
                <p className="text-gray-600 dark:text-zinc-400 text-sm md:text-base mt-1">
                  {compensation.employeeName || "Unknown Employee"}
                </p>
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
        <div className="bg-emerald-600 rounded-2xl shadow-2xl p-4 mb-4 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-emerald-100 text-sm font-medium mb-2">Total Salary</div>
              <div className="text-3xl font-bold">{formatCurrency(compensation.netSalary)}</div>
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
              {(() => {
                const salaryInfo = calculateProratedSalary();
                return (
                  <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-zinc-400">Base Salary</div>
                          <div className="text-xs text-gray-500 dark:text-zinc-500">
                            {salaryInfo.isProrated ? `${salaryInfo.daysWorked} days worked` : 'Full month (30 days)'}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                        {formatCurrency(salaryInfo.proratedSalary)}
                      </div>
                    </div>
                    {salaryInfo.isProrated && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-zinc-700">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-zinc-400">
                          <span>Full Month Salary:</span>
                          <span>{formatCurrency(salaryInfo.fullMonthSalary)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-zinc-400 mt-1">
                          <span>Daily Rate:</span>
                          <span>{formatCurrency(salaryInfo.dailyRate)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          <span>Prorated ({salaryInfo.daysWorked} days):</span>
                          <span>{formatCurrency(salaryInfo.proratedSalary)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

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

              <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border-2 border-red-200 dark:border-red-900/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Minus className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Total Deduction</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-500">Breakdown below</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">
                    -{formatCurrency(compensation.deduction)}
                  </div>
                </div>

                {/* Deduction Breakdown */}
                <div className="space-y-2 pl-2 border-l-2 border-red-300 dark:border-red-800 ml-5">
                  {/* Leave Deduction */}
                  {deductionBreakdown.leaveDeduction > 0 && (
                    <div className="flex items-center justify-between text-xs bg-white dark:bg-zinc-800 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <CalendarX className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-700 dark:text-zinc-300">
                          Leave ({deductionBreakdown.leaveDays} day{deductionBreakdown.leaveDays !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        -{formatCurrency(deductionBreakdown.leaveDeduction)}
                      </span>
                    </div>
                  )}

                  {/* Late Attendance Deduction */}
                  {deductionBreakdown.attendanceDeduction > 0 && (
                    <div className="flex items-center justify-between text-xs bg-white dark:bg-zinc-800 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-700 dark:text-zinc-300">
                          Late Attendance ({deductionBreakdown.lateAttendances.length} time{deductionBreakdown.lateAttendances.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        -{formatCurrency(deductionBreakdown.attendanceDeduction)}
                      </span>
                    </div>
                  )}

                  {/* Other Deductions */}
                  {deductionBreakdown.otherDeduction > 0 && (
                    <div className="flex items-center justify-between text-xs bg-white dark:bg-zinc-800 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Minus className="w-4 h-4 text-red-500" />
                        <span className="text-gray-700 dark:text-zinc-300">
                          Other Deductions
                        </span>
                      </div>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        -{formatCurrency(deductionBreakdown.otherDeduction)}
                      </span>
                    </div>
                  )}

                  {/* No deductions message */}
                  {compensation.deduction === 0 && (
                    <div className="text-xs text-gray-500 dark:text-zinc-500 italic p-2">
                      No deductions applied
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
              {(() => {
                const salaryInfo = calculateProratedSalary();
                const calculatedNet = salaryInfo.proratedSalary + (compensation.bonus || 0) + (compensation.allowance || 0) - (compensation.deduction || 0);
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                        Calculation:
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-500 text-right">
                        ${salaryInfo.proratedSalary?.toFixed(2) || "0.00"} + ${compensation.bonus?.toFixed(2) || "0.00"} + ${compensation.allowance?.toFixed(2) || "0.00"} - ${compensation.deduction?.toFixed(2) || "0.00"}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                        Calculated Net:
                      </div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(calculatedNet)}
                      </div>
                    </div>
                  </>
                );
              })()}
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

              {(() => {
                const { daysWorked, isProrated } = calculateDaysWorked();
                return (
                  <div className="p-4 bg-teal-50 dark:bg-teal-900/10 rounded-lg border border-teal-200 dark:border-teal-900/30">
                    <div className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-1">
                      Days Worked
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                      {daysWorked} {daysWorked === 1 ? 'Day' : 'Days'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                      {isProrated ? `Prorated salary (${daysWorked}/30 days)` : 'Full month compensation'}
                    </div>
                  </div>
                );
              })()}
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

        {/* Deduction Details Section */}
        {(deductionBreakdown.leaveDeduction > 0 || deductionBreakdown.attendanceDeduction > 0) && (
          <div className="mt-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-gray-100 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Deduction Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Leave Details */}
              {deductionBreakdown.leaveDeduction > 0 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarX className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Leave Deduction</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-zinc-400">Leave Days:</span>
                      <span className="font-medium text-gray-900 dark:text-zinc-100">
                        {deductionBreakdown.leaveDays} day{deductionBreakdown.leaveDays !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-zinc-400">Daily Rate:</span>
                      <span className="font-medium text-gray-900 dark:text-zinc-100">
                        {formatCurrency(compensation.baseSalary / 30)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-orange-200 dark:border-orange-900/30 flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-zinc-100">Total Deduction:</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        -{formatCurrency(deductionBreakdown.leaveDeduction)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendance Details */}
              {deductionBreakdown.attendanceDeduction > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Late Attendance Deduction</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-zinc-400">Late Days:</span>
                      <span className="font-medium text-gray-900 dark:text-zinc-100">
                        {deductionBreakdown.lateAttendances.length} time{deductionBreakdown.lateAttendances.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {deductionBreakdown.lateAttendances.slice(0, 3).map((late, idx) => (
                      <div key={idx} className="flex justify-between text-xs bg-white dark:bg-zinc-800 p-2 rounded">
                        <span className="text-gray-600 dark:text-zinc-400">
                          {new Date(late.date).toLocaleDateString()} - {late.checkIn}
                        </span>
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          -{formatCurrency(late.deduction)}
                        </span>
                      </div>
                    ))}
                    {deductionBreakdown.lateAttendances.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-zinc-500 italic">
                        ... and {deductionBreakdown.lateAttendances.length - 3} more
                      </div>
                    )}
                    <div className="pt-2 border-t border-amber-200 dark:border-amber-900/30 flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-zinc-100">Total Deduction:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        -{formatCurrency(deductionBreakdown.attendanceDeduction)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
