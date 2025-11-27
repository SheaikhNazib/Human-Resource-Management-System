"use client";

import { useState } from "react";
import TableArchive from "@/components/core/TableArchive";

export default function EmployeesTable({ employees }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter employees based on search term
  const filteredEmployees = employees.filter((emp) => {
    const search = searchTerm.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(search) ||
      emp.role?.toLowerCase().includes(search) ||
      emp.jobTitle?.toLowerCase().includes(search) ||
      emp.email?.toLowerCase().includes(search) ||
      emp.mobile?.toLowerCase().includes(search)
    );
  });

  return (
    <TableArchive
      title="Employees"
      columns={[
        {
          header: "Name",
          accessor: "name",
        },
        {
          header: "Role",
          accessor: "role",
        },
        {
          header: "Job Title",
          accessor: "jobTitle",
        },
        {
          header: "Email",
          accessor: "email",
        },
        {
          header: "Mobile",
          accessor: "mobile",
        },
        {
          header: "Actions",
          accessor: "id",
          render: (emp) => (
            <TableArchive.Actions
              row={emp}
              viewHref={`/employees/${emp.id}/view`}
              editHref={`/employees/${emp.id}/edit`}
              hasViewPermission={true}
              hasEditPermission={true}
              hasDeletePermission={false}
            />
          ),
        },
      ]}
      data={filteredEmployees}
      loading={false}
      emptyMessage="No employees in this department."
      showSearch={true}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search employees..."
      showCreateButton={false}
      showRefreshButton={false}
    />
  );
}
