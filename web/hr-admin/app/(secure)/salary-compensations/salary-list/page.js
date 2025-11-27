"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSalaryCompensations } from "@/actions/salary-compensations/business";
import { getLeavesList } from "@/actions/leaves/server-actions";
import { getAttendancesList } from "@/actions/attendances/server-actions";
import { updateSalaryCompensation } from "@/actions/salary-compensations/server-actions";
import TableArchive from "@/components/core/TableArchive";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";
import {
  calculateTotalDeduction,
  getApprovedLeaveDays,
  getMonthlyAttendance,
} from "@/lib/salary-calculations";

export default function SalaryCompensationsPage() {
  const { items, loading, error, refetch, deleteSalaryCompensation } =
    useSalaryCompensations();
  const [query, setQuery] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const router = useRouter();

  // Fetch leaves and attendances on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leavesRes, attendancesRes] = await Promise.all([
          getLeavesList(),
          getAttendancesList(),
        ]);

        if (leavesRes.success && leavesRes.data) {
          setLeaves(leavesRes.data);
        }

        if (attendancesRes.success && attendancesRes.data) {
          setAttendances(attendancesRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  function handleView(id) {
    router.push(`/salary-compensations/view/${id}`);
  }

  function handleEdit(id) {
    router.push(`/salary-compensations/edit/${id}`);
  }

  async function handleDelete(id) {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  }

  async function proceedWithDelete() {
    if (!deleteItemId) return;

    setShowDeleteModal(false);
    const result = await deleteSalaryCompensation(deleteItemId);
    if (!result.success) {
      toast.error(result.error || "Delete failed");
    }
    setDeleteItemId(null);
  }

  async function handleAutoCalculateAll() {
    if (!items || items.length === 0) {
      toast.error("No salary compensation records to update");
      return;
    }

    setShowConfirmModal(true);
  }

  async function proceedWithCalculation() {
    setShowConfirmModal(false);
    setIsCalculating(true);
    let successCount = 0;
    let failCount = 0;

    try {
      toast.info("Starting auto-calculation...");
      console.log("Total leaves available:", leaves.length);
      console.log("Total attendances available:", attendances.length);

      for (const item of items) {
        try {
          if (!item.employeeId || !item.baseSalary || !item.effectiveDate) {
            console.log(`Skipping item ${item.id}: missing required fields`, {
              employeeId: item.employeeId,
              baseSalary: item.baseSalary,
              effectiveDate: item.effectiveDate,
            });
            failCount++;
            continue;
          }

          const date = new Date(item.effectiveDate);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();

          console.log(
            `Processing employee ${item.employeeId} (${item.employeeName}) for ${month}/${year}`
          );

          // Calculate prorated base salary based on days worked
          const effectiveDate = new Date(item.effectiveDate);
          const payableDate = new Date(item.payableDate);
          const diffTime = Math.abs(payableDate - effectiveDate);
          const daysWorked = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          const fullMonthSalary = parseFloat(item.baseSalary);
          const proratedBaseSalary =
            daysWorked >= 30
              ? fullMonthSalary
              : (fullMonthSalary / 30) * daysWorked;

          console.log(`  - Days worked: ${daysWorked}`);
          console.log(`  - Full month salary: ${fullMonthSalary}`);
          console.log(`  - Prorated base salary: ${proratedBaseSalary}`);

          // Get approved leave days for the employee in the specified month
          const leaveDays = getApprovedLeaveDays(
            leaves,
            item.employeeId,
            month,
            year
          );
          console.log(`  - Leave days: ${leaveDays}`);

          // Get attendance records for the employee in the specified month
          const monthlyAttendance = getMonthlyAttendance(
            attendances,
            item.employeeId,
            month,
            year
          );
          console.log(
            `  - Monthly attendance records: ${monthlyAttendance.length}`
          );

          // Calculate deductions based on FULL MONTH salary for consistency
          const deductions = calculateTotalDeduction(
            fullMonthSalary,
            leaveDays,
            monthlyAttendance
          );
          console.log(`  - Calculated deductions:`, deductions);

          // Calculate new net salary using prorated base salary
          const newNetSalary =
            proratedBaseSalary +
            parseFloat(item.bonus || 0) +
            parseFloat(item.allowance || 0) -
            deductions.totalAutoDeduction;

          // Update the salary compensation
          const updateData = {
            employee: item.employeeId,
            base_salary: parseFloat(item.baseSalary),
            bonus: parseFloat(item.bonus || 0),
            allowance: parseFloat(item.allowance || 0),
            deduction: deductions.totalAutoDeduction,
            net_salary: newNetSalary,
            payable_date: item.payableDate,
            effective_date: item.effectiveDate,
            remarks: item.remarks || "",
          };

          console.log(`  - Update data:`, updateData);

          const response = await updateSalaryCompensation(item.id, updateData);

          if (response.success) {
            successCount++;
          } else {
            console.error(
              `Failed to update record ${item.id}:`,
              response.error
            );
            failCount++;
          }
        } catch (err) {
          console.error(`Error updating record ${item.id}:`, err);
          failCount++;
        }
      }

      // Refresh the list
      await refetch();

      // Show result
      if (successCount > 0 && failCount === 0) {
        toast.success(
          `Successfully updated ${successCount} salary compensation records!`
        );
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(
          `Updated ${successCount} records successfully. ${failCount} failed.`
        );
      } else {
        toast.error(`Failed to update salary compensation records.`);
      }
    } catch (error) {
      console.error("Error during auto-calculation:", error);
      toast.error("An error occurred during auto-calculation");
    } finally {
      setIsCalculating(false);
    }
  }

  const filtered = useMemo(() => {
    let result = items;

    // Filter by month/year if selected
    if (selectedMonth && selectedYear) {
      result = result.filter((item) => {
        if (!item.effectiveDate) return false;
        const date = new Date(item.effectiveDate);
        return (
          date.getMonth() + 1 === parseInt(selectedMonth) &&
          date.getFullYear() === parseInt(selectedYear)
        );
      });
    }

    // Filter by search query
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          (item.employeeName || "").toLowerCase().includes(q) ||
          (item.remarks || "").toLowerCase().includes(q) ||
          (item.baseSalary?.toString() || "").includes(q) ||
          (item.netSalary?.toString() || "").includes(q)
      );
    }

    return result;
  }, [items, query, selectedMonth, selectedYear]);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      header: "Employee",
      accessor: "employeeName",
      render: (item) => {
        const firstName = item.raw?.employee?.first_name || "";
        const lastName = item.raw?.employee?.last_name || "";
        const displayName =
          firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName || item.employeeName || "—";
        const empId = item.employeeId || item.raw?.employee?.id || "";

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "—"}
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleView(item.id)}
                className="font-medium text-zinc-900 dark:text-zinc-100 text-left hover:underline focus:outline-none cursor-pointer"
              >
                {displayName}
              </button>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                ID: {empId || "N/A"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Base Salary",
      accessor: "baseSalary",
      render: (item) => {
        // Calculate if prorated
        if (item.effectiveDate && item.payableDate) {
          const effectiveDate = new Date(item.effectiveDate);
          const payableDate = new Date(item.payableDate);
          const diffTime = Math.abs(payableDate - effectiveDate);
          const daysWorked = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          const isProrated = daysWorked < 30;
          const proratedSalary = isProrated
            ? (item.baseSalary / 30) * daysWorked
            : item.baseSalary;

          return (
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(proratedSalary)}
              </span>
              {isProrated && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  {daysWorked}d prorated
                </div>
              )}
            </div>
          );
        }

        return (
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {formatCurrency(item.baseSalary)}
          </span>
        );
      },
    },
    {
      header: "Bonus",
      accessor: "bonus",
      render: (item) => (
        <span className="text-green-600 dark:text-green-400">
          {item.bonus > 0
            ? `+${formatCurrency(item.bonus)}`
            : formatCurrency(0)}
        </span>
      ),
    },
    {
      header: "Allowance",
      accessor: "allowance",
      render: (item) => (
        <span className="text-blue-600 dark:text-blue-400">
          {item.allowance > 0
            ? `+${formatCurrency(item.allowance)}`
            : formatCurrency(0)}
        </span>
      ),
    },
    {
      header: "Deduction",
      accessor: "deduction",
      render: (item) => (
        <span className="text-red-600 dark:text-red-400">
          {item.deduction > 0
            ? `-${formatCurrency(item.deduction)}`
            : formatCurrency(0)}
        </span>
      ),
    },
    {
      header: "Net Salary",
      accessor: "netSalary",
      render: (item) => (
        <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
          {formatCurrency(item.netSalary)}
        </span>
      ),
    },
    {
      header: "Payable Date",
      accessor: "payableDate",
      render: (item) => (
        <div className="text-sm">{formatDate(item.payableDate)}</div>
      ),
    },
    {
      header: "Effective Date",
      accessor: "effectiveDate",
      render: (item) => (
        <div className="text-sm">{formatDate(item.effectiveDate)}</div>
      ),
    },
  ];

  const renderActions = (item) => {
    const id = item.id ?? item.raw?.id ?? "";

    return (
      <TableArchive.Actions
        row={item}
        onView={() => handleView(id)}
        onEdit={() => handleEdit(id)}
        onDelete={() => handleDelete(id)}
        hasViewPermission={true}
        hasEditPermission={true}
        hasDeletePermission={true}
        deleteConfirmMessage="Delete this salary compensation record? This action cannot be undone."
      />
    );
  };

  const summaryStats = useMemo(() => {
    if (!items || items.length === 0) return null;

    const totalBaseSalary = items.reduce(
      (sum, item) => sum + (parseFloat(item.baseSalary) || 0),
      0
    );
    const totalBonus = items.reduce(
      (sum, item) => sum + (parseFloat(item.bonus) || 0),
      0
    );
    const totalAllowance = items.reduce(
      (sum, item) => sum + (parseFloat(item.allowance) || 0),
      0
    );
    const totalDeduction = items.reduce(
      (sum, item) => sum + (parseFloat(item.deduction) || 0),
      0
    );
    const totalNetSalary = items.reduce(
      (sum, item) => sum + (parseFloat(item.netSalary) || 0),
      0
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="min-h-[110px] flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700/70 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-zinc-600 dark:text-zinc-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-300 font-semibold uppercase tracking-wider">
              Base Salary
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {formatCurrency(totalBaseSalary)}
          </div>
        </div>
        <div className="min-h-[110px] flex flex-col justify-between bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-5 shadow-sm border border-green-200 dark:border-green-800/50 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <div className="text-xs text-green-700 dark:text-green-300 font-semibold uppercase tracking-wider">
              Bonus
            </div>
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(totalBonus)}
          </div>
        </div>
        <div className="min-h-[110px] flex flex-col justify-between bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl p-5 shadow-sm border border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-400 font-semibold uppercase tracking-wider">
              Allowance
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
            {formatCurrency(totalAllowance)}
          </div>
        </div>
        <div className="min-h-[110px] flex flex-col justify-between bg-linear-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl p-5 shadow-sm border border-red-200 dark:border-red-800/50 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-red-600 dark:text-red-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </div>
            <div className="text-xs text-red-700 dark:text-red-300 font-semibold uppercase tracking-wider">
              Deduction
            </div>
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {formatCurrency(totalDeduction)}
          </div>
        </div>
        <div className="min-h-[110px] flex flex-col justify-between bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
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
              </div>
              <div className="text-xs text-white/90 font-semibold uppercase tracking-wider">
                Net Payable
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(totalNetSalary)}
            </div>
          </div>
        </div>
      </div>
    );
  }, [items]);

  // Get unique months and years from items for filter options
  const availableMonthsYears = useMemo(() => {
    if (!items || items.length === 0) return { months: [], years: [] };

    const monthsSet = new Set();
    const yearsSet = new Set();

    items.forEach((item) => {
      if (item.effectiveDate) {
        const date = new Date(item.effectiveDate);
        monthsSet.add(date.getMonth() + 1);
        yearsSet.add(date.getFullYear());
      }
    });

    return {
      months: Array.from(monthsSet).sort((a, b) => a - b),
      years: Array.from(yearsSet).sort((a, b) => b - a),
    };
  }, [items]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="max-w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Salary Compensations
        </h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          Manage employee salary records, bonuses, and deductions
        </p>
      </div>

      {/* Filters and Auto-Calculate Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50 shadow-sm">
        {/* Month/Year Filter */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-zinc-500 dark:text-zinc-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Filter by:
            </span>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              if (!e.target.value) setSelectedMonth("");
            }}
            className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 font-medium shadow-sm hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            <option value="">All Years</option>
            {availableMonthsYears.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            disabled={!selectedYear}
            className="px-4 py-2.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            <option value="">All Months</option>
            {availableMonthsYears.months.map((month) => (
              <option key={month} value={month}>
                {monthNames[month - 1]}
              </option>
            ))}
          </select>

          {(selectedMonth || selectedYear) && (
            <button
              onClick={() => {
                setSelectedMonth("");
                setSelectedYear("");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear
            </button>
          )}
        </div>

        {/* Auto-Calculate Button */}
        <button
          onClick={handleAutoCalculateAll}
          disabled={isCalculating || !items || items.length === 0}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-linear-to-r from-violet-600 to-purple-600 dark:from-violet-500 dark:to-purple-500 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 dark:hover:from-violet-600 dark:hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-zinc-400 disabled:to-zinc-400 shadow-lg shadow-violet-500/25 dark:shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] font-medium"
        >
          {isCalculating ? (
            <>
              <Loader size="sm" />
              <span>Calculating...</span>
            </>
          ) : (
            <>
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
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span>Recalculate All Deductions</span>
            </>
          )}
        </button>
      </div>

      <TableArchive
        title={<div className="w-full">{summaryStats}</div>}
        columns={columns}
        data={filtered}
        loading={loading}
        error={error}
        emptyMessage="No salary compensation records found."
        searchTerm={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search by name, amount, or remarks..."
        createButtonText="Add Salary Compensation"
        createButtonHref="/salary-compensations/new"
        onRefresh={refetch}
        showRefreshButton={true}
        actionsRender={renderActions}
        className="max-w-full"
      />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 transform transition-all animate-scaleIn border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/10 dark:shadow-violet-500/5">
                <svg
                  className="w-7 h-7 text-violet-600 dark:text-violet-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Recalculate Deductions
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                  Auto-calculate salary deductions for all records
                </p>
              </div>
            </div>

            <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 rounded-xl p-4 mb-6">
              <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed">
                This will recalculate deductions for{" "}
                <span className="font-bold text-violet-700 dark:text-violet-300">
                  {items?.length || 0} records
                </span>{" "}
                based on current leave and attendance data.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                  This action will update all records and cannot be undone.
                  Ensure leave and attendance data is accurate before
                  proceeding.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-5 py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all font-semibold border border-zinc-200 dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={proceedWithCalculation}
                className="flex-1 px-5 py-3 bg-linear-to-r from-violet-600 to-purple-600 dark:from-violet-500 dark:to-purple-500 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 dark:hover:from-violet-600 dark:hover:to-purple-600 transition-all font-semibold shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 transform transition-all animate-scaleIn border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/10 dark:shadow-red-500/5">
                <svg
                  className="w-7 h-7 text-red-600 dark:text-red-300"
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
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Delete Salary Record
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                  Permanently remove this compensation record
                </p>
              </div>
            </div>

            <p className="text-zinc-700 dark:text-zinc-200 mb-6 leading-relaxed">
              Are you sure you want to delete this salary compensation record?
              This action cannot be undone.
            </p>

            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">
                  This will permanently remove the salary compensation record
                  and cannot be recovered.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItemId(null);
                }}
                className="flex-1 px-5 py-3 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all font-semibold border border-zinc-200 dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={proceedWithDelete}
                className="flex-1 px-5 py-3 bg-linear-to-r from-red-600 to-rose-600 dark:from-red-500 dark:to-rose-500 text-white rounded-xl hover:from-red-700 hover:to-rose-700 dark:hover:from-red-600 dark:hover:to-rose-600 transition-all font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
