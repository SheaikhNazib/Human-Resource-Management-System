"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUsersList, updateUser } from "@/actions/users";
import { toast } from "sonner";
import { Users, UserPlus, Shield, Mail, Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const ROLE_OPTIONS = [
  { value: "hr_manager", label: "HR Manager" },
  { value: "accountant", label: "Accountant" },
  { value: "manager", label: "Manager" },
//   { value: "employee", label: "Employee" },
];

const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-800 border-purple-300",
  hr_manager: "bg-blue-100 text-blue-800 border-blue-300",
  accountant: "bg-green-100 text-green-800 border-green-300",
  manager: "bg-orange-100 text-orange-800 border-orange-300",
  employee: "bg-zinc-100 text-zinc-800 border-zinc-300",
};

export default function UserRolePage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsersList();
      if (response.success) {
        setUsers(response.data);
      } else {
        toast.error(response.error || "Failed to fetch users");
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    const toastId = toast.loading("Updating user role...");

    try {
      const response = await updateUser(userId, { role: newRole });
      
      if (response.success) {
        toast.success("User role updated successfully", { id: toastId });
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
      } else {
        toast.error(response.error || "Failed to update user role", { id: toastId });
      }
    } catch (error) {
      toast.error(error.message || "Failed to update user role", { id: toastId });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleLabel = (role) => {
    if (role === "super_admin") return "Super Admin";
    const roleOption = ROLE_OPTIONS.find((opt) => opt.value === role);
    return roleOption ? roleOption.label : role;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">User Role Management</h1>
              <p className="text-sm text-zinc-600">
                Manage user roles and permissions
              </p>
            </div>
          </div>
          <Link
            href="/admin-access-management/add-user"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-12 text-center">
          <Users className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Users Found</h3>
          <p className="text-zinc-600 mb-4">
            There are no users in the system yet.
          </p>
          <Link
            href="/admin-access-management/add-user"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add First User
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Change Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {users.map((user) => {
                  const isSuperAdmin = user.role === "super_admin";
                  const isUpdating = updatingUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-100 rounded-full">
                            <Mail className="w-4 h-4 text-zinc-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-900">
                              {user.email}
                            </div>
                            <div className="text-xs text-zinc-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            ROLE_COLORS[user.role] || ROLE_COLORS.employee
                          }`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 text-sm">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isSuperAdmin ? (
                          <div className="text-sm text-pink-400">
                            Super Admin
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={isUpdating}
                              className="px-3 py-1.5 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-zinc-100 disabled:cursor-not-allowed"
                            >
                              {ROLE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {isUpdating && (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              Role Information
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Super Admin:</strong> Full system access (cannot be modified)</li>
              <li>• <strong>HR Manager:</strong> Manage employees, attendance, and leaves</li>
              <li>• <strong>Accountant:</strong> Manage payroll and financial records</li>
              <li>• <strong>Manager:</strong> Manage team tasks and performance</li>
              {/* <li>• <strong>Employee:</strong> Basic access to own records</li> */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}