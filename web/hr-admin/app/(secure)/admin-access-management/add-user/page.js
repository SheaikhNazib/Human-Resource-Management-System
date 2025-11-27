"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/actions/users";
import { getDepartmentsList } from "@/actions/departments/server-actions";
import { getJobTitlesList } from "@/actions/job-titles/server-actions";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import AutoComplete from "@/components/ui/autoComplete";

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingJobTitles, setLoadingJobTitles] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "hr_manager",
    isActive: true,
    emp_department: "",
    emp_job_title: "",
  });

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!formData.emp_department) {
      toast.error("Department is required");
      return;
    }

    if (!formData.emp_job_title) {
      toast.error("Job title is required");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creating user...");

    try {
      // Ensure data types are correct for backend
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive,
        emp_department: parseInt(formData.emp_department, 10),
        emp_job_title: parseInt(formData.emp_job_title, 10),
      };

      console.log("Sending user data:", userData);
      const response = await createUser(userData);
      console.log("Create user response:", response);

      if (response.success) {
        toast.success("User and employee created successfully", { id: toastId });
        router.push("/admin-access-management/user-role");
      } else {
        console.error("User creation failed:", response);
        toast.error(response.error || "Failed to create user", { id: toastId });
      }
    } catch (error) {
      toast.error(error.message || "Failed to create user", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin-access-management/user-role"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to User Roles
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Add New User</h1>
            <p className="text-sm text-zinc-600">
              Create a new user account with specific role
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="user@example.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              disabled={loading}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              placeholder="Minimum 6 characters"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          {/* Role Field */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <option value="hr_manager">HR Manager</option>
              <option value="accountant">Accountant</option>
              <option value="manager">Manager</option>
              {/* <option value="employee">Employee</option> */}
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Select the appropriate role for this user
            </p>
          </div>

          {/* Department Field */}
          <div>
            <AutoComplete
              label="Department"
              options={departments}
              value={formData.emp_department}
              onChange={(value) => setFormData((prev) => ({ ...prev, emp_department: value }))}
              placeholder={loadingDepartments ? "Loading departments..." : "Select a department"}
              displayKey="name"
              valueKey="id"
              disabled={loading || loadingDepartments}
              required
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Select the department for this user
            </p>
          </div>

          {/* Job Title Field */}
          <div>
            <AutoComplete
              label="Job Title"
              options={jobTitles}
              value={formData.emp_job_title}
              onChange={(value) => setFormData((prev) => ({ ...prev, emp_job_title: value }))}
              placeholder={loadingJobTitles ? "Loading job titles..." : "Select a job title"}
              displayKey="name"
              valueKey="id"
              disabled={loading || loadingJobTitles}
              required
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Select the job title for this user
            </p>
          </div>

          {/* Active Status Field */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={loading}
              className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-zinc-700"
            >
              Active User
            </label>
          </div>
          <p className="text-xs text-zinc-500 -mt-4 ml-7">
            Inactive users cannot log in to the system
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create User
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin-access-management/user-role")}
              disabled={loading}
              className="px-6 py-2.5 border border-zinc-300 rounded-lg font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
