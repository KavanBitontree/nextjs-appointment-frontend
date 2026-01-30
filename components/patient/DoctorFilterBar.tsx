"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";

interface DoctorFilterBarProps {
  speciality: string;
  sortBy: string;
  sortOrder: string;
  onFilterChange: (filters: {
    filter_speciality?: string;
    sort_by?: string;
    sort_order?: string;
  }) => void;
  onReset: () => void;
}

export default function DoctorFilterBar({
  speciality: initialSpeciality,
  sortBy: initialSortBy,
  sortOrder: initialSortOrder,
  onFilterChange,
  onReset,
}: DoctorFilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [speciality, setSpeciality] = useState(initialSpeciality);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  const handleSpecialityChange = (value: string) => {
    setSpeciality(value);
    onFilterChange({ filter_speciality: value });
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      onFilterChange({ sort_by: field, sort_order: newOrder });
    } else {
      setSortBy(field);
      setSortOrder("asc");
      onFilterChange({ sort_by: field, sort_order: "asc" });
    }
  };

  const handleReset = () => {
    setSpeciality("");
    setSortBy("name");
    setSortOrder("asc");
    onReset();
  };

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
          <div className="grid md:grid-cols-3 gap-4">
            {/* Speciality Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Speciality
              </label>
              <select
                value={speciality}
                onChange={(e) => handleSpecialityChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="">All Specialities</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="General Physician">General Physician</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Neurologist">Neurologist</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="speciality">Speciality</option>
                <option value="opd_fees">Fees</option>
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
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
          >
            Reset Filters
          </button>
        </motion.div>
      )}
    </>
  );
}

