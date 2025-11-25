"use client";
import React, { useState } from "react";
import Link from "next/link";

/**
 * TableArchive - A reusable table component with built-in features like search, pagination, 
 * row selection, and action buttons.
 * 
 * @example
 * <TableArchive
 *   title="Employees"
 *   columns={[{ header: "Name", accessor: "name" }]}
 *   data={employees}
 *   loading={isLoading}
 *   pagination={{ total: 100, skip: 0, limit: 20 }}
 *   onPageChange={(page) => setPage(page)}
 *   searchTerm={search}
 *   onSearchChange={setSearch}
 *   createButtonHref="/employees/new"
 * />
 */
export default function TableArchive({
  title = "",
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyMessage = "No items found.",
  actionsRender = null,
  className = "",
  pagination = null,
  onPageChange = null,
  onLimitChange = null,
  searchTerm = "",
  onSearchChange = null,
  searchPlaceholder = "Search...",
  createButtonText = "Add New",
  createButtonHref = "",
  onRefresh = null,
  showSearch = true,
  showCreateButton = true,
  showRefreshButton = false,
  customActions = null,
  headerExtras = null,
  selectableRows = false,
  onSelectedRowsChange = null,
}) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  function getCellValue(row, accessor) {
    if (!accessor) return "";
    return accessor.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), row);
  }

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    
    if (checked) {
      const allIds = new Set(data.map((_, idx) => idx));
      setSelectedRows(allIds);
      onSelectedRowsChange?.(data);
    } else {
      setSelectedRows(new Set());
      onSelectedRowsChange?.([]);
    }
  };

  const handleSelectRow = (idx, row) => {
    const newSelected = new Set(selectedRows);
    
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === data.length);
    
    const selectedData = data.filter((_, i) => newSelected.has(i));
    onSelectedRowsChange?.(selectedData);
  };

  const currentPage = pagination ? Math.floor((pagination.skip || 0) / (pagination.limit || 20)) + 1 : 1;
  const totalPages = pagination ? Math.ceil((pagination.total || 0) / (pagination.limit || 20)) : 1;

  return (
    <div className={className}>
      {/* Header Section */}
      {title && (
        <div className="mb-6">
          <div className="p-4 bg-indigo-600 rounded-t-xl">
            <h1 className="text-xl font-semibold text-white">
              {title}
              {pagination && (
                <span className="text-white/80 ml-2">
                  - {new Intl.NumberFormat('en-US').format(pagination.total || data.length)}
                </span>
              )}
            </h1>
          </div>
        </div>
      )}

      {/* Toolbar Section */}
      {(showSearch || showCreateButton || customActions || onRefresh || headerExtras) && (
        <div className="mb-4 bg-white dark:bg-zinc-900 rounded-xl p-4 shadow">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Left side - Search */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {showSearch && onSearchChange && (
                <div className="relative flex-1 sm:w-[300px]">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="search"
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-800 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
              )}
              {headerExtras}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {customActions}
              
              {onRefresh && showRefreshButton && (
                <button
                  onClick={onRefresh}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  <svg
                    className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              )}

              {createButtonHref && showCreateButton && (
                <Link
                  href={createButtonHref}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  {createButtonText}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr className="text-zinc-600 dark:text-zinc-400">
                {selectableRows && (
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                )}
                {columns.map((col, i) => (
                  <th key={i} className={`py-3 px-4 text-left font-medium ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
                {actionsRender && (
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading && (
                <tr>
                  <td
                    colSpan={columns.length + (actionsRender ? 1 : 0) + (selectableRows ? 1 : 0)}
                    className="py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-zinc-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td
                    colSpan={columns.length + (actionsRender ? 1 : 0) + (selectableRows ? 1 : 0)}
                    className="py-12 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && data.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (actionsRender ? 1 : 0) + (selectableRows ? 1 : 0)}
                    className="py-12 text-center text-zinc-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}

              {!loading && !error && data.map((row, ri) => (
                <tr
                  key={ri}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  {selectableRows && (
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(ri)}
                        onChange={() => handleSelectRow(ri, row)}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                  )}
                  {columns.map((col, ci) => (
                    <td key={ci} className={`py-3 px-4 ${col.cellClassName || ""}`}>
                      {col.render ? col.render(row) : String(getCellValue(row, col.accessor) ?? "")}
                    </td>
                  ))}
                  {actionsRender && (
                    <td className="py-3 px-4">
                      {actionsRender(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && !loading && data.length > 0 && (
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Items per page */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Rows per page:</span>
                <select
                  value={pagination.limit || 20}
                  onChange={(e) => onLimitChange?.(Number(e.target.value))}
                  className="border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page info and navigation */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Page {currentPage} of {totalPages}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => onPageChange?.(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
