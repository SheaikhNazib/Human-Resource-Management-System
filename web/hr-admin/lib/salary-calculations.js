/**
 * Salary calculation utilities for deductions based on leaves and attendance
 * 
 * DEDUCTION RULES:
 * ================
 * 
 * 1. LEAVE DEDUCTION:
 *    - Formula: (Base Salary / 30) × Number of Leave Days
 *    - Only approved leaves are counted
 *    - Calculated for the month matching the effective date
 * 
 * 2. ATTENDANCE LATE DEDUCTION:
 *    - Working Hours: 10:00 AM to 5:00 PM (7 hours/day)
 *    - Grace Period: Until 10:30 AM (No deduction)
 *    - After 10:30 AM: Deduct hourly salary for each hour late (rounded up)
 *    - Hourly Rate: (Base Salary / 30 days) / 7 hours
 *    - Example: If check-in at 11:45 AM, that's 1.25 hours late → deduct 2 hours
 * 
 * 3. TOTAL DEDUCTION:
 *    - Total = Leave Deduction + Attendance Late Deduction + Manual Deductions
 *    - Manual deductions can be added on top of automatic calculations
 */

/**
 * Calculate leave deduction based on number of leave days
 * Formula: (Base Salary / 30) * Number of Leave Days
 * 
 * @param {number} baseSalary - The employee's base monthly salary
 * @param {number} leaveDays - Number of leave days taken
 * @returns {number} - The deduction amount
 */
export function calculateLeaveDeduction(baseSalary, leaveDays) {
  if (!baseSalary || !leaveDays || leaveDays <= 0) return 0;
  
  const perDayRate = baseSalary / 30;
  return perDayRate * leaveDays;
}

/**
 * Calculate attendance late deduction based on check-in time
 * Working hours: 10:00 AM to 5:00 PM (7 hours)
 * Grace period: Until 10:30 AM (no deduction)
 * After 10:30 AM: Deduct 1 hour salary for each hour late
 * 
 * @param {number} baseSalary - The employee's base monthly salary
 * @param {string} checkInTime - Check-in time in HH:MM or HH:MM:SS format
 * @returns {number} - The deduction amount
 */
export function calculateLateDeduction(baseSalary, checkInTime) {
  if (!baseSalary || !checkInTime) return 0;
  
  try {
    // Parse check-in time
    const [hours, minutes] = checkInTime.split(':').map(Number);
    const checkInMinutes = hours * 60 + minutes;
    
    // Grace period until 10:30 AM (630 minutes)
    const gracePeriodMinutes = 10 * 60 + 30; // 10:30 AM
    
    // If check-in is before or at grace period, no deduction
    if (checkInMinutes <= gracePeriodMinutes) {
      return 0;
    }
    
    // Calculate how many minutes late after grace period
    const lateMinutes = checkInMinutes - gracePeriodMinutes;
    
    // Calculate hours late (rounded up to nearest hour)
    const hoursLate = Math.ceil(lateMinutes / 60);
    
    // Calculate hourly rate (assuming 7 working hours per day, 30 days per month)
    const perDayRate = baseSalary / 30;
    const perHourRate = perDayRate / 7;
    
    return perHourRate * hoursLate;
  } catch (error) {
    console.error('Error calculating late deduction:', error);
    return 0;
  }
}

/**
 * Calculate total attendance deduction for a month based on all attendance records
 * 
 * @param {number} baseSalary - The employee's base monthly salary
 * @param {Array} attendanceRecords - Array of attendance records with checkIn times
 * @returns {number} - The total deduction amount
 */
export function calculateTotalAttendanceDeduction(baseSalary, attendanceRecords) {
  if (!baseSalary || !attendanceRecords || !Array.isArray(attendanceRecords)) {
    return 0;
  }
  
  return attendanceRecords.reduce((total, record) => {
    const checkIn = record.checkIn || record.check_in || record.checkInTime;
    if (!checkIn) return total;
    
    return total + calculateLateDeduction(baseSalary, checkIn);
  }, 0);
}

/**
 * Calculate total deduction (leaves + attendance)
 * 
 * @param {number} baseSalary - The employee's base monthly salary
 * @param {number} leaveDays - Number of leave days taken
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} - Breakdown of deductions
 */
export function calculateTotalDeduction(baseSalary, leaveDays, attendanceRecords) {
  const leaveDeduction = calculateLeaveDeduction(baseSalary, leaveDays);
  const attendanceDeduction = calculateTotalAttendanceDeduction(baseSalary, attendanceRecords);
  
  return {
    leaveDeduction,
    attendanceDeduction,
    totalAutoDeduction: leaveDeduction + attendanceDeduction,
  };
}

/**
 * Get approved leave days for an employee in a specific month/year
 * 
 * @param {Array} leaves - Array of leave records
 * @param {number} employeeId - The employee ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2025)
 * @returns {number} - Total approved leave days
 */
export function getApprovedLeaveDays(leaves, employeeId, month, year) {
  if (!leaves || !Array.isArray(leaves)) return 0;
  
  // Convert employeeId to number for comparison
  const empIdNum = Number(employeeId);
  
  return leaves
    .filter(leave => {
      // Only count approved leaves
      if (leave.status !== 'approved') return false;
      
      // Check if leave belongs to the employee (compare as numbers)
      const leaveEmpId = Number(leave.employeeId || leave.employee);
      if (leaveEmpId !== empIdNum) return false;
      
      // Check if leave falls within the specified month/year
      const startDate = new Date(leave.startDate || leave.start_date);
      const endDate = new Date(leave.endDate || leave.end_date);
      
      const targetStart = new Date(year, month - 1, 1);
      const targetEnd = new Date(year, month, 0);
      
      // Check if leave overlaps with target month
      return startDate <= targetEnd && endDate >= targetStart;
    })
    .reduce((total, leave) => total + (leave.leave_days || leave.leaveDays || 0), 0);
}

/**
 * Get attendance records for an employee in a specific month/year
 * 
 * @param {Array} attendances - Array of attendance records
 * @param {number} employeeId - The employee ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2025)
 * @returns {Array} - Filtered attendance records
 */
export function getMonthlyAttendance(attendances, employeeId, month, year) {
  if (!attendances || !Array.isArray(attendances)) return [];
  
  // Convert employeeId to number for comparison
  const empIdNum = Number(employeeId);
  
  return attendances.filter(attendance => {
    // Check if attendance belongs to the employee (compare as numbers)
    const attendanceEmpId = Number(attendance.employee || attendance.employee_id || attendance.employeeId);
    if (attendanceEmpId !== empIdNum) {
      return false;
    }
    
    // Check if attendance is in the specified month/year
    const attendanceDate = new Date(attendance.date);
    return attendanceDate.getMonth() + 1 === month && attendanceDate.getFullYear() === year;
  });
}
