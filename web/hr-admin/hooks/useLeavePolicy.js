/**
 * useLeavePolicy Hook
 * Calculates leave entitlements, usage, and remaining leaves based on company policy
 * 
 * Policy Rules:
 * - Casual Leave (CL): 10 days/year, eligible after 3 months
 * - Sick Leave (SL): 14 days/year, prorated in first 3 months
 * - Annual Leave (AL): 14 days/year, eligible after 12 months
 * 
 * @param {string} joinDate - Employee's joining date (ISO format)
 * @param {Array} leaves - Array of leave records
 * @returns {Object} Leave policy calculations and utilities
 */

import { useMemo } from 'react';

export const useLeavePolicy = (joinDate, leaves = []) => {
  return useMemo(() => {
    if (!joinDate) {
      return {
        casual: { total: 0, used: 0, remaining: 0, eligible: false },
        sick: { total: 0, used: 0, remaining: 0, eligible: false },
        annual: { total: 0, used: 0, remaining: 0, eligible: false },
        monthsWorkedThisYear: 0,
        monthsSinceJoining: 0,
        isEligibleForCasual: false,
        isEligibleForSick: false,
        isEligibleForAnnual: false,
      };
    }

    const join = new Date(joinDate);
    const today = new Date();
    const currentYear = today.getFullYear();
    const yearStart = new Date(currentYear, 0, 1); // January 1st

    // Calculate months since joining
    const monthsSinceJoining = 
      (today.getFullYear() - join.getFullYear()) * 12 + 
      (today.getMonth() - join.getMonth());

    // Calculate months worked in current calendar year
    let monthsWorkedThisYear;
    if (join.getFullYear() < currentYear) {
      // Joined in previous year(s) - full year quota
      monthsWorkedThisYear = 12;
    } else if (join.getFullYear() === currentYear) {
      // Joined this year - calculate months from join month to December
      monthsWorkedThisYear = 12 - join.getMonth(); // 0-indexed, so Jan=0
    } else {
      // Joined in future (shouldn't happen)
      monthsWorkedThisYear = 0;
    }

    // Eligibility checks
    const isEligibleForCasual = monthsSinceJoining >= 3;
    const isEligibleForSick = true; // Always eligible (prorated in first 3 months)
    const isEligibleForAnnual = monthsSinceJoining >= 12;

    /**
     * Calculate leave quota based on months worked
     * @param {number} annualQuota - Full year quota
     * @returns {number} Prorated quota
     */
    const calculateQuota = (annualQuota) => {
      return Math.floor((annualQuota * monthsWorkedThisYear) / 12);
    };

    /**
     * Calculate sick leave quota with special first 3 months rule
     */
    const calculateSickLeaveQuota = () => {
      if (monthsSinceJoining < 3) {
        // First 3 months: 1 leave per month worked
        const monthsWorkedTotal = monthsSinceJoining + 1; // +1 for current month
        return Math.min(monthsWorkedTotal, 3);
      } else {
        // After 3 months: standard 14 days prorated
        return calculateQuota(14);
      }
    };

    // Calculate total entitlements
    const casualTotal = isEligibleForCasual ? calculateQuota(10) : 0;
    const sickTotal = calculateSickLeaveQuota();
    const annualTotal = isEligibleForAnnual ? calculateQuota(14) : 0;

    /**
     * Infer leave type from reason text
     * Checks for leave type labels at the start of the reason field
     */
    const inferLeaveType = (reason = '') => {
      if (!reason || reason === '—') return 'casual';
      
      const lowerReason = reason.toLowerCase().trim();
      
      // Check for exact leave type labels (from dropdown)
      if (lowerReason.startsWith('casual leave')) {
        return 'casual';
      }
      if (lowerReason.startsWith('sick leave')) {
        return 'sick';
      }
      if (lowerReason.startsWith('annual leave')) {
        return 'annual';
      }
      
      // Fallback to keyword matching for legacy data
      if (lowerReason.includes('sick') || lowerReason.includes('medical') || lowerReason.includes('ill') || lowerReason.includes('health')) {
        return 'sick';
      }
      if (lowerReason.includes('annual') || lowerReason.includes('vacation') || lowerReason.includes('holiday')) {
        return 'annual';
      }
      
      // Default to casual
      return 'casual';
    };

    // Calculate used leaves by type (only count approved leaves)
    const leavesByType = leaves.reduce((acc, leave) => {
      // Only count approved leaves towards quota
      if (leave.status && leave.status.toLowerCase() !== 'approved') {
        return acc;
      }

      // Determine leave type from reason field or leaveType field
      const type = inferLeaveType(leave.reason) || leave.leaveType || leave.leave_type || 'casual';
      const normalizedType = type.toLowerCase().includes('sick') ? 'sick'
        : type.toLowerCase().includes('annual') ? 'annual'
        : 'casual';

      // Use the leave_days that's already calculated in server-actions
      // Only fallback to date calculation if absolutely necessary
      let days = leave.leave_days || 0;
      if (!days && leave.startDate && leave.endDate) {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const timeDiff = end - start;
        days = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1);
      }

      acc[normalizedType] = (acc[normalizedType] || 0) + days;
      return acc;
    }, { casual: 0, sick: 0, annual: 0 });

    // Calculate remaining leaves
    const casualRemaining = Math.max(0, casualTotal - leavesByType.casual);
    const sickRemaining = Math.max(0, sickTotal - leavesByType.sick);
    const annualRemaining = Math.max(0, annualTotal - leavesByType.annual);

    console.log('Leave Policy Calculation:', {
      monthsSinceJoining,
      monthsWorkedThisYear,
      leavesByType,
      totals: { casual: casualTotal, sick: sickTotal, annual: annualTotal },
      remaining: { casual: casualRemaining, sick: sickRemaining, annual: annualRemaining },
      allLeaves: leaves.map(l => ({
        reason: l.reason,
        inferredType: inferLeaveType(l.reason),
        leave_days: l.leave_days,
        startDate: l.startDate,
        endDate: l.endDate,
        status: l.status,
        isApproved: l.status?.toLowerCase() === 'approved'
      })),
      approvedLeaves: leaves.filter(l => l.status?.toLowerCase() === 'approved').map(l => ({
        reason: l.reason,
        type: inferLeaveType(l.reason),
        days: l.leave_days || 'missing',
        status: l.status
      }))
    });

    return {
      casual: {
        total: casualTotal,
        used: leavesByType.casual,
        remaining: casualRemaining,
        eligible: isEligibleForCasual,
      },
      sick: {
        total: sickTotal,
        used: leavesByType.sick,
        remaining: sickRemaining,
        eligible: isEligibleForSick,
      },
      annual: {
        total: annualTotal,
        used: leavesByType.annual,
        remaining: annualRemaining,
        eligible: isEligibleForAnnual,
      },
      monthsWorkedThisYear,
      monthsSinceJoining,
      isEligibleForCasual,
      isEligibleForSick,
      isEligibleForAnnual,
      inferLeaveType,
    };
  }, [joinDate, leaves]);
};
