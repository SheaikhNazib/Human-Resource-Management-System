"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { getEmployeesWithTodayAttendance, bulkSaveAttendance } from '@/actions/attendances/server-actions';
import { toast } from 'sonner';
import TableArchive from "@/components/core/TableArchive";

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [changedEmployeeIds, setChangedEmployeeIds] = useState(new Set());

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEmployeesWithTodayAttendance();
      
      if (result.success) {
        setEmployees(result.data);
        setChangedEmployeeIds(new Set()); // Reset changed employees when fetching fresh data
      } else {
        setError('Failed to fetch employees: ' + result.error);
      }
    } catch (err) {
      toast.error('Failed to fetch employees: ' + err.message);
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
    
    // Mark this employee as changed
    setChangedEmployeeIds(prev => new Set(prev).add(employeeId));
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

  // Human-friendly current date for display in the header
  const formattedDate = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const handleUpdateAttendance = async () => {
    // Check if there are any changes
    if (changedEmployeeIds.size === 0) {
      toast.error('No changes detected. Please modify attendance times before updating.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      // Only prepare attendance records for employees that have been changed
      const changedEmployees = employees.filter(employee => 
        changedEmployeeIds.has(employee.id)
      );

      const attendanceRecords = changedEmployees.map(employee => ({
        employeeId: employee.id,
        employeeName: employee.name,
        date: employee.date,
        checkInTime: employee.checkInTime,
        checkOutTime: employee.checkOutTime,
        attendanceId: employee.attendanceId,
        remarks: employee.remarks || ''
      }));

      const result = await bulkSaveAttendance(attendanceRecords);

      if (result.success) {
        toast.success(`Successfully saved attendance for ${result.successCount} employee(s)!`);
        setChangedEmployeeIds(new Set()); // Clear changed employees after successful save
      } else if (result.successCount > 0) {
        toast.success(`Saved attendance for ${result.successCount} employee(s). ${result.failCount} failed.`);
        const failedEmployees = result.results
          .filter(r => !r.success)
          .map(r => {
            const emp = employees.find(e => e.id === r.employeeId);
            return emp?.name || `Employee ${r.employeeId}`;
          })
          .join(', ');
        toast.error(`Failed for: ${failedEmployees}`);
        
        // Remove successfully saved employees from changed set
        const failedIds = new Set(result.results.filter(r => !r.success).map(r => r.employeeId));
        setChangedEmployeeIds(failedIds);
      } else {
        toast.error('Failed to save attendance: ' + result.error);
      }

      // Refresh the form with updated data
      setTimeout(() => {
        setSuccessMessage('');
        fetchEmployees();
      }, 3000);

    } catch (err) {
      toast.error('Failed to update attendance: ' + err.message);
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
      render: (emp) => {
        const isChanged = changedEmployeeIds.has(emp.id);
        return (
          <div className="relative">
            <input
              type="time"
              value={emp.checkInTime}
              onChange={(e) => handleTimeChange(emp.id, 'checkInTime', e.target.value)}
              className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 bg-white text-zinc-900 text-sm ${
                isChanged 
                  ? 'border-yellow-400 dark:border-yellow-500 ring-1 ring-yellow-400 dark:ring-yellow-500' 
                  : 'border-zinc-300 dark:border-zinc-600'
              }`}
            />
            {isChanged && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            )}
          </div>
        );
      }
    },
    {
      header: "Check Out Time",
      accessor: "checkOutTime",
      render: (emp) => {
        const isChanged = changedEmployeeIds.has(emp.id);
        return (
          <div className="relative">
            <input
              type="time"
              value={emp.checkOutTime}
              onChange={(e) => handleTimeChange(emp.id, 'checkOutTime', e.target.value)}
              className={`px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 bg-white text-zinc-900 text-sm ${
                isChanged 
                  ? 'border-yellow-400 dark:border-yellow-500 ring-1 ring-yellow-400 dark:ring-yellow-500' 
                  : 'border-zinc-300 dark:border-zinc-600'
              }`}
            />
            {isChanged && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            )}
          </div>
        );
      }
    },
    {
      header: "Remarks",
      accessor: "remarks",
      render: (emp) => {
        const isChanged = changedEmployeeIds.has(emp.id);
        return (
          <div className="relative">
            <input
              type="text"
              value={emp.remarks || ''}
              onChange={(e) => handleTimeChange(emp.id, 'remarks', e.target.value)}
              placeholder="Remarks"
              className={`px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100 bg-white text-zinc-900 text-sm w-full ${
                isChanged ? 'border-yellow-400 dark:border-yellow-500' : 'border-zinc-300 dark:border-zinc-600'
              }`}
            />
            {isChanged && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            )}
          </div>
        );
      }
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
        title={
          <div className="flex items-center justify-between w-full text-white">
            <span className="font-semibold">Employee Attendance</span>
            <span className="text-sm text-white">{formattedDate}</span>
          </div>
        }
        columns={columns}
        data={filteredEmployees}
        loading={loading}
        error={error}
        emptyMessage="No employees found."
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, email, job title, or department..."
        createButtonOnClick={employees.length > 0 ? handleUpdateAttendance : null}
        createButtonText={
          submitting 
            ? 'Updating...' 
            : changedEmployeeIds.size > 0 
              ? `Update Attendance (${changedEmployeeIds.size})` 
              : 'Update Attendance'
        }
        createButtonClassName={`ml-2 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
          changedEmployeeIds.size > 0 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-400 text-white cursor-not-allowed'
        }`}
        showRefreshButton={true}
        onRefresh={fetchEmployees}
        className="max-w-full"
      />
    </div>
  );
}
