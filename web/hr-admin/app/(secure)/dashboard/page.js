import DashboardPage from "@/components/Dashboard";
import { getEmployeeStats } from "@/actions/employees/server-actions";
import {
  getAttendanceStats,
  getAttendanceOverview,
  getRecentAttendances,
} from "@/actions/attendances/server-actions";

const Dashboard = async () => {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(
    today.getDate()
  )}`;

  // Fetch employee stats, today's attendance total, overview (last 7 days), and recent rows
  const [
    employeeStatsResponse,
    attendanceStatsResponse,
    overviewResponse,
    recentResponse,
  ] = await Promise.all([
    getEmployeeStats(),
    getAttendanceStats(),
    getAttendanceOverview({ end: todayStr }),
    getRecentAttendances({ date: todayStr, limit: 10 }),
  ]);

  const stats = {
    totalEmployees: employeeStatsResponse?.success
      ? employeeStatsResponse.data.totalEmployees
      : 0,
    totalAttendances: attendanceStatsResponse?.success
      ? attendanceStatsResponse.data.totalAttendances
      : 0,
  };

  const chartData = overviewResponse?.success
    ? overviewResponse.data
    : { labels: [], datasets: { onTime: [], late: [], remote: [] } };
  const attendanceRows = recentResponse?.success ? recentResponse.data : [];

  return (
    <div>
      <DashboardPage
        stats={stats}
        chartData={chartData}
        attendanceRows={attendanceRows}
      />
    </div>
  );
};

export default Dashboard;
