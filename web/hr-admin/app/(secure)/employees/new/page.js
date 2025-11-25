'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createEmployee } from '@/actions/employees/server-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AddEmployeePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required('Full name is required'),
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    personal_email: Yup.string().email('Invalid email').required('Personal email is required'),
    work_email: Yup.string().email('Invalid email').required('Work email is required'),
    mobile: Yup.string().required('Mobile number is required'),
    office_phone: Yup.string(),
    address: Yup.string().required('Address is required'),
    full_address: Yup.string().required('Full address is required'),
    hire_date: Yup.date().required('Hire date is required'),
    leave_date: Yup.date().nullable(),
    current_or_former_emp: Yup.boolean(),
    emp_department: Yup.number().required('Department is required').positive().integer(),
    emp_job_title: Yup.number().required('Job title is required').positive().integer(),
  });

  const initialValues = {
    name: '',
    first_name: '',
    last_name: '',
    personal_email: '',
    work_email: '',
    mobile: '',
    office_phone: '',
    address: '',
    full_address: '',
    hire_date: '',
    leave_date: '',
    current_or_former_emp: true,
    emp_department: '',
    emp_job_title: '',
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    // toasts will show errors/success, no local submit state needed

    try {
      // Convert form values to match API expectations
      const employeeData = {
        ...values,
        emp_department: parseInt(values.emp_department, 10),
        emp_job_title: parseInt(values.emp_job_title, 10),
        leave_date: values.leave_date || null,
      };

      console.log('Submitting employee data:', employeeData);
      const response = await createEmployee(employeeData);
      console.log('Create employee response:', response);

      if (response.success) {
        resetForm();
        toast.success('Employee created successfully');
        // Redirect to employees list after 1.5 seconds
        setTimeout(() => {
          router.push('/employees');
        }, 1500);
      } else {
        const errorMsg = response.error || 'Failed to create employee';
        console.error('Employee creation failed:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="w-full">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-3">
            <h1 className="text-2xl font-bold text-white">Add New Employee</h1>
            <p className="text-blue-100 mt-1 text-sm">Fill in the employee details below</p>
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
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          id="name"
                          name="name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="John Doe"
                        />
                        <ErrorMessage name="name" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>

                      <div>
                        <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          id="first_name"
                          name="first_name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="John"
                        />
                        <ErrorMessage name="first_name" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>

                      <div>
                        <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          id="last_name"
                          name="last_name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Doe"
                        />
                        <ErrorMessage name="last_name" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-5">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">Contact Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="personal_email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Personal Email <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="email"
                          id="personal_email"
                          name="personal_email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="john.doe@gmail.com"
                        />
                        <ErrorMessage name="personal_email" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>

                      <div>
                        <label htmlFor="work_email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Work Email <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="email"
                          id="work_email"
                          name="work_email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="john.doe@company.com"
                        />
                        <ErrorMessage name="work_email" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>

                      <div>
                        <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2">
                          Mobile <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="tel"
                          id="mobile"
                          name="mobile"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="+1234567890"
                        />
                        <ErrorMessage name="mobile" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>

                      <div>
                        <label htmlFor="office_phone" className="block text-sm font-semibold text-gray-700 mb-2">
                          Office Phone
                        </label>
                        <Field
                          type="tel"
                          id="office_phone"
                          name="office_phone"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="+0987654321"
                        />
                        <ErrorMessage name="office_phone" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-5">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">Address</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          id="address"
                          name="address"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="123 Main St"
                        />
                        <ErrorMessage name="address" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>

                      <div>
                        <label htmlFor="full_address" className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Address <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="textarea"
                          id="full_address"
                          name="full_address"
                          rows="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="123 Main St, City, Country"
                        />
                        <ErrorMessage name="full_address" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>
                    </div>
                  </div>

                  {/* Employment Information Section */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-5">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">Employment Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="hire_date" className="block text-sm font-semibold text-gray-700 mb-2">
                          Hire Date <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="date"
                          id="hire_date"
                          name="hire_date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <ErrorMessage name="hire_date" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>

                      <div>
                        <label htmlFor="leave_date" className="block text-sm font-semibold text-gray-700 mb-2">
                          Leave Date
                        </label>
                        <Field
                          type="date"
                          id="leave_date"
                          name="leave_date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <ErrorMessage name="leave_date" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                      </div>

                      <div>
                        <label htmlFor="emp_department" className="block text-sm font-semibold text-gray-700 mb-2">
                          Department ID <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="number"
                          id="emp_department"
                          name="emp_department"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="e.g., 2 (HR), 5 (Human Resources)"
                        />
                        <ErrorMessage name="emp_department" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                        <p className="text-xs text-gray-500 mt-1.5">Valid IDs: 2, 5, 6, 7, 8, 9, 10, 11, 12, 13</p>
                      </div>

                      <div>
                        <label htmlFor="emp_job_title" className="block text-sm font-semibold text-gray-700 mb-2">
                          Job Title ID <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="number"
                          id="emp_job_title"
                          name="emp_job_title"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="e.g., 5 (Software Engineer), 9 (HR Officer)"
                        />
                        <ErrorMessage name="emp_job_title" component="div" className="text-red-600 text-xs mt-1.5 font-medium" />
                        <p className="text-xs text-gray-500 mt-1.5">Valid IDs: 5, 9, 10, 11, 12, 13, 14, 15, etc.</p>
                      </div>

                      <div className="md:col-span-2 bg-white rounded-lg p-4 border border-gray-200">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <Field
                            type="checkbox"
                            name="current_or_former_emp"
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm font-semibold text-gray-700">Current Employee</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2 ml-8">Check this if the employee is currently active</p>
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
                          onClick={() => router.push('/employees')}
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
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating...
                            </span>
                          ) : 'Create Employee'}
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
