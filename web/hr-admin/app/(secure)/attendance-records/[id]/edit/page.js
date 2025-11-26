"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { updateAttendance, getAttendanceById } from "@/actions/attendances/server-actions";
import { getEmployeesList } from "@/actions/employees/server-actions";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import AutoComplete from "@/components/ui/autoComplete";

const EditAttendancePage = () => {
  const router = useRouter();
  const params = useParams();
  const [attendance, setAttendance] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch both attendance and employees
        const [attendanceResponse, employeesResponse] = await Promise.all([
          getAttendanceById(params.id),
          getEmployeesList()
        ]);

        if (attendanceResponse.success) {
          setAttendance(attendanceResponse.data);
        } else {
          setError(attendanceResponse.error || "Failed to fetch attendance details");
          toast.error(attendanceResponse.error || "Failed to fetch attendance details");
        }

        if (employeesResponse.success && Array.isArray(employeesResponse.data)) {
          // Format employees for AutoComplete: { id, name }
          const formattedEmployees = employeesResponse.data.map(emp => {
            const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || `Employee ${emp.id}`;
            return {
              id: emp.id,
              name: fullName
            };
          });
          setEmployees(formattedEmployees);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "An unexpected error occurred");
        toast.error(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const validationSchema = Yup.object({
    date: Yup.date().required("Date is required"),
    checkIn: Yup.string().required("Check-in time is required"),
    checkOut: Yup.string()
      .nullable()
      .test(
        "checkout-after-checkin",
        "Check-out time must be after check-in time",
        function (value) {
          const { checkIn } = this.parent;
          if (!value || !checkIn) return true;
          return value > checkIn;
        }
      ),
    remarks: Yup.string(),
    onsite_or_remote: Yup.boolean(),
    check_in_ip: Yup.string(),
    check_out_ip: Yup.string(),
    employee: Yup.number()
      .required("Employee ID is required")
      .positive()
      .integer(),
  });

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);

    try {
      const attendanceData = {
        ...values,
        employee: parseInt(values.employee, 10),
        checkOut: values.checkOut || null,
      };

      console.log("Submitting attendance data:", attendanceData);
      const response = await updateAttendance(params.id, attendanceData);
      console.log("Update attendance response:", response);

      if (response.success) {
        resetForm();
        toast.success("Attendance updated successfully");
        setTimeout(() => {
          router.push(`/attendance-records/${params.id}/view`);
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to update attendance";
        console.error("Attendance update failed:", errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading attendance details...</p>
        </div>
      </div>
    );
  }

  if (error || !attendance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Attendance not found"}</p>
          <button
            onClick={() => router.push("/attendance-records")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Back to Attendance
          </button>
        </div>
      </div>
    );
  }

  const initialValues = {
    date: formatDateForInput(attendance.date),
    checkIn: attendance.checkIn || "",
    checkOut: attendance.checkOut || "",
    remarks: attendance.remarks || "",
    onsite_or_remote: attendance.onsite_or_remote !== false,
    check_in_ip: attendance.check_in_ip || "",
    check_out_ip: attendance.check_out_ip || "",
    employee: attendance.employee || "",
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <div className="w-full">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-3">
            <h1 className="text-2xl font-bold text-white">Edit Attendance</h1>
            <p className="text-blue-100 mt-1 text-sm">
              Update the attendance details below
            </p>
          </div>

          <div className="p-8">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting: formikSubmitting }) => (
                <Form className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-5">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Basic Information
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="date"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Date <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="date"
                          id="date"
                          name="date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <ErrorMessage
                          name="date"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="employee"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Employee <span className="text-red-500">*</span>
                        </label>
                        <Field name="employee">
                          {({ field, form }) => (
                            <AutoComplete
                              options={employees}
                              value={field.value}
                              onChange={(value) => form.setFieldValue("employee", value)}
                              placeholder="Search employee..."
                              displayKey="name"
                              valueKey="id"
                              error={form.touched.employee && form.errors.employee}
                            />
                          )}
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Time Information Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-5">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Time Information
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="checkIn"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Check In <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="time"
                          id="checkIn"
                          name="checkIn"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <ErrorMessage
                          name="checkIn"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="checkOut"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Check Out
                        </label>
                        <Field
                          type="time"
                          id="checkOut"
                          name="checkOut"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <ErrorMessage
                          name="checkOut"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-5">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Additional Information
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label
                          htmlFor="remarks"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Remarks
                        </label>
                        <Field
                          as="textarea"
                          id="remarks"
                          name="remarks"
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="Any additional notes..."
                        />
                        <ErrorMessage
                          name="remarks"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="check_in_ip"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Check In IP Address
                          </label>
                          <Field
                            type="text"
                            id="check_in_ip"
                            name="check_in_ip"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="192.168.1.1"
                          />
                          <ErrorMessage
                            name="check_in_ip"
                            component="div"
                            className="text-red-600 text-xs mt-1.5 font-medium"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="check_out_ip"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Check Out IP Address
                          </label>
                          <Field
                            type="text"
                            id="check_out_ip"
                            name="check_out_ip"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="192.168.1.2"
                          />
                          <ErrorMessage
                            name="check_out_ip"
                            component="div"
                            className="text-red-600 text-xs mt-1.5 font-medium"
                          />
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <Field
                            type="checkbox"
                            name="onsite_or_remote"
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            Onsite
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2 ml-8">
                          Check this if the employee was working onsite (uncheck for remote)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="text-red-500">*</span> Required fields
                    </p>
                    <div className="flex space-x-4 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => router.push(`/attendance-records/${params.id}/view`)}
                        className="flex-1 sm:flex-none px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting || formikSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        onClick={() => router.push(`/attendance-records/${params.id}/view`)}
                        className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        disabled={isSubmitting || formikSubmitting}
                      >
                        {isSubmitting || formikSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
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
                            Updating...
                          </span>
                        ) : (
                          "Update Attendance"
                        )}
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAttendancePage;
