import DashboardPage from "@/components/Dashboard";
import { getEmployeeStats } from "@/actions/employees/server-actions";
import { getAttendanceStats } from "@/actions/attendances/server-actions";

const Dashboard = async () => {
  // Fetch employee and attendance statistics in parallel
  const [employeeStatsResponse, attendanceStatsResponse] = await Promise.all([
    getEmployeeStats(),
    getAttendanceStats(),
  ]);

  const stats = {
    totalEmployees: employeeStatsResponse.success
      ? employeeStatsResponse.data.totalEmployees
      : 0,
    totalAttendances: attendanceStatsResponse.success
      ? attendanceStatsResponse.data.totalAttendances
      : 0,
  };

  return (
    <div>
      <DashboardPage stats={stats} />
    </div>
  );
};

export default Dashboard;
