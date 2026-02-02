"use client";

import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface DoctorSearchBarProps {
  searchName: string;
  searchAddress: string;
  onSearchChange: (searchName: string, searchAddress: string) => void;
}

export default function DoctorSearchBar({
  searchName: initialSearchName,
  searchAddress: initialSearchAddress,
  onSearchChange,
}: DoctorSearchBarProps) {
  const [searchName, setSearchName] = useState(initialSearchName);
  const [searchAddress, setSearchAddress] = useState(initialSearchAddress);

  const debouncedSearchName = useDebounce(searchName, 500);
  const debouncedSearchAddress = useDebounce(searchAddress, 500);

  // Update local state when props change
  useEffect(() => {
    setSearchName(initialSearchName);
    setSearchAddress(initialSearchAddress);
  }, [initialSearchName, initialSearchAddress]);

  useEffect(() => {
    onSearchChange(debouncedSearchName, debouncedSearchAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchName, debouncedSearchAddress]);

  return (
    <div className="grid md:grid-cols-2 gap-4 mb-4">
      {/* Doctor Name Search */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Doctor Name
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Address Search */}
      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Clinic Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by clinic address..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );
}

