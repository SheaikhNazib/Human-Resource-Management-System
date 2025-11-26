"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { fetchFromApi } from '@/lib/axios';
import { Api_path } from '@/constant/api-path';
import TableArchive from "@/components/core/TableArchive";

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFromApi(Api_path.EMPLOYEE.LIST);
      const body = response?.data ?? response;
      
      let employeesList = [];
      if (Array.isArray(body)) {
        employeesList = body;
      } else if (Array.isArray(body.data)) {
        employeesList = body.data;
      } else if (Array.isArray(body?.data?.data)) {
        employeesList = body.data.data;
      }

      // Get current time in HH:MM format
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const currentDate = now.toISOString().split('T')[0];

      // Initialize each employee with current time for check-in and check-out
      const initializedEmployees = employeesList.map(emp => ({
        id: emp.id,
        firstName: emp.first_name || emp.firstName || '',
        lastName: emp.last_name || emp.lastName || '',
        name: `${emp.first_name || emp.firstName || ''} ${emp.last_name || emp.lastName || ''}`.trim() || emp.name || `Employee ${emp.id}`,
        email: emp.email || '',
        jobTitle: emp.job_title || emp.jobTitle || '',
        department: emp.department || '',
        checkInTime: currentTime,
        checkOutTime: currentTime,
        date: currentDate
      }));

      setEmployees(initializedEmployees);
    } catch (err) {
      setError('Failed to fetch employees: ' + err.message);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (employeeId, field, value) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(emp =>
        emp.id === employeeId ? { ...emp, [field]: value } : emp
      )
    );
  };

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    
    const query = searchQuery.toLowerCase();
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      (emp.jobTitle && emp.jobTitle.toLowerCase().includes(query)) ||
      (emp.department && emp.department.toLowerCase().includes(query))
    );
  }, [employees, searchQuery]);

  const handleUpdateAttendance = async () => {
    setSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Create attendance records for all employees (not just filtered ones)
      const attendancePromises = employees.map(async (employee) => {
        const formatTime = (time) => {
          if (!time) return null;
          // Add seconds if not present
          if (time.length === 5) return `${time}:00`;
          return time;
        };

        const payload = {
          date: employee.date,
          checkIn: formatTime(employee.checkInTime),
          checkOut: formatTime(employee.checkOutTime),
          remarks: "",
          onsite_or_remote: true,
          check_in_ip: "",
          check_out_ip: "",
          employee: employee.id,
        };

        try {
          const response = await fetchFromApi(Api_path.ATTENDANCE.CREATE, {
            method: "POST",
            body: payload,
          });

          const responseData = response?.data?.data ?? response?.data ?? response;
          
          if (responseData?.statusCode >= 400) {
            throw new Error(responseData?.message || 'Failed to create attendance');
          }

          return { success: true, employeeName: employee.name };
        } catch (err) {
          console.error(`Error creating attendance for ${employee.name}:`, err);
          return { success: false, employeeName: employee.name, error: err.message };
        }
      });

      const results = await Promise.all(attendancePromises);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (failCount === 0) {
        setSuccessMessage(`Successfully created attendance for ${successCount} employee(s)!`);
      } else {
        setSuccessMessage(`Created attendance for ${successCount} employee(s). ${failCount} failed.`);
        const failedEmployees = results.filter(r => !r.success).map(r => r.employeeName).join(', ');
        setError(`Failed for: ${failedEmployees}`);
      }

      // Optionally refresh the form with current time
      setTimeout(() => {
        setSuccessMessage('');
        fetchEmployees();
      }, 3000);

    } catch (err) {
      setError('Failed to update attendance: ' + err.message);
      console.error('Error updating attendance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Employee Name",
      accessor: "name",
      render: (emp) => {
        const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {initials || '—'}
            </div>
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {emp.name}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {emp.jobTitle || 'N/A'}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: "Department",
      accessor: "department",
      render: (emp) => emp.department || 'N/A'
    },
    {
      header: "Check In Time",
      accessor: "checkInTime",
      render: (emp) => (
        <input
          type="time"
          value={emp.checkInTime}
          onChange={(e) => handleTimeChange(emp.id, 'checkInTime', e.target.value)}
          className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 bg-white text-zinc-900 text-sm"
        />
      )
    },
    {
      header: "Check Out Time",
      accessor: "checkOutTime",
      render: (emp) => (
        <input
          type="time"
          value={emp.checkOutTime}
          onChange={(e) => handleTimeChange(emp.id, 'checkOutTime', e.target.value)}
          className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 bg-white text-zinc-900 text-sm"
        />
      )
    }
  ];

  return (
    <div className="max-w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      <TableArchive
        title="Employee Attendance"
        columns={columns}
        data={filteredEmployees}
        loading={loading}
        error={error}
        emptyMessage="No employees found."
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, email, job title, or department..."
        createButtonOnClick={employees.length > 0 ? handleUpdateAttendance : null}
        createButtonText={submitting ? 'Updating...' : 'Update Attendance'}
        createButtonClassName="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
        showRefreshButton={true}
        onRefresh={fetchEmployees}
        className="max-w-full"
      />
    </div>
  );
}
