import AdminDashboardLayout from "../components/AdminDashboardLayout";

export const metadata = {
  title: "HRMS Admin Panel",
  description:
    "A modern HRMS admin dashboard for managing employees.",
};

export default function RootLayout({ children }) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
