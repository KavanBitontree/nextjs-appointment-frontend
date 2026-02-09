"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  sortBy?: string;
  sortOrder?: string;
  onSortChange?: (sortBy: string, sortOrder: string) => void;
  sortOptions?: FilterOption[];
  onReset?: () => void;
  expandable?: boolean;
  defaultExpanded?: boolean;
}

export default function FilterSelect({
  options,
  value,
  onChange,
  label = "Filter by",
  placeholder = "All",
  sortBy = "name",
  sortOrder = "asc",
  onSortChange,
  sortOptions = [],
  onReset,
  expandable = false,
  defaultExpanded = false,
}: FilterSelectProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleSortChange = (field: string) => {
    if (!onSortChange) return;

    if (sortBy === field) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      onSortChange(field, newOrder);
    } else {
      onSortChange(field, "asc");
    }
  };

  const FilterContent = () => (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Main Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By - only show if sort options provided */}
      {sortOptions.length > 0 && onSortChange && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => handleSortChange(sortBy)}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
            >
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </button>
          </div>
        </>
      )}
    </div>
  );

  if (expandable) {
    return (
      <>
        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-slate-900 hover:text-slate-700 font-medium text-sm"
        >
          <Filter className="w-4 h-4" />
          {expanded ? "Hide" : "Show"} Advanced Filters
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Advanced Filters */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-200"
          >
            <FilterContent />

            {/* Reset Button */}
            {onReset && (
              <button
                onClick={onReset}
                className="mt-4 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                Reset Filters
              </button>
            )}
          </motion.div>
        )}
      </>
    );
  }

  return (
    <div>
      <FilterContent />
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
