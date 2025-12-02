"use client";

import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createEmployee } from "@/actions/employees/server-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  parsePhoneNumberFromString,
  getExampleNumber,
} from "libphonenumber-js";
import AutoComplete from "@/components/ui/autoComplete";
import { getDepartmentsList } from "@/actions/departments/server-actions";
import { getJobTitlesList } from "@/actions/job-titles/server-actions";

const AddEmployeePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingJobTitles, setLoadingJobTitles] = useState(true);

  const validationSchema = Yup.object({
    name: Yup.string(),
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string(),
    personal_email: Yup.string()
      .email("Invalid email")
      .required("Personal email is required"),
    work_email: Yup.string()
      .required("Work email is required")
      .nullable()
      .transform((value, originalValue) => {
        // Convert empty string to null for optional validation
        return originalValue === "" || originalValue === null || originalValue === undefined ? null : value;
      })
      .email("Invalid email"),
    mobile: Yup.string(),
    office_phone: Yup.string(),
    address: Yup.string(),
    full_address: Yup.string(),
    hire_date: Yup.date().nullable().required("Hire date is required"),
    leave_date: Yup.date()
      .nullable()
      .test(
        "leave-after-hire",
        "Leave date cannot be before hire date",
        function (value) {
          const { hire_date } = this.parent;
          if (!value) return true; // empty leave date is allowed
          if (!hire_date) return true; // hire date validation will handle required
          try {
            const leave = new Date(value);
            const hire = new Date(hire_date);
            return leave.getTime() >= hire.getTime();
          } catch (e) {
            return false;
          }
        }
      ),
    current_or_former_emp: Yup.boolean(),
    emp_department: Yup.number()
      .positive()
      .integer()
      .required('Department is required'),
    emp_job_title: Yup.number()
      .positive()
      .integer()
      .required('Job title is required'),
  });

  const initialValues = {
    name: "",
    first_name: "",
    last_name: "",
    personal_email: "",
    work_email: "",
    mobile: "",
    office_phone: "",
    address: "",
    full_address: "",
    hire_date: "",
    leave_date: "",
    current_or_former_emp: true,
    emp_department: "",
    emp_job_title: "",
  };

  const [selectedCountry, setSelectedCountry] = useState("bd");
  const [selectedOfficeCountry, setSelectedOfficeCountry] = useState("bd");

  // Fetch departments and job titles on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const response = await getDepartmentsList();
        if (response.success && response.data) {
          setDepartments(response.data);
        } else {
          toast.error(response.error || 'Failed to load departments');
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    const fetchJobTitles = async () => {
      try {
        setLoadingJobTitles(true);
        const response = await getJobTitlesList();
        if (response.success && response.data) {
          setJobTitles(response.data);
        } else {
          toast.error(response.error || 'Failed to load job titles');
        }
      } catch (error) {
        console.error('Error fetching job titles:', error);
        toast.error('Failed to load job titles');
      } finally {
        setLoadingJobTitles(false);
      }
    };

    fetchDepartments();
    fetchJobTitles();
  }, []);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    // toasts will show errors/success, no local submit state needed

    try {
      // Convert form values to match API expectations
      // First, normalize empty strings -> null for optional fields so backend email/date validators don't see empty strings
      const sanitized = Object.fromEntries(
        Object.entries(values).map(([k, v]) => {
          if (typeof v === "string" && v.trim() === "") return [k, null];
          return [k, v];
        })
      );

      // Normalize dates more strictly: convert YYYY-MM-DD to explicit UTC ISO
      const normalizeDate = (val) => {
        if (!val) return null;
        // if already a Date
        if (val instanceof Date && !isNaN(val)) return val.toISOString();
        // if already ISO-ish, try to construct Date and return ISO
        try {
          // Accept YYYY-MM-DD by appending time and Z to force UTC
          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            return new Date(`${val}T00:00:00.000Z`).toISOString();
          }
          const d = new Date(val);
          if (!isNaN(d)) return d.toISOString();
        } catch (e) {
          return null;
        }
        return null;
      };

      const employeeData = {
        ...sanitized,
        // ensure department/job title are integers (required fields)
        emp_department: Number(sanitized.emp_department),
        emp_job_title: Number(sanitized.emp_job_title),
        // convert date-only inputs (YYYY-MM-DD) to full ISO strings, or null if empty
        hire_date: normalizeDate(sanitized.hire_date),
        leave_date: normalizeDate(sanitized.leave_date),
        // ensure work_email is null if empty
        work_email: sanitized.work_email || null,
      };

      // Remove null/undefined keys so backend validators don't run for absent optional fields
      const cleanedPayload = Object.fromEntries(
        Object.entries(employeeData).filter(([, v]) => v !== null && v !== undefined)
      );

      console.log("Submitting employee data:", cleanedPayload);
      const response = await createEmployee(cleanedPayload);
      console.log("Create employee response:", response);

      if (response.success) {
        resetForm();
        toast.success("Employee created successfully");
        // Redirect to employees list after 1.5 seconds
        setTimeout(() => {
          router.push("/employees");
        }, 1500);
      } else {
        const errorMsg = response.error || "Failed to create employee";
        console.error("Employee creation failed:", errorMsg);
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

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      <div className="w-full">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-3">
            <h1 className="text-2xl font-bold text-white">Add New Employee</h1>
            <p className="text-blue-100 mt-1 text-sm">
              Fill in the employee details below
            </p>
          </div>

          <div className="p-8">
            {/* Sonner Toaster is provided globally in app/layout.js */}
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting: formikSubmitting }) => (
                <Form className="space-y-8">
                  {/* Personal Information Section */}
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Personal Information
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="first_name"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          id="first_name"
                          name="first_name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="John"
                        />
                        <ErrorMessage
                          name="first_name"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="last_name"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Last Name
                        </label>
                        <Field
                          type="text"
                          id="last_name"
                          name="last_name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Doe"
                        />
                        <ErrorMessage
                          name="last_name"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Contact Information
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="personal_email"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Personal Email <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="email"
                          id="personal_email"
                          name="personal_email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="john.doe@gmail.com"
                        />
                        <ErrorMessage
                          name="personal_email"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="work_email"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Work Email <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="email"
                          id="work_email"
                          name="work_email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="john.doe@company.com"
                        />
                        <ErrorMessage
                          name="work_email"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="mobile"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Mobile 
                        </label>
                        <Field name="mobile">
                          {({ field, form }) => (
                            <div>
                              <PhoneInput
                                country={selectedCountry}
                                value={field.value || ""}
                                onChange={(val, country) => {
                                  // react-phone-input-2 returns numbers without leading '+' in many cases
                                  const normalized = val
                                    ? val.startsWith("+")
                                      ? val
                                      : `+${val}`
                                    : "";
                                  form.setFieldValue("mobile", normalized);
                                  if (country?.countryCode)
                                    setSelectedCountry(
                                      country.countryCode.toLowerCase()
                                    );
                                  // clear any previous manual errors while typing
                                  form.setFieldError("mobile", undefined);
                                }}
                                onBlur={() => {
                                  const v = form.values.mobile;
                                  if (!v) return;
                                  try {
                                    const parsed =
                                      parsePhoneNumberFromString(v);
                                    if (
                                      parsed &&
                                      parsed.isValid &&
                                      parsed.isValid()
                                    ) {
                                      form.setFieldValue(
                                        "mobile",
                                        parsed.format("E.164")
                                      );
                                      form.setFieldError("mobile", undefined);
                                    } else {
                                      form.setFieldError(
                                        "mobile",
                                        "Enter a valid phone number"
                                      );
                                    }
                                  } catch (err) {
                                    form.setFieldError(
                                      "mobile",
                                      "Enter a valid phone number"
                                    );
                                  }
                                }}
                                inputProps={{
                                  name: "mobile",
                                  required: false,
                                  autoFocus: false,
                                  placeholder: "(555) 555-5555",
                                }}
                                inputStyle={{ width: "100%" }}
                                enableSearch={true}
                                disableSearchIcon={true}
                              />
                              <ErrorMessage
                                name="mobile"
                                component="div"
                                className="text-red-600 text-xs mt-1.5 font-medium"
                              />
                            </div>
                          )}
                        </Field>
                      </div>

                      <div>
                        <label
                          htmlFor="office_phone"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Office Phone
                        </label>
                        <Field name="office_phone">
                          {({ field, form }) => (
                            <div>
                              <PhoneInput
                                country={selectedOfficeCountry}
                                value={field.value || ""}
                                onChange={(val, country) => {
                                  const normalized = val
                                    ? val.startsWith("+")
                                      ? val
                                      : `+${val}`
                                    : "";
                                  form.setFieldValue(
                                    "office_phone",
                                    normalized
                                  );
                                  if (country?.countryCode)
                                    setSelectedOfficeCountry(
                                      country.countryCode.toLowerCase()
                                    );
                                  form.setFieldError("office_phone", undefined);
                                }}
                                onBlur={() => {
                                  const v = form.values.office_phone;
                                  if (!v) return; // optional field
                                  try {
                                    const parsed =
                                      parsePhoneNumberFromString(v);
                                    if (
                                      parsed &&
                                      parsed.isValid &&
                                      parsed.isValid()
                                    ) {
                                      form.setFieldValue(
                                        "office_phone",
                                        parsed.format("E.164")
                                      );
                                      form.setFieldError(
                                        "office_phone",
                                        undefined
                                      );
                                    } else {
                                      form.setFieldError(
                                        "office_phone",
                                        "Enter a valid phone number"
                                      );
                                    }
                                  } catch (err) {
                                    form.setFieldError(
                                      "office_phone",
                                      "Enter a valid phone number"
                                    );
                                  }
                                }}
                                inputProps={{
                                  name: "office_phone",
                                  required: false,
                                  autoFocus: false,
                                  placeholder: "(555) 555-5555",
                                }}
                                inputStyle={{ width: "100%" }}
                                enableSearch={true}
                                disableSearchIcon={true}
                              />
                              <ErrorMessage
                                name="office_phone"
                                component="div"
                                className="text-red-600 text-xs mt-1.5 font-medium"
                              />
                            </div>
                          )}
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Address
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label
                          htmlFor="address"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Address
                        </label>
                        <Field
                          type="text"
                          id="address"
                          name="address"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="123 Main St"
                        />
                        <ErrorMessage
                          name="address"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="full_address"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Full Address
                        </label>
                        <Field
                          as="textarea"
                          id="full_address"
                          name="full_address"
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="123 Main St, City, Country"
                        />
                        <ErrorMessage
                          name="full_address"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Employment Information Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-5">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
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
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Employment Information
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="hire_date"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Hire Date <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="date"
                          id="hire_date"
                          name="hire_date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <ErrorMessage
                          name="hire_date"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="leave_date"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Leave Date
                        </label>
                        <Field
                          type="date"
                          id="leave_date"
                          name="leave_date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <ErrorMessage
                          name="leave_date"
                          component="div"
                          className="text-red-600 text-xs mt-1.5 font-medium"
                        />
                      </div>

                      <div>
                        <Field name="emp_department">
                          {({ field, form }) => (
                            <AutoComplete
                              label={<><span>Department </span><span className="text-red-500">*</span></>}
                              options={departments}
                              value={field.value}
                              onChange={(value) => form.setFieldValue('emp_department', value)}
                              placeholder={loadingDepartments ? "Loading departments..." : "Select a department"}
                              displayKey="name"
                              valueKey="id"
                              disabled={loadingDepartments}
                              error={form.touched.emp_department && form.errors.emp_department}
                            />
                          )}
                        </Field>
                      </div>

                      <div>
                        <Field name="emp_job_title">
                          {({ field, form }) => (
                            <AutoComplete
                              label={<><span>Job Title </span><span className="text-red-500">*</span></>}
                              options={jobTitles}
                              value={field.value}
                              onChange={(value) => form.setFieldValue('emp_job_title', value)}
                              placeholder={loadingJobTitles ? "Loading job titles..." : "Select a job title"}
                              displayKey="name"
                              valueKey="id"
                              disabled={loadingJobTitles}
                              error={form.touched.emp_job_title && form.errors.emp_job_title}
                            />
                          )}
                        </Field>
                      </div>

                      <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <Field
                            type="checkbox"
                            name="current_or_former_emp"
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            Current Employee
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2 ml-8">
                          Check this if the employee is currently active
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
                        onClick={() => router.push("/employees")}
                        className="flex-1 sm:flex-none px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting || formikSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        disabled={isSubmitting || formikSubmitting}
                      >
                        {isSubmitting || formikSubmitting ? (
                          <span className="flex items-center justify-center">
                            <Loader size={20} className="inline-flex" />
                            Creating...
                          </span>
                        ) : (
                          "Create Employee"
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

export default AddEmployeePage;
