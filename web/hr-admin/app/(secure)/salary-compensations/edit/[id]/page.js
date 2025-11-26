"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  updateSalaryCompensation,
  getSalaryCompensationById,
} from "@/actions/salary-compensations/server-actions";
import { getEmployeesList } from "@/actions/employees/server-actions";
import { getLeavesList } from "@/actions/leaves/server-actions";
import { getAttendancesList } from "@/actions/attendances/server-actions";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import Loader from "@/components/ui/Loader";
import AutoComplete from "@/components/ui/autoComplete";
import { 
  calculateTotalDeduction, 
  getApprovedLeaveDays, 
  getMonthlyAttendance 
} from "@/lib/salary-calculations";

const EditSalaryCompensationPage = () => {
  const router = useRouter();
  const params = useParams();
  const [compensation, setCompensation] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [autoDeductions, setAutoDeductions] = useState({
    leaveDeduction: 0,
    attendanceDeduction: 0,
    totalAutoDeduction: 0,
  });
  const [calculatingDeductions, setCalculatingDeductions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getSalaryCompensationById(params.id);

        if (response.success) {
          setCompensation(response.data);
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

    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const [employeesRes, leavesRes, attendancesRes] = await Promise.all([
          getEmployeesList(),
          getLeavesList(),
          getAttendancesList(),
        ]);

        if (employeesRes.success && employeesRes.data) {
          setEmployees(employeesRes.data);
        } else {
          toast.error(employeesRes.error || "Failed to load employees");
        }

        if (leavesRes.success && leavesRes.data) {
          setLeaves(leavesRes.data);
        }

        if (attendancesRes.success && attendancesRes.data) {
          setAttendances(attendancesRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchData();
    fetchEmployees();
  }, [params.id]);

  const validationSchema = Yup.object({
    employee: Yup.number()
      .required("Employee is required")
      .positive()
      .integer(),
    base_salary: Yup.number()
      .required("Base salary is required")
      .min(0, "Base salary cannot be negative"),
    bonus: Yup.number()
      .min(0, "Bonus cannot be negative")
      .default(0),
    allowance: Yup.number()
      .min(0, "Allowance cannot be negative")
      .default(0),
    deduction: Yup.number()
      .min(0, "Deduction cannot be negative")
      .default(0),
    net_salary: Yup.number()
      .required("Net salary is required")
      .min(0, "Net salary cannot be negative"),
    payable_date: Yup.date().required("Payable date is required"),
    effective_date: Yup.date().required("Effective date is required"),
    remarks: Yup.string().max(500, "Remarks cannot exceed 500 characters"),
  });

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Calculate automatic deductions based on leaves and attendance
  const calculateAutoDeductions = async (employeeId, baseSalary, effectiveDate) => {
    if (!employeeId || !baseSalary || !effectiveDate) {
      setAutoDeductions({ leaveDeduction: 0, attendanceDeduction: 0, totalAutoDeduction: 0 });
      return 0;
    }

    setCalculatingDeductions(true);
    try {
      const date = new Date(effectiveDate);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      // Get approved leave days for the employee in the specified month
      const leaveDays = getApprovedLeaveDays(leaves, employeeId, month, year);

      // Get attendance records for the employee in the specified month
      const monthlyAttendance = getMonthlyAttendance(attendances, employeeId, month, year);

      // Calculate deductions
      const deductions = calculateTotalDeduction(parseFloat(baseSalary), leaveDays, monthlyAttendance);
      
      setAutoDeductions(deductions);
      return deductions.totalAutoDeduction;
    } catch (error) {
      console.error("Error calculating auto deductions:", error);
      return 0;
    } finally {
      setCalculatingDeductions(false);
    }
  };

  // Auto-calculate net salary when component values change
  const calculateNetSalary = (baseSalary, bonus, allowance, deduction) => {
    const base = parseFloat(baseSalary) || 0;
    const bonusAmt = parseFloat(bonus) || 0;
    const allowanceAmt = parseFloat(allowance) || 0;
    const deductionAmt = parseFloat(deduction) || 0;
    
    return base + bonusAmt + allowanceAmt - deductionAmt;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);

    try {
      const compensationData = {
        employee: parseInt(values.employee, 10),
        base_salary: parseFloat(values.base_salary),
        bonus: parseFloat(values.bonus) || 0,
        allowance: parseFloat(values.allowance) || 0,
        deduction: parseFloat(values.deduction) || 0,
        net_salary: parseFloat(values.net_salary),
        payable_date: values.payable_date,
        effective_date: values.effective_date,
        remarks: values.remarks || "",
      };

      console.log("Submitting updated salary compensation data:", compensationData);
      const response = await updateSalaryCompensation(params.id, compensationData);
      console.log("Update salary compensation response:", response);

      if (response.success) {
        toast.success("Salary compensation updated successfully!");
        setTimeout(() => {
          router.push(`/salary-compensations/view/${params.id}`);
        }, 1000);
      } else {
        toast.error(response.error || "Failed to update salary compensation");
      }
    } catch (error) {
      console.error("Error updating salary compensation:", error);
      toast.error(error.message || "An error occurred while updating salary compensation");
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 mb-2">Error</h2>
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

  const initialValues = {
    employee: compensation.employeeId || "",
    base_salary: compensation.baseSalary || "",
    bonus: compensation.bonus || 0,
    allowance: compensation.allowance || 0,
    deduction: compensation.deduction || 0,
    net_salary: compensation.netSalary || "",
    payable_date: formatDateForInput(compensation.payableDate),
    effective_date: formatDateForInput(compensation.effectiveDate),
    remarks: compensation.remarks || "",
  };

  return (
    <div className="pt-0 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-0">
        <div className="rounded-lg overflow-hidden">
          <div className="p-4 bg-indigo-600 rounded-t-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Salary Compensation</h1>
                <p className="text-sm text-white/80 mt-1">Update salary compensation record for {compensation.employeeName || "employee"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, touched, errors, isSubmitting: formikSubmitting }) => {
            const selectedEmployee = employees.find(e => String(e.id) === String(values.employee) || e.id === values.employee);

            return (
              <Form className="space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Employee <span className="text-red-500">*</span>
                </label>
                {loadingEmployees ? (
                  <div className="h-10 flex items-center text-sm text-zinc-500">Loading employees...</div>
                ) : (
                  <div>
                    <AutoComplete
                      options={employees.map((emp) => {
                        const firstName = emp.firstName || "";
                        const lastName = emp.lastName || "";
                        const fullName = `${firstName} ${lastName}`.trim();

                        return {
                          value: emp.id,
                          label: fullName || `Employee ${emp.id}`,
                          sublabel: emp.email || "",
                        };
                      })}
                      value={values.employee}
                      onChange={(value) => setFieldValue("employee", value)}
                      placeholder="Select an employee"
                      className="w-full"
                    />

                    {selectedEmployee && (
                      <div className="mt-2 flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-200">{(selectedEmployee.firstName?.[0] || selectedEmployee.lastName?.[0] || '—').toUpperCase()}</div>
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">{`${selectedEmployee.firstName || ''} ${selectedEmployee.lastName || ''}`.trim() || `Employee ${selectedEmployee.id}`}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{selectedEmployee.email || 'No email'} • {selectedEmployee.jobTitle || 'No job title'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <ErrorMessage
                  name="employee"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Salary Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Base Salary */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Base Salary <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <Field
                      type="number"
                      name="base_salary"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      placeholder="50000.00"
                      onChange={(e) => {
                        setFieldValue("base_salary", e.target.value);
                        const netSalary = calculateNetSalary(
                          e.target.value,
                          values.bonus,
                          values.allowance,
                          values.deduction
                        );
                        setFieldValue("net_salary", netSalary.toFixed(2));
                      }}
                    />
                  </div>
                  <ErrorMessage
                    name="base_salary"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Bonus */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Bonus
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <Field
                      type="number"
                      name="bonus"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      placeholder="0.00"
                      onChange={(e) => {
                        setFieldValue("bonus", e.target.value);
                        const netSalary = calculateNetSalary(
                          values.base_salary,
                          e.target.value,
                          values.allowance,
                          values.deduction
                        );
                        setFieldValue("net_salary", netSalary.toFixed(2));
                      }}
                    />
                  </div>
                  <ErrorMessage
                    name="bonus"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Allowance */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Allowance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <Field
                      type="number"
                      name="allowance"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      placeholder="0.00"
                      onChange={(e) => {
                        setFieldValue("allowance", e.target.value);
                        const netSalary = calculateNetSalary(
                          values.base_salary,
                          values.bonus,
                          e.target.value,
                          values.deduction
                        );
                        setFieldValue("net_salary", netSalary.toFixed(2));
                      }}
                    />
                  </div>
                  <ErrorMessage
                    name="allowance"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Deduction */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Deduction (Manual + Auto)
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!values.employee) {
                          toast.error("Please select an employee first");
                          return;
                        }
                        if (!values.base_salary) {
                          toast.error("Please enter base salary first");
                          return;
                        }
                        if (!values.effective_date) {
                          toast.error("Please select effective date first");
                          return;
                        }
                        
                        const autoDeduction = await calculateAutoDeductions(
                          values.employee,
                          values.base_salary,
                          values.effective_date
                        );
                        
                        setFieldValue("deduction", autoDeduction.toFixed(2));
                        const netSalary = calculateNetSalary(
                          values.base_salary,
                          values.bonus,
                          values.allowance,
                          autoDeduction
                        );
                        setFieldValue("net_salary", netSalary.toFixed(2));
                        
                        toast.success("Auto-deductions calculated successfully!");
                      }}
                      disabled={calculatingDeductions || !values.employee || !values.base_salary || !values.effective_date}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {calculatingDeductions ? (
                        <>
                          <Loader size="sm" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          🧮 Auto-Calculate Deductions
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <Field
                      type="number"
                      name="deduction"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      onChange={(e) => {
                        setFieldValue("deduction", e.target.value);
                        const netSalary = calculateNetSalary(
                          values.base_salary,
                          values.bonus,
                          values.allowance,
                          e.target.value
                        );
                        setFieldValue("net_salary", netSalary.toFixed(2));
                      }}
                    />
                  </div>
                  {autoDeductions.totalAutoDeduction > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">Auto-Deduction Breakdown</div>
                          <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                            <div className="flex justify-between"><span>Leave Deduction</span><span className="font-semibold">${autoDeductions.leaveDeduction.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Attendance Late Deduction</span><span className="font-semibold">${autoDeductions.attendanceDeduction.toFixed(2)}</span></div>
                          </div>
                        </div>
                        <div className="text-right pl-4">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">Total</div>
                          <div className="text-lg font-bold text-blue-700 dark:text-blue-300">${autoDeductions.totalAutoDeduction.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">💡 You can manually adjust the deduction amount if needed</div>
                    </div>
                  )}
                  <ErrorMessage
                    name="deduction"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              {/* Net Salary (Read-only calculated field) */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 dark:border-emerald-600 rounded-lg p-4">
                <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                  Net Salary (Auto-calculated) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 font-bold">$</span>
                  <Field
                    type="number"
                    name="net_salary"
                    readOnly
                    className="w-full pl-8 px-4 py-2 border-0 bg-white dark:bg-zinc-800 text-2xl font-bold text-emerald-600 dark:text-emerald-400 rounded-lg cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  Formula: Base Salary + Bonus + Allowance - Deduction
                </p>
                <ErrorMessage
                  name="net_salary"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Effective Date */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Effective Date <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="date"
                    name="effective_date"
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ErrorMessage
                    name="effective_date"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* Payable Date */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Payable Date <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="date"
                    name="payable_date"
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <ErrorMessage
                    name="payable_date"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Remarks
                </label>
                <Field
                  as="textarea"
                  name="remarks"
                  rows="4"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter any additional remarks or notes..."
                />
                <ErrorMessage
                  name="remarks"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || formikSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size="sm" />
                      Updating...
                    </>
                  ) : (
                    "Update Salary Compensation"
                  )}
                </button>
              </div>
            </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};

export default EditSalaryCompensationPage;
