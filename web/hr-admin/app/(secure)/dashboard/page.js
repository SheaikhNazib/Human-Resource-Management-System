"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import DashboardPage from "@/components/Dashboard";
import { getEmployeeStats } from "@/actions/employees/server-actions";
import {
  getAttendanceStats,
  getAttendanceOverview,
  getRecentAttendances,
} from "@/actions/attendances/server-actions";
import Loader from "@/components/ui/Loader";

const Dashboard = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAttendances: 0,
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: { onTime: [], late: [], remote: [] },
  });
  const [attendanceRows, setAttendanceRows] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Wait for auth to load
      if (authLoading) return;

      // Redirect employees to their dashboard
      if (user?.role === "employee") {
        router.push("/employee-dashboard");
        return;
      }

      // Only fetch data for authorized users
      if (!user || user.role === "employee") {
        return;
      }

      setLoading(true);

      try {
        const today = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const todayStr = `${today.getFullYear()}-${pad(
          today.getMonth() + 1
        )}-${pad(today.getDate())}`;

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
          getRecentAttendances({ date: todayStr, limit: 100 }),
        ]);

        setStats({
          totalEmployees: employeeStatsResponse?.success
            ? employeeStatsResponse.data.totalEmployees
            : 0,
          totalAttendances: attendanceStatsResponse?.success
            ? attendanceStatsResponse.data.totalAttendances
            : 0,
        });

        setChartData(
          overviewResponse?.success
            ? overviewResponse.data
            : { labels: [], datasets: { onTime: [], late: [], remote: [] } }
        );

        setAttendanceRows(recentResponse?.success ? recentResponse.data : []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, router]);

  if (authLoading || user?.role === "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} />
          <p className="mt-4 text-gray-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} />
          <p className="mt-4 text-gray-600 dark:text-zinc-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

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
