import React from "react";
import { X } from "lucide-react";

export interface InstructorColumn<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
}

export interface InstructorActionButton<T = any> {
  key: string;
  label: string | ((record: T) => string);
  icon: React.ReactNode | ((record: T) => React.ReactNode);
  onClick: (record: T) => void;
  className?: string | ((record: T) => string);
  condition?: (record: T) => boolean;
}

export interface InstructorDataTableProps<T = any> {
  data: T[];
  columns: InstructorColumn<T>[];
  loading?: boolean;
  error?: string | null;
  title: string;
  description?: string;
  actions?: InstructorActionButton<T>[];
  onRetry?: () => void;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;

  // pagination and search
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const InstructorDataTable = <T extends Record<string, any>>({
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

  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showSearch = false,
  searchValue = "",
  onSearchChange,
}: InstructorDataTableProps<T>) => {
  const resolveValue = <K,>(value: K | ((record: T) => K), record: T): K => {
    return typeof value === "function"
      ? (value as (record: T) => K)(record)
      : value;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                {title}
              </h2>
              {description && (
                <p className="text-gray-400 text-sm mt-1">{description}</p>
              )}
            </div>
          </div>

          {showSearch && onSearchChange && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search records..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-12 border border-red-500/30 shadow-xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl flex items-center justify-center border border-red-500/30">
            <X size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-700/30 shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                {/* Table Header */}
                <thead className="bg-gradient-to-r from-gray-700/60 to-gray-800/60 backdrop-blur-xl border-b border-gray-600/30">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={col.key}
                        style={{ width: col.width }}
                        className={`px-6 py-5 text-left font-bold text-orange-300 uppercase tracking-wide text-xs ${
                          index === 0 ? "rounded-tl-3xl" : ""
                        } ${
                          index === columns.length - 1 && actions.length === 0
                            ? "rounded-tr-3xl"
                            : ""
                        }`}
                      >
                        {col.title}
                      </th>
                    ))}
                    {actions.length > 0 && (
                      <th
                        className="px-6 py-5 text-left font-bold text-orange-300 uppercase tracking-wide text-xs rounded-tr-3xl"
                        style={{ width: "140px" }}
                      >
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-700/30">
                  {data.map((record, index) => (
                    <tr
                      key={record._id || index}
                      className="hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-orange-600/5 transition-all duration-200 group"
                    >
                      {columns.map((col, colIndex) => (
                        <td
                          key={col.key}
                          className={`px-6 py-5 ${
                            colIndex === 0
                              ? "font-semibold text-white"
                              : "text-gray-200"
                          }`}
                        >
                          <div className="group-hover:scale-105 transition-transform duration-200">
                            {col.render ? (
                              col.render(record[col.key], record, index)
                            ) : (
                              <span>{record[col.key]}</span>
                            )}
                          </div>
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="px-6 py-5">
                          <div className="flex gap-2 items-center">
                            {actions.map((action) => {
                              const show = action.condition
                                ? action.condition(record)
                                : true;
                              if (!show) return null;

                              const icon = resolveValue(action.icon, record);
                              const label = resolveValue(action.label, record);
                              const className = resolveValue(
                                action.className ||
                                  "bg-gradient-to-br from-orange-500/20 to-orange-600/20 hover:from-orange-500 hover:to-orange-600 border border-orange-500/30 hover:border-orange-500 text-orange-400 hover:text-white",
                                record
                              );

                              return (
                                <button
                                  key={action.key}
                                  onClick={() => action.onClick(record)}
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg ${className}`}
                                  title={label}
                                >
                                  {icon}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-600/30 to-gray-700/30 rounded-3xl flex items-center justify-center">
                {emptyStateIcon || (
                  <span className="text-5xl text-gray-400">📂</span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {emptyStateTitle}
              </h3>
              <p className="text-gray-400">{emptyStateDescription}</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && data.length > 0 && totalPages > 1 && onPageChange && (
        <div className="flex justify-center items-center">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/30 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm font-medium mr-4">
                Page {currentPage} of {totalPages}
              </span>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-110 ${
                      currentPage === pageNum
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                        : "bg-gray-700/50 hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-orange-600/20 text-gray-300 hover:text-white border border-gray-600/30"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDataTable;
