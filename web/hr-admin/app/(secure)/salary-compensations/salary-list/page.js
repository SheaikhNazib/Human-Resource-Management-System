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
import * as XLSX from "xlsx";
import {
  calculateTotalDeduction,
  getApprovedLeaveDays,
  getMonthlyAttendance,
} from "@/lib/salary-calculations";

export default function SalaryCompensationsPage() {
  const [query, setQuery] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const today = new Date();
  const defaultMonth = String(today.getMonth() + 1); // 1-12 as string
  const defaultYear = String(today.getFullYear());

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const router = useRouter();

  // Build date filter for API
  const apiFilters = useMemo(() => {
    const filters = {};

    // If month and year are selected, create a date string for API
    if (selectedMonth && selectedYear) {
      // Format as YYYY-MM-DD (using first day of month)
      const date = `${selectedYear}-${String(selectedMonth).padStart(
        2,
        "0"
      )}-01`;
      filters.date = date;
    }

    return filters;
  }, [selectedMonth, selectedYear]);

  const { items, loading, error, refetch, deleteSalaryCompensation } =
    useSalaryCompensations(apiFilters);

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

  function handleExportToExcel() {
    if (!filtered || filtered.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      // Prepare data for Excel
      const excelData = filtered.map((item) => {
        const firstName = item.raw?.employee?.first_name || "";
        const lastName = item.raw?.employee?.last_name || "";
        const displayName =
          firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName || item.employeeName || "—";
        const empId = item.employeeId || item.raw?.employee?.id || "";

        // Calculate prorated salary if applicable
        let baseSalaryDisplay = item.baseSalary;
        let proratedNote = "";
        if (item.effectiveDate && item.payableDate) {
          const effectiveDate = new Date(item.effectiveDate);
          const payableDate = new Date(item.payableDate);
          const diffTime = Math.abs(payableDate - effectiveDate);
          const daysWorked = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          if (daysWorked < 30) {
            baseSalaryDisplay = (item.baseSalary / 30) * daysWorked;
            proratedNote = `${daysWorked}d prorated`;
          }
        }

        return {
          "Employee Name": displayName,
          "Employee ID": empId || "N/A",
          "Base Salary": parseFloat(baseSalaryDisplay).toFixed(2),
          "Prorated Info": proratedNote,
          Bonus: parseFloat(item.bonus || 0).toFixed(2),
          Allowance: parseFloat(item.allowance || 0).toFixed(2),
          Deduction: parseFloat(item.deduction || 0).toFixed(2),
          "Net Salary": parseFloat(item.netSalary || 0).toFixed(2),
          "Payable Date": item.payableDate
            ? new Date(item.payableDate).toLocaleDateString("en-US")
            : "—",
          "Effective Date": item.effectiveDate
            ? new Date(item.effectiveDate).toLocaleDateString("en-US")
            : "—",
          Remarks: item.remarks || "",
        };
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Employee Name
        { wch: 12 }, // Employee ID
        { wch: 12 }, // Base Salary
        { wch: 15 }, // Prorated Info
        { wch: 10 }, // Bonus
        { wch: 12 }, // Allowance
        { wch: 12 }, // Deduction
        { wch: 12 }, // Net Salary
        { wch: 15 }, // Payable Date
        { wch: 15 }, // Effective Date
        { wch: 30 }, // Remarks
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Salary Compensations");

      // Generate filename with date
      const dateStr = new Date().toISOString().split("T")[0];
      const filterStr =
        selectedMonth && selectedYear
          ? `_${monthNames[selectedMonth - 1]}_${selectedYear}`
          : "";
      const filename = `Salary_Compensations${filterStr}_${dateStr}.xlsx`;

      // Write and download file
      XLSX.writeFile(wb, filename);

      toast.success(`Excel file downloaded: ${filename}`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel");
    }
  }

  const filtered = useMemo(() => {
    let result = items;

    // Filter by search query (month/year filtering is now handled by API)
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
  }, [items, query]);

  // Pagination state (client-side)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [query, selectedMonth, selectedYear]);

  const totalItems = filtered.length;
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

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
            <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-400">
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
                className="font-medium text-zinc-900 dark:text-zinc-100 text-left hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none cursor-pointer transition-colors text-sm"
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
              <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                {formatCurrency(proratedSalary)}
              </span>
              {isProrated && (
                <div className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 mt-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-md border border-amber-200 dark:border-amber-800/50">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
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
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
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
        <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
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
        <span className="text-sm font-medium text-red-700 dark:text-red-400">
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
        <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
          {formatCurrency(item.netSalary)}
        </span>
      ),
    },
    {
      header: "Payable Date",
      accessor: "payableDate",
      render: (item) => (
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          {formatDate(item.payableDate)}
        </span>
      ),
    },
    {
      header: "Effective Date",
      accessor: "effectiveDate",
      render: (item) => (
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          {formatDate(item.effectiveDate)}
        </span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Base Salary Card */}
        <div className="min-h-[100px] flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Base Salary
          </div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-white">
            {formatCurrency(totalBaseSalary)}
          </div>
        </div>

        {/* Bonus Card */}
        <div className="min-h-[100px] flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">
            Bonus
          </div>
          <div className="text-xl font-semibold text-green-700 dark:text-green-400">
            +{formatCurrency(totalBonus)}
          </div>
        </div>

        {/* Allowance Card */}
        <div className="min-h-[100px] flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">
            Allowance
          </div>
          <div className="text-xl font-semibold text-blue-700 dark:text-blue-400">
            +{formatCurrency(totalAllowance)}
          </div>
        </div>

        {/* Deduction Card */}
        <div className="min-h-[100px] flex flex-col justify-between bg-white dark:bg-zinc-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-2">
            Deduction
          </div>
          <div className="text-xl font-semibold text-red-700 dark:text-red-400">
            -{formatCurrency(totalDeduction)}
          </div>
        </div>

        {/* Net Salary Card */}
        <div className="min-h-[100px] flex flex-col justify-between bg-blue-600 dark:bg-blue-700 rounded-lg p-4 border border-blue-700 dark:border-blue-600">
          <div className="text-xs font-medium text-white/90 mb-2">
            Net Payable
          </div>
          <div className="text-xl font-semibold text-white">
            {formatCurrency(totalNetSalary)}
          </div>
        </div>
      </div>
    );
  }, [items]);

  // Get unique years from items and generate months up to current month
  const availableMonthsYears = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // Get unique years from items
    const yearsSet = new Set();
    if (items && items.length > 0) {
      items.forEach((item) => {
        if (item.effectiveDate) {
          const date = new Date(item.effectiveDate);
          yearsSet.add(date.getFullYear());
        }
      });
    }

    // Always include current year
    yearsSet.add(currentYear);

    const years = Array.from(yearsSet).sort((a, b) => b - a);

    // Generate months: if selected year is current year, show up to current month
    // Otherwise show all 12 months
    let months = [];
    if (selectedYear) {
      const year = parseInt(selectedYear);
      if (year === currentYear) {
        // Only show months up to current month for current year
        months = Array.from({ length: currentMonth }, (_, i) => i + 1);
      } else {
        // Show all 12 months for past years
        months = Array.from({ length: 12 }, (_, i) => i + 1);
      }
    }

    return { months, years };
  }, [items, selectedYear]);

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
      {/* Professional Page Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">
              Salary Compensations
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Manage employee salary records, bonuses, and deductions
            </p>
          </div>

          {items && items.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Total Records:
              </span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {items.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Filters and Actions */}
      <div className="mb-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 shrink-0">
              Filter by:
            </span>

            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  if (!e.target.value) setSelectedMonth("");
                }}
                className="w-full sm:w-40 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                className="w-full sm:w-40 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <option value="">All Months</option>
                {availableMonthsYears.months.map((month) => (
                  <option key={month} value={month}>
                    {monthNames[month - 1]}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSelectedMonth("");
                  setSelectedYear("");
                }}
                className="sm:hidden inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                Clear
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedMonth("");
                setSelectedYear("");
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              onClick={handleAutoCalculateAll}
              disabled={isCalculating || !items || items.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCalculating ? (
                <>
                  <Loader size="sm" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
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
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Recalculate</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportToExcel}
              disabled={!filtered || filtered.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <TableArchive
        title={<div className="w-full">{summaryStats}</div>}
        columns={columns}
        data={paginated}
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
        pagination={{ total: totalItems, skip: (page - 1) * limit, limit }}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                  Recalculate Deductions
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Auto-calculate salary deductions for all records
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                This will recalculate deductions for{" "}
                <span className="font-semibold text-blue-700 dark:text-blue-400">
                  {items?.length || 0} records
                </span>{" "}
                based on current leave and attendance data.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-5">
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
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This action will update all records and cannot be undone.
                  Ensure leave and attendance data is accurate before
                  proceeding.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors font-medium border border-zinc-300 dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={proceedWithCalculation}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
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
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
                  Delete Salary Record
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Permanently remove this compensation record
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-600 rounded-lg p-4 mb-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Are you sure you want to delete this salary compensation record?
                This action cannot be undone.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-5">
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
                <p className="text-sm text-red-800 dark:text-red-200">
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
                className="flex-1 px-4 py-2 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors font-medium border border-zinc-300 dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={proceedWithDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
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
