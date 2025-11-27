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
import { Calendar, MoreVertical } from "lucide-react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper: format employee name
function formatEmployeeName(emp) {
  if (!emp) return "Unknown";
  if (emp.name) return emp.name;
  return `${emp.first_name ?? ""} ${emp.last_name ?? ""}`.trim() || "Unknown";
}

// derive status from checkIn
function deriveStatus(checkIn) {
  if (!checkIn) return "No Data";
  return checkIn <= "09:30:00" ? "On Time" : "Late";
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
        backgroundColor: "#2563eb",
        borderRadius: 6,
      },
      {
        label: "Late",
        data: chartData.datasets?.late?.length
          ? chartData.datasets.late
          : [20, 10, 15, 5, 10, 20, 25],
        backgroundColor: "#f87171",
        borderRadius: 6,
      },
      {
        label: "Remote",
        data: chartData.datasets?.remote?.length
          ? chartData.datasets.remote
          : [20, 20, 20, 15, 15, 20, 20],
        backgroundColor: "#fbbf24",
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* Stats Row */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardStat
            title="Total Employee"
            value={stats.totalEmployees.toString()}
            date={new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <DashboardStat
            title="Today Attendance"
            value={stats.totalAttendances.toString()}
            date={new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        </div>

        {/* Dynamic Attendance Overview Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              Attendance Overview
            </h2>
            <div className="flex items-center gap-2">
              <select className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100">
                <option>Last 7 Days</option>
                <option>This Month</option>
                <option>Custom</option>
              </select>
              <MoreVertical className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                    labels: { font: { size: 12 }, color: "#64748b" },
                  },
                  title: { display: false },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "#64748b", font: { size: 12 } },
                  },
                  y: {
                    grid: { color: "#f1f5f9" },
                    ticks: {
                      color: "#64748b",
                      font: { size: 12 },
                      stepSize: 20,
                    },
                    min: 0,
                  },
                },
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.5,
              }}
            />
          </div>
        </div>

        {/* Dynamic Attendance Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              Attendance Overview
            </h2>
            <button className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400">
                  <th className="py-2 px-3 text-left font-normal">
                    Employee Name
                  </th>
                  <th className="py-2 px-3 text-left font-normal">
                    Designation
                  </th>
                  <th className="py-2 px-3 text-left font-normal">Type</th>
                  <th className="py-2 px-3 text-left font-normal">
                    Check In Time
                  </th>
                  <th className="py-2 px-3 text-left font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="text-zinc-700 dark:text-zinc-300">
                {attendanceRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 px-3 text-center text-zinc-500"
                    >
                      No attendance data for selected date.
                    </td>
                  </tr>
                ) : (
                  attendanceRows.map((r, i) => {
                    const emp = r.employee ?? {};
                    const name = formatEmployeeName(emp);
                    const role = emp.emp_job_title?.name ?? emp.role ?? "";
                    const type = r.onsite_or_remote ? "Office" : "Remote";
                    const time = r.checkIn ?? "-";
                    const status = deriveStatus(r.checkIn);
                    return (
                      <tr
                        key={r.id ?? i}
                        className="border-t border-zinc-100 dark:border-zinc-800"
                      >
                        <td className="py-2 px-3 flex items-center gap-2">
                          <img
                            src={emp.avatar ?? "/avatar-placeholder.png"}
                            alt={name}
                            className="w-7 h-7 rounded-full"
                          />
                          {name}
                        </td>
                        <td className="py-2 px-3">{role}</td>
                        <td className="py-2 px-3">{type}</td>
                        <td className="py-2 px-3">{time}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              status === "On Time"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
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

      {/* Right: Schedule & Calendar (unchanged) */}
      <div className="w-full lg:w-auto shrink-0 flex flex-col gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              My Schedule
            </h2>
            <Calendar className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          </div>
          {/* Calendar Placeholder (kept minimal to preserve layout) */}
          <div className="flex justify-center mb-2">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-2 w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  July, 2023
                </span>
                <div className="flex gap-1">
                  <button className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {" "}
                    <span className="sr-only">Prev</span>&lt;{" "}
                  </button>
                  <button className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {" "}
                    <span className="sr-only">Next</span>&gt;{" "}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, i) => (
                  <div
                    key={i}
                    className="font-medium text-zinc-400 dark:text-zinc-500"
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStat({ title, value, date }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
        <span>{title}</span>
      </div>
      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
      <div className="text-xs text-zinc-400 dark:text-zinc-500">
        Update: {date}
      </div>
    </div>
  );
}
