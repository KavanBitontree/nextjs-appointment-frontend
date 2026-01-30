"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface DoctorPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  currentCount: number;
  onPageChange: (skip: number) => void;
  isPending: boolean;
  limit: number;
}

export default function DoctorPagination({
  currentPage,
  totalPages,
  total,
  currentCount,
  onPageChange,
  isPending,
  limit,
}: DoctorPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-600">
        Showing {currentCount} of {total} doctors
        {totalPages > 0 && ` (Page ${currentPage} of ${totalPages})`}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(0, (currentPage - 2) * limit))}
          disabled={currentPage === 1 || isPending}
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + 1;
            const skip = (pageNum - 1) * limit;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(skip)}
                disabled={isPending}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage * limit)}
          disabled={currentPage === totalPages || isPending}
          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

