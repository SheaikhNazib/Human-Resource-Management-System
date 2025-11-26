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
  getMonthlyAttendance 
} from "@/lib/salary-calculations";

export default function SalaryCompensationsPage() {
  const { items, loading, error, refetch, deleteSalaryCompensation } = useSalaryCompensations();
  const [query, setQuery] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
    const confirmed = confirm("Are you sure you want to delete this salary compensation record?");
    if (!confirmed) return;

    const result = await deleteSalaryCompensation(id);
    if (!result.success) {
      alert(result.error || "Delete failed");
    }
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
            console.log(`Skipping item ${item.id}: missing required fields`, { employeeId: item.employeeId, baseSalary: item.baseSalary, effectiveDate: item.effectiveDate });
            failCount++;
            continue;
          }

          const date = new Date(item.effectiveDate);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();

          console.log(`Processing employee ${item.employeeId} (${item.employeeName}) for ${month}/${year}`);

          // Calculate prorated base salary based on days worked
          const effectiveDate = new Date(item.effectiveDate);
          const payableDate = new Date(item.payableDate);
          const diffTime = Math.abs(payableDate - effectiveDate);
          const daysWorked = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          
          const fullMonthSalary = parseFloat(item.baseSalary);
          const proratedBaseSalary = daysWorked >= 30 ? fullMonthSalary : (fullMonthSalary / 30) * daysWorked;
          
          console.log(`  - Days worked: ${daysWorked}`);
          console.log(`  - Full month salary: ${fullMonthSalary}`);
          console.log(`  - Prorated base salary: ${proratedBaseSalary}`);

          // Get approved leave days for the employee in the specified month
          const leaveDays = getApprovedLeaveDays(leaves, item.employeeId, month, year);
          console.log(`  - Leave days: ${leaveDays}`);

          // Get attendance records for the employee in the specified month
          const monthlyAttendance = getMonthlyAttendance(attendances, item.employeeId, month, year);
          console.log(`  - Monthly attendance records: ${monthlyAttendance.length}`);

          // Calculate deductions based on FULL MONTH salary for consistency
          const deductions = calculateTotalDeduction(fullMonthSalary, leaveDays, monthlyAttendance);
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
            console.error(`Failed to update record ${item.id}:`, response.error);
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
        toast.success(`Successfully updated ${successCount} salary compensation records!`);
      } else if (successCount > 0 && failCount > 0) {
        toast.warning(`Updated ${successCount} records successfully. ${failCount} failed.`);
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
        return date.getMonth() + 1 === parseInt(selectedMonth) && 
               date.getFullYear() === parseInt(selectedYear);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = [
    {
      header: "Employee",
      accessor: "employeeName",
      render: (item) => {
        const firstName = item.raw?.employee?.first_name || '';
        const lastName = item.raw?.employee?.last_name || '';
        const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || item.employeeName || '—';
        const empId = item.employeeId || item.raw?.employee?.id || '';
        
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '—'}
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
                ID: {empId || 'N/A'}
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
          const proratedSalary = isProrated ? (item.baseSalary / 30) * daysWorked : item.baseSalary;
          
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
          {item.bonus > 0 ? `+${formatCurrency(item.bonus)}` : formatCurrency(0)}
        </span>
      ),
    },
    {
      header: "Allowance",
      accessor: "allowance",
      render: (item) => (
        <span className="text-blue-600 dark:text-blue-400">
          {item.allowance > 0 ? `+${formatCurrency(item.allowance)}` : formatCurrency(0)}
        </span>
      ),
    },
    {
      header: "Deduction",
      accessor: "deduction",
      render: (item) => (
        <span className="text-red-600 dark:text-red-400">
          {item.deduction > 0 ? `-${formatCurrency(item.deduction)}` : formatCurrency(0)}
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
        <div className="text-sm">
          {formatDate(item.payableDate)}
        </div>
      ),
    },
    {
      header: "Effective Date",
      accessor: "effectiveDate",
      render: (item) => (
        <div className="text-sm">
          {formatDate(item.effectiveDate)}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (item) => {
        const payableDate = item.payableDate ? new Date(item.payableDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let status = "Pending";
        let colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        
        if (payableDate) {
          if (payableDate <= today) {
            status = "Paid";
            colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
          } else {
            status = "Scheduled";
            colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
          }
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {status}
          </span>
        );
      },
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

    const totalBaseSalary = items.reduce((sum, item) => sum + (parseFloat(item.baseSalary) || 0), 0);
    const totalBonus = items.reduce((sum, item) => sum + (parseFloat(item.bonus) || 0), 0);
    const totalAllowance = items.reduce((sum, item) => sum + (parseFloat(item.allowance) || 0), 0);
    const totalDeduction = items.reduce((sum, item) => sum + (parseFloat(item.deduction) || 0), 0);
    const totalNetSalary = items.reduce((sum, item) => sum + (parseFloat(item.netSalary) || 0), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase">Total Base Salary</div>
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{formatCurrency(totalBaseSalary)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">Total Bonus</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(totalBonus)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Total Allowance</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(totalAllowance)}</div>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-red-600 dark:text-red-400 font-medium uppercase">Total Deduction</div>
          <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{formatCurrency(totalDeduction)}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg p-4 shadow-lg">
          <div className="text-xs text-white/80 font-medium uppercase">Total Net Payable</div>
          <div className="text-xl font-bold text-white mt-1">{formatCurrency(totalNetSalary)}</div>
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="max-w-full">
      {/* Filters and Auto-Calculate Button */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        {/* Month/Year Filter */}
        <div className="flex gap-2 items-center">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              if (!e.target.value) setSelectedMonth("");
            }}
            className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Auto-Calculate Button */}
        <button
          onClick={handleAutoCalculateAll}
          disabled={isCalculating || !items || items.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {isCalculating ? (
            <>
              <Loader size="sm" />
              <span>Calculating...</span>
            </>
          ) : (
            <>
              <span className="text-xl">🧮</span>
              <span>Recalculate All Deductions</span>
            </>
          )}
        </button>
      </div>

      <TableArchive
        title={
          <div className="rounded-lg w-full overflow-hidden">
            <div className="px-4 bg-indigo-600 rounded-t-xl">
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-white">Salary Compensations</span>
                <span className="text-sm text-white/80"></span>
              </div>
            </div>
            <div className="px-4 pt-2 bg-transparent">
              {summaryStats}
            </div>
          </div>
        }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                <span className="text-2xl">🧮</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                Recalculate Deductions
              </h3>
            </div>
            
            <p className="text-zinc-600 dark:text-zinc-300 mb-6">
              This will recalculate deductions for all <span className="font-bold text-purple-600 dark:text-purple-400">{items?.length || 0} salary compensation records</span> based on current leave and attendance data.
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <span>This action will update all records and cannot be undone. Please ensure leave and attendance data is accurate.</span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={proceedWithCalculation}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
