import { Pencil, Trash2 } from "lucide-react";
import { type ReactNode } from "react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

interface EntityTableProps<T> {
  title: string;
  data: T[];
  columns: {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => ReactNode;
  }[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAction?: (item: T) => void;
  actionLabel?: string;
  emptyText?: string;
  pagination?: PaginationProps;
}

const EntityTable = <T,>({
  title,
  data,
  columns,
  onEdit,
  onDelete,
  onAction,
  actionLabel = "View",
  emptyText = "No data available",
  pagination,
}: EntityTableProps<T>) => {
  const totalPages = pagination
    ? Math.ceil(pagination.totalItems / pagination.pageSize)
    : 0;

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      {title && (
        <div className="bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 shadow-lg">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {title}
            </h3>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/30 shadow-xl text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-600/30 to-gray-700/30 rounded-3xl flex items-center justify-center">
            <span className="text-5xl text-gray-400">📂</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Data Found
          </h3>
          <p className="text-gray-400">{emptyText}</p>
        </div>
      ) : (
        <>
          {/* Table Container */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-gray-700/30 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                {/* Table Header */}
                <thead className="bg-gradient-to-r from-gray-700/60 to-gray-800/60 backdrop-blur-xl border-b border-gray-600/30">
                  <tr>
                    {columns.map((col, index) => (
                      <th
                        key={col.key as string}
                        className={`px-6 py-5 font-bold text-orange-300 whitespace-nowrap uppercase tracking-wide text-xs ${
                          index === 0 ? "rounded-tl-3xl" : ""
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                    {(onEdit || onDelete || onAction) && (
                      <th className="px-6 py-5 font-bold text-orange-300 whitespace-nowrap uppercase tracking-wide text-xs rounded-tr-3xl">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-700/30">
                  {data.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gradient-to-r hover:from-orange-500/5 hover:to-orange-600/5 transition-all duration-200 group"
                    >
                      {columns.map((col, colIndex) => (
                        <td
                          key={col.key as string}
                          className={`px-6 py-5 text-gray-200 ${
                            colIndex === 0 ? "font-semibold" : ""
                          }`}
                        >
                          <div className="group-hover:scale-105 transition-transform duration-200">
                            {col.render
                              ? col.render(item[col.key], item)
                              : (item[col.key] as ReactNode)}
                          </div>
                        </td>
                      ))}
                      {(onEdit || onDelete || onAction) && (
                        <td className="px-6 py-5">
                          <div className="flex gap-3 items-center">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(item)}
                                className="group/btn w-8 h-8 bg-gradient-to-br from-orange-500/20 to-orange-600/20 hover:from-orange-500 hover:to-orange-600 border border-orange-500/30 hover:border-orange-500 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-orange-500/25"
                                title="Edit"
                              >
                                <Pencil
                                  size={14}
                                  className="text-orange-400 group-hover/btn:text-white"
                                />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(item)}
                                className="group/btn w-8 h-8 bg-gradient-to-br from-red-500/20 to-red-600/20 hover:from-red-500 hover:to-red-600 border border-red-500/30 hover:border-red-500 rounded-xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-red-500/25"
                                title="Delete"
                              >
                                <Trash2
                                  size={14}
                                  className="text-red-400 group-hover/btn:text-white"
                                />
                              </button>
                            )}
                            {onAction && (
                              <button
                                onClick={() => onAction(item)}
                                className="bg-gradient-to-r from-gray-600/30 to-gray-700/30 hover:from-orange-500 hover:to-orange-600 text-gray-300 hover:text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 text-xs border border-gray-600/30 hover:border-orange-500"
                              >
                                {actionLabel}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && totalPages > 1 && (
            <div className="flex justify-center items-center mt-8">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-4 border border-gray-700/30 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm font-medium mr-4">
                    Page {pagination.currentPage} of {totalPages}
                  </span>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => pagination.onPageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:scale-110 ${
                          pagination.currentPage === pageNum
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
        </>
      )}
    </div>
  );
};

export default EntityTable;
