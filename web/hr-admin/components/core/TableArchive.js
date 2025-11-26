"use client";
import React, { useState } from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";

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

/**
 * Actions - Built-in actions component for table rows with View, Edit, Delete, Download options
 *
 * @example
 * <TableArchive.Actions
 *   row={employee}
 *   onView={(row) => router.push(`/employees/${row.id}`)}
 *   onEdit={(row) => router.push(`/employees/${row.id}/edit`)}
 *   onDelete={async (row) => await deleteEmployee(row.id)}
 *   hasViewPermission={true}
 *   hasEditPermission={true}
 *   hasDeletePermission={true}
 * />
 */
export function Actions({
  row,
  onView,
  onEdit,
  onDelete,
  onDownload,
  viewHref,
  editHref,
  hasViewPermission = true,
  hasEditPermission = true,
  hasDeletePermission = true,
  hasDownloadPermission = false,
  extraActions = [],
  deleteConfirmMessage = "Are you sure you want to delete this item? This action cannot be undone.",
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(row);
      setShowDeleteConfirm(false);
      setOpenMenu(false);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = () => {
    setOpenMenu(false);
    if (onView) onView(row);
  };

  const handleEdit = () => {
    setOpenMenu(false);
    if (onEdit) onEdit(row);
  };

  const handleDownload = () => {
    setOpenMenu(false);
    if (onDownload) onDownload(row);
  };

  const handleButtonClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 176; // w-44 (11rem * 16px)
    const padding = 8; // Space from viewport edge

    // Calculate number of menu items to estimate height
    let menuItemCount = 0;
    if (hasViewPermission && (onView || viewHref)) menuItemCount++;
    if (hasDownloadPermission && onDownload) menuItemCount++;
    if (hasEditPermission && (onEdit || editHref)) menuItemCount++;
    if (hasDeletePermission && onDelete) menuItemCount++;
    menuItemCount += extraActions.length;

    // Each menu item is approximately 36px (py-2 with text), plus some padding
    const menuHeight = Math.min(menuItemCount * 36 + 8, 300);

    // Calculate initial position
    let top = rect.bottom + window.scrollY + 4;
    let left = rect.right + window.scrollX - menuWidth;

    // Check if menu goes beyond viewport bottom
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If not enough space below and more space above, show menu above button
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      top = rect.top + window.scrollY - menuHeight - 4;
    }

    // Check if menu goes beyond viewport right edge
    if (rect.right < menuWidth) {
      left = rect.left + window.scrollX;
    }

    // Ensure menu doesn't go beyond left edge
    if (left < padding) {
      left = padding + window.scrollX;
    }

    // Ensure menu doesn't go beyond right edge
    const viewportWidth = window.innerWidth;
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - padding + window.scrollX;
    }

    setMenuPosition({ top, left });
    setOpenMenu(!openMenu);
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 relative"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4 text-zinc-500" />
      </button>

      {openMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 1000 }}
            onClick={() => setOpenMenu(false)}
          />

          <div
            className="fixed bg-white dark:bg-zinc-900 rounded-md shadow-xl border border-zinc-200 dark:border-zinc-800 py-1 w-44 max-h-[80vh] overflow-y-auto opacity-0 scale-95 animate-[fadeIn_0.2s_ease-out_forwards]"
            style={{
              animation: "fadeIn 0.15s ease-out forwards",
              zIndex: 1001,
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            {/* View Option */}
            {hasViewPermission && (onView || viewHref) && (
              <>
                {viewHref ? (
                  <Link
                    href={viewHref}
                    onClick={() => setOpenMenu(false)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 transition-colors duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View
                  </Link>
                ) : (
                  <button
                    onClick={handleView}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 transition-colors duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View
                  </button>
                )}
              </>
            )}

            {/* Download Option */}
            {hasDownloadPermission && onDownload && (
              <button
                onClick={handleDownload}
                className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 transition-colors duration-150"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </button>
            )}

            {/* Edit Option */}
            {hasEditPermission && (onEdit || editHref) && (
              <>
                {editHref ? (
                  <Link
                    href={editHref}
                    onClick={() => setOpenMenu(false)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 transition-colors duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </Link>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 text-zinc-700 dark:text-zinc-300 transition-colors duration-150"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                )}
              </>
            )}

            {/* Extra Actions */}
            {extraActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setOpenMenu(false);
                  action.onClick(row);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors duration-150 ${
                  action.className || "text-zinc-700 dark:text-zinc-300"
                }`}
                disabled={action.disabled}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                {action.label}
              </button>
            ))}

            {/* Delete Option */}
            {hasDeletePermission && onDelete && (
              <>
                {(hasViewPermission ||
                  hasEditPermission ||
                  hasDownloadPermission ||
                  extraActions.length > 0) && (
                  <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />
                )}
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  disabled={isDeleting}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]"
          style={{ animation: "fadeIn 0.2s ease-out forwards" }}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 opacity-0 scale-95 animate-[scaleIn_0.2s_ease-out_forwards]"
            style={{ animation: "scaleIn 0.2s ease-out forwards" }}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              {deleteConfirmMessage}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting && (
                  <svg
                    className="w-4 h-4 animate-spin"
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
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
  createButtonOnClick = null,
  createButtonClassName = "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2",
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
    return accessor
      .split(".")
      .reduce((acc, key) => (acc ? acc[key] : undefined), row);
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

  const currentPage = pagination
    ? Math.floor((pagination.skip || 0) / (pagination.limit || 20)) + 1
    : 1;
  const totalPages = pagination
    ? Math.ceil((pagination.total || 0) / (pagination.limit || 20))
    : 1;

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
                  -{" "}
                  {new Intl.NumberFormat("en-US").format(
                    pagination.total || data.length
                  )}
                </span>
              )}
            </h1>
          </div>
        </div>
      )}

      {/* Toolbar Section */}
      {(showSearch ||
        showCreateButton ||
        customActions ||
        onRefresh ||
        headerExtras) && (
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
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
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

              {(createButtonOnClick || createButtonHref) &&
                showCreateButton &&
                (createButtonOnClick ? (
                  <button
                    onClick={createButtonOnClick}
                    className={createButtonClassName}
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
                  </button>
                ) : (
                  <Link
                    href={createButtonHref}
                    className={createButtonClassName}
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
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl shadow">
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
                  <th
                    key={i}
                    className={`py-3 px-4 text-left font-medium ${
                      col.className || ""
                    }`}
                  >
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
                    colSpan={
                      columns.length +
                      (actionsRender ? 1 : 0) +
                      (selectableRows ? 1 : 0)
                    }
                    className="py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        Loading...
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (actionsRender ? 1 : 0) +
                      (selectableRows ? 1 : 0)
                    }
                    className="py-12 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && data.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (actionsRender ? 1 : 0) +
                      (selectableRows ? 1 : 0)
                    }
                    className="py-12 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                data.map((row, ri) => (
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
                      <td
                        key={ci}
                        className={`py-3 px-4 text-zinc-700 dark:text-zinc-300 ${
                          col.cellClassName || ""
                        }`}
                      >
                        {col.render
                          ? col.render(row)
                          : String(getCellValue(row, col.accessor) ?? "")}
                      </td>
                    ))}
                    {actionsRender && (
                      <td className="py-3 px-4">{actionsRender(row)}</td>
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
                <span className="text-zinc-600 dark:text-zinc-400">
                  Rows per page:
                </span>
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
                    className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-700 dark:text-zinc-300"
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

// Attach Actions as a property of TableArchive for easy import
TableArchive.Actions = Actions;
