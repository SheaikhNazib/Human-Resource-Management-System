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

// Dummy data for chart and table
const schedule = [
  {
    day: "Wednesday, 06 July 2023",
    items: [
      {
        time: "09:30",
        title: "Practical Task Review",
        subtitle: "UI/UX Designer",
      },
      { time: "12:00", title: "Resume Review", subtitle: "Magento Developer" },
      { time: "01:30", title: "Final HR Round", subtitle: "Sales Manager" },
    ],
  },
  {
    day: "Thursday, 07 July 2023",
    items: [
      {
        time: "09:30",
        title: "Practical Task Review",
        subtitle: "Front end Developer",
      },
      { time: "11:00", title: "TL Meeting", subtitle: "React JS" },
    ],
  },
];

const attendanceRows = [
  {
    name: "Leasie Watson",
    role: "Team Lead - Design",
    type: "Office",
    time: "09:27 AM",
    status: "On Time",
    avatar: "/avatar1.svg",
  },
  {
    name: "Darlene Robertson",
    role: "Web Designer",
    type: "Office",
    time: "10:15 AM",
    status: "Late",
    avatar: "/avatar2.svg",
  },
  {
    name: "Jacob Jones",
    role: "Medical Assistant",
    type: "Remote",
    time: "10:24 AM",
    status: "Late",
    avatar: "/avatar3.svg",
  },
  {
    name: "Kathryn Murphy",
    role: "Marketing Coordinator",
    type: "Office",
    time: "09:10 AM",
    status: "On Time",
    avatar: "/avatar4.svg",
  },
  {
    name: "Leslie Alexander",
    role: "Data Analyst",
    type: "Office",
    time: "09:15 AM",
    status: "On Time",
    avatar: "/avatar5.svg",
  },
  {
    name: "Ronald Richards",
    role: "Phyton Developer",
    type: "Remote",
    time: "09:29 AM",
    status: "On Time",
    avatar: "/avatar6.svg",
  },
];

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
      {/* Left: Stats and Attendance Overview */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardStat
            title="Total Employee"
            value="560"
            trend="+12%"
            date="July 16, 2023"
          />
          <DashboardStat
            title="Total Applicant"
            value="1050"
            trend="+5%"
            date="July 14, 2023"
          />
          <DashboardStat
            title="Today Attendance"
            value="470"
            trend="-6%"
            date="July 16, 2023"
            negative
          />
          <DashboardStat
            title="Total Projects"
            value="250"
            trend="+12%"
            date="July 10, 2023"
          />
        </div>
        {/* Attendance Overview Chart Placeholder */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              Attendance Overview
            </h2>
            <div className="flex items-center gap-2">
              <select className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
              <MoreVertical className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>
          {/* Modern Bar Chart */}
          <div className="h-64 flex items-center justify-center">
            <Bar
              data={{
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                  {
                    label: "On Time",
                    data: [60, 70, 65, 80, 75, 60, 55],
                    backgroundColor: "#2563eb",
                    borderRadius: 6,
                  },
                  {
                    label: "Late",
                    data: [20, 10, 15, 5, 10, 20, 25],
                    backgroundColor: "#f87171",
                    borderRadius: 6,
                  },
                  {
                    label: "Remote",
                    data: [20, 20, 20, 15, 15, 20, 20],
                    backgroundColor: "#fbbf24",
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                    labels: {
                      font: { size: 12 },
                      color: "#64748b",
                    },
                  },
                  title: {
                    display: false,
                  },
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
                    max: 100,
                  },
                },
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.5,
              }}
            />
          </div>
        </div>
        {/* Attendance Table */}
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
                {attendanceRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="py-2 px-3 flex items-center gap-2">
                      <img
                        src={row.avatar}
                        alt={row.name}
                        className="w-7 h-7 rounded-full"
                      />
                      {row.name}
                    </td>
                    <td className="py-2 px-3">{row.role}</td>
                    <td className="py-2 px-3">{row.type}</td>
                    <td className="py-2 px-3">{row.time}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          row.status === "On Time"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Right: Schedule & Calendar */}
      <div className="w-full lg:w-auto flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
              My Schedule
            </h2>
            <Calendar className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
          </div>
          {/* Calendar Placeholder */}
          <div className="flex justify-center mb-2">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-2 w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  July, 2023
                </span>
                <div className="flex gap-1">
                  <button className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <span className="sr-only">Prev</span>&lt;
                  </button>
                  <button className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    <span className="sr-only">Next</span>&gt;
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
                {/* Example: highlight 6,7,8 */}
                {Array.from({ length: 31 }, (_, i) => (
                  <div
                    key={i}
                    className={`rounded-full w-6 h-6 flex items-center justify-center ${
                      [5, 6, 7].includes(i)
                        ? "bg-blue-600 text-white"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Schedule List */}
          <div className="flex flex-col gap-2">
            {schedule.map((day, i) => (
              <div key={i} className="mb-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                  {day.day}
                </div>
                {day.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 w-12">
                      {item.time}
                    </span>
                    <div>
                      <div className="font-medium text-xs text-zinc-800 dark:text-zinc-200">
                        {item.title}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStat({ title, value, trend, date, negative }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs">
        <span>{title}</span>
        <span
          className={`ml-auto text-xs font-semibold ${
            negative
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {trend}
        </span>
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
