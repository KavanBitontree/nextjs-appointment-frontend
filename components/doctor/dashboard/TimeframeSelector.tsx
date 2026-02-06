"use client";

import React from "react";

type Props = {
  value: string;
  onChange: (value: any) => void;
  options: Array<{ value: string; label: string }>;
};

export default function TimeframeSelector({ value, onChange, options }: Props) {
  return (
    <div className="inline-flex bg-slate-100 rounded-lg p-1 gap-1 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md transition-all touch-manipulation active:scale-95 ${
            value === option.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
