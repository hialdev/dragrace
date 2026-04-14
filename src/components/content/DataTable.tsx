"use client";

import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  isLoading?: boolean;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12 text-white/50">
        <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center py-12 text-center text-white/50">
        <span className="material-symbols-outlined text-4xl mb-3 opacity-50">data_alert</span>
        <p>Belum ada data.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
      <table className="w-full text-left text-sm text-white/80">
        <thead className="text-xs uppercase bg-[#b80014]/10 border-b border-white/10 text-[#b80014]">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 font-semibold tracking-wider">
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="px-6 py-4 text-right font-semibold tracking-wider">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id}
              className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                rowIdx === data.length - 1 ? "border-b-0" : ""
              }`}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-6 py-4">
                  {typeof col.accessor === "function" ? col.accessor(row) : (row[col.accessor] as ReactNode)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-blue-400 rounded-lg transition-colors border border-white/10"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="p-2 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 rounded-lg transition-colors border border-white/10"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
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
  );
}
