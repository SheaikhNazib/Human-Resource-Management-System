"use client";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Users, Clock, TrendingUp, Calendar } from "lucide-react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// no React hooks needed
// Helper: format employee name
function formatEmployeeName(emp) {
  if (!emp) return "Unknown";
  if (emp.name) return emp.name;
  const firstName = emp.first_name || emp.firstName || "";
  const lastName = emp.last_name || emp.lastName || "";
  return `${firstName} ${lastName}`.trim() || "Unknown";
}

// derive status from checkIn
function deriveStatus(checkIn) {
  if (!checkIn) return "No Data";
  return checkIn <= "09:30:00" ? "On Time" : "Late";
}

// Get initials from name
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Get color for avatar based on name
function getAvatarColor(name) {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-indigo-500 to-indigo-600",
    "from-cyan-500 to-cyan-600",
    "from-teal-500 to-teal-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
  ];
  const index = (name?.charCodeAt(0) || 0) % colors.length;
  return colors[index];
}

export default function DashboardPage({
  stats = { totalEmployees: 0, totalAttendances: 0 },
  chartData = { labels: [], datasets: { onTime: [], late: [], remote: [] } },
  attendanceRows = [],
}) {
  const barData = {
    labels: chartData.labels.length
      ? chartData.labels
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "On Time",
        data: chartData.datasets?.onTime?.length
          ? chartData.datasets.onTime
          : [60, 70, 65, 80, 75, 60, 55],
        backgroundColor: "#3b82f6",
        borderRadius: 8,
        barThickness: 32,
      },
      {
        label: "Late",
        data: chartData.datasets?.late?.length
          ? chartData.datasets.late
          : [20, 10, 15, 5, 10, 20, 25],
        backgroundColor: "#ef4444",
        borderRadius: 8,
        barThickness: 32,
      },
      {
        label: "Remote",
        data: chartData.datasets?.remote?.length
          ? chartData.datasets.remote
          : [20, 20, 20, 15, 15, 20, 20],
        backgroundColor: "#8b5cf6",
        borderRadius: 8,
        barThickness: 32,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <DashboardStat
            title="Total Employees"
            value={stats.totalEmployees.toString()}
            icon={Users}
            gradient="from-blue-500 to-blue-600"
            change="+12%"
          />
          <DashboardStat
            title="Today's Attendance"
            value={stats.totalAttendances.toString()}
            icon={Clock}
            gradient="from-purple-500 to-purple-600"
            change="+8%"
          />
          <DashboardStat
            title="On Time"
            value={
              chartData.datasets?.onTime?.[
                chartData.datasets.onTime.length - 1
              ]?.toString() || "0"
            }
            icon={TrendingUp}
            gradient="from-emerald-500 to-emerald-600"
            change="+15%"
          />
          <DashboardStat
            title="This Week"
            value={
              chartData.datasets?.onTime
                ?.reduce((a, b) => a + b, 0)
                .toString() || "0"
            }
            icon={Calendar}
            gradient="from-amber-500 to-amber-600"
            change="+5%"
          />
        </div>

        {/* Dynamic Attendance Overview Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-1">
                Weekly Attendance Trends
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Last 7 days performance overview
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all">
                <option>Last 7 Days</option>
                <option>This Month</option>
                <option>Custom</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                    align: "end",
                    labels: {
                      font: { size: 13, weight: "500" },
                      color: "#71717a",
                      usePointStyle: true,
                      pointStyle: "circle",
                      padding: 15,
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    padding: 12,
                    borderRadius: 8,
                    titleFont: { size: 14, weight: "600" },
                    bodyFont: { size: 13 },
                    callbacks: {
                      label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y} employees`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: "#71717a",
                      font: { size: 12, weight: "500" },
                    },
                  },
                  y: {
                    grid: {
                      color: "#e4e4e7",
                      drawTicks: false,
                    },
                    border: { display: false },
                    ticks: {
                      color: "#71717a",
                      font: { size: 12 },
                      stepSize: 20,
                      padding: 8,
                    },
                    min: 0,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Dynamic Attendance Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-1">
                Today's Attendance
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                <tr className="text-zinc-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6 text-left">Employee Name</th>
                  <th className="py-4 px-6 text-left">Designation</th>
                  <th className="py-4 px-6 text-left">Type</th>
                  <th className="py-4 px-6 text-left">Check In Time</th>
                  <th className="py-4 px-6 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {attendanceRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 px-6 text-center text-zinc-500 dark:text-zinc-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
                        <p className="text-sm font-medium">
                          No attendance data for today
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  attendanceRows.map((r, i) => {
                    const emp = r.employee ?? {};
                    const name = formatEmployeeName(emp);
                    const role = emp.emp_job_title?.name || emp.role || "N/A";
                    const type = r.onsite_or_remote ? "Office" : "Remote";
                    const time = r.checkIn ?? "-";
                    const status = deriveStatus(r.checkIn);
                    const initials = getInitials(name);
                    const avatarColor = getAvatarColor(name);

                    return (
                      <tr
                        key={r.id ?? i}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors duration-150"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-linear-to-br ${avatarColor} text-white flex items-center justify-center text-sm font-bold shadow-md`}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-zinc-600 dark:text-zinc-400">
                          {role}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              type === "Office"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                            }`}
                          >
                            {type}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm font-mono text-zinc-900 dark:text-zinc-100">
                          {time}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              status === "On Time"
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : status === "Late"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStat({ title, value, icon: Icon, gradient, change }) {
  return (
    <div className="group relative bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Gradient background decoration */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300`}
      ></div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
              {change}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
