"use client";
import React from "react";

/**
 * TableArchive
 * Reusable table wrapper component.
 *
 * Props:
 * - columns: Array<{ header: string, accessor?: string, render?: (row) => ReactNode, className?: string }>
 * - data: Array<any>
 * - loading: boolean
 * - error: string | null
 * - emptyMessage: string
 * - actionsRender: (row) => ReactNode   // optional actions column renderer
 * - className: additional wrapper classes
 *
 * Example usage:
 * <TableArchive
 *   columns={[{header: 'Name', accessor: 'name'}, {header: 'Email', accessor: 'email'}]}
 *   data={employees}
 *   loading={loading}
 *   error={error}
 *   actionsRender={(row) => <MyActionsMenu row={row} />}
 * />
 */

export default function TableArchive({
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyMessage = "No items found.",
  actionsRender = null,
  className = "",
}) {
  function getCellValue(row, accessor) {
    if (!accessor) return "";
    // support dotted accessors like 'user.name'
    return accessor.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), row);
  }

  return (
    <div className={`bg-white dark:bg-zinc-950 rounded-xl shadow p-4 ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-zinc-500">
              {columns.map((col, i) => (
                <th key={i} className={`py-2 px-3 text-left font-normal ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
              {actionsRender && <th className="py-2 px-3 text-left font-normal">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + (actionsRender ? 1 : 0)} className="py-8 text-center text-zinc-500">
                  Loading...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td colSpan={columns.length + (actionsRender ? 1 : 0)} className="py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actionsRender ? 1 : 0)} className="py-8 text-center text-zinc-500">
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading && !error && data.map((row, ri) => (
              <tr key={ri} className="border-t border-zinc-100 dark:border-zinc-800">
                {columns.map((col, ci) => (
                  <td key={ci} className={`py-3 px-3 align-top ${col.cellClassName || ""}`}>
                    {col.render ? col.render(row) : String(getCellValue(row, col.accessor) ?? "")}
                  </td>
                ))}
                {actionsRender && (
                  <td className="py-3 px-3 align-top">
                    {actionsRender(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
