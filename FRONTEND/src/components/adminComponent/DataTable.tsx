import React from "react";
import { X } from "lucide-react";

export interface Column<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
}

export interface ActionButton<T = any> {
  key: string;
  label: string | ((record: T) => string);
  icon: React.ReactNode | ((record: T) => React.ReactNode);
  onClick: (record: T) => void;
  className?: string | ((record: T) => string);
  condition?: (record: T) => boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  title: string;
  description?: string;
  actions?: ActionButton<T>[];
  onRetry?: () => void;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  pagination?: PaginationProps;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  leftSideHeaderContent?: React.ReactNode;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  title,
  description,
  actions = [],
  onRetry,
  emptyStateIcon,
  emptyStateTitle = "No data available",
  emptyStateDescription = "No records have been added yet.",
  pagination,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  leftSideHeaderContent,
}: DataTableProps<T>) => {
  const resolveValue = <K,>(value: K | ((record: T) => K), record: T): K => {
    return typeof value === "function"
      ? (value as (record: T) => K)(record)
      : value;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1e293b] rounded-3xl shadow-xl border border-cyan-800/50 p-10 text-center">
          <div className="flex flex-col items-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-cyan-900 flex items-center justify-center drop-shadow-md">
              <X size={36} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-cyan-400">
              Oops! Something Went Wrong
            </h2>
            <p className="text-cyan-300 max-w-xs mx-auto">
              {error ||
                "We couldn't load the data you requested. Please try again."}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 inline-block px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold shadow-md hover:from-pink-700 hover:to-purple-700 transition duration-300"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#111827] text-cyan-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 pt-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-cyan-400 tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-cyan-300 max-w-md">
                {description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onSearchChange && (
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-72 px-4 py-2 border border-cyan-600 rounded-lg bg-[#1e293b] text-white placeholder-cyan-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                aria-label="Search table"
              />
            )}
            {leftSideHeaderContent}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#1e293b] rounded-3xl shadow-xl border border-cyan-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cyan-700">
              <thead className="bg-[#111827]">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      style={{ width: column.width }}
                      className="px-6 py-4 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider select-none"
                      scope="col"
                    >
                      {column.title}
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-cyan-400 uppercase tracking-wider select-none"
                      scope="col"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-16 text-center text-cyan-300"
                    >
                      <div className="inline-flex flex-col items-center space-y-3">
                        <svg
                          className="animate-spin h-10 w-10 text-cyan-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                        <span className="text-lg font-medium">
                          Loading data...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((record, idx) => (
                    <tr
                      key={record.id || idx}
                      className="hover:bg-[#111827] transition-colors"
                      tabIndex={0}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className="px-6 py-4 whitespace-nowrap text-sm text-white"
                        >
                          {column.render
                            ? column.render(record[column.key], record, idx)
                            : record[column.key]}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="px-6 py-4 whitespace-nowrap flex space-x-3">
                          {actions.map((action) => {
                            if (action.condition && !action.condition(record))
                              return null;
                            const label = resolveValue(action.label, record);
                            const icon = resolveValue(action.icon, record);
                            const className =
                              resolveValue(action.className, record) ||
                              "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white";
                            return (
                              <button
                                key={action.key}
                                onClick={() => action.onClick(record)}
                                className={`inline-flex items-center justify-center p-2 rounded-full transition-transform duration-200 hover:scale-110 shadow-md ${className}`}
                                aria-label={label}
                                title={label}
                              >
                                {icon}
                              </button>
                            );
                          })}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-6 py-20 text-center text-cyan-400 select-none"
                    >
                      <div className="flex flex-col items-center space-y-3">
                        {emptyStateIcon && (
                          <div className="text-cyan-400 text-6xl">
                            {emptyStateIcon}
                          </div>
                        )}
                        <p className="text-xl font-semibold">
                          {emptyStateTitle}
                        </p>
                        <p className="max-w-xs text-sm">
                          {emptyStateDescription}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-5 border-t border-cyan-800 bg-[#111827]">
              <div className="flex justify-center gap-3">
                {Array.from({ length: pagination.totalPages }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === pagination.currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => pagination.onPageChange(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        isActive
                          ? "bg-cyan-600 text-white shadow-lg"
                          : "bg-[#1e293b] text-cyan-300 hover:bg-cyan-700"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={`Go to page ${page}`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTable;
