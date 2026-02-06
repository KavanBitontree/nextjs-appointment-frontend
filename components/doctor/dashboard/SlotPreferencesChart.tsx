"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

type Props = {
  data: {
    total_completed_appointments: number;
    slot_duration_hours: number;
    total_slots_per_day: number;
    preferences: Array<{
      time_slot: string;
      completed_bookings: number;
      percentage_of_total: number;
    }>;
    most_popular_slot: any;
    least_popular_slot: any;
  };
};

export default function SlotPreferencesChart({ data }: Props) {
  if (!data.preferences || data.preferences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Clock className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">No slot preference data available</p>
      </div>
    );
  }

  // Find max value for color gradient
  const maxBookings = Math.max(
    ...data.preferences.map((p) => p.completed_bookings),
  );

  // Custom bar colors based on booking intensity
  const getBarColor = (value: number) => {
    const intensity = value / maxBookings;
    if (intensity > 0.7) return "#10b981"; // Green - high
    if (intensity > 0.4) return "#3b82f6"; // Blue - medium
    return "#94a3b8"; // Slate - low
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-700 mb-1">
            Total Completed
          </p>
          <p className="text-2xl font-bold text-blue-900">
            {data.total_completed_appointments}
          </p>
          <p className="text-xs text-blue-600 mt-1">appointments</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <p className="text-xs font-medium text-purple-700 mb-1">
            Slot Duration
          </p>
          <p className="text-2xl font-bold text-purple-900">
            {data.slot_duration_hours}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            {data.slot_duration_hours === 1 ? "hour" : "hours"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4">
          <p className="text-xs font-medium text-indigo-700 mb-1">
            Slots Per Day
          </p>
          <p className="text-2xl font-bold text-indigo-900">
            {data.total_slots_per_day}
          </p>
          <p className="text-xs text-indigo-600 mt-1">available slots</p>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {data.most_popular_slot && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-green-900">
                Most Popular Time
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-900 mb-1">
              {data.most_popular_slot.time_slot}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-green-700">
                {data.most_popular_slot.completed_bookings}
              </p>
              <p className="text-sm text-green-600">
                bookings (
                {data.most_popular_slot.percentage_of_total.toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        {data.least_popular_slot && (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-orange-900">
                Least Popular Time
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-orange-900 mb-1">
              {data.least_popular_slot.time_slot}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-orange-700">
                {data.least_popular_slot.completed_bookings}
              </p>
              <p className="text-sm text-orange-600">
                bookings (
                {data.least_popular_slot.percentage_of_total.toFixed(1)}%)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
          Booking Distribution by Time Slot
        </h3>
        <div className="w-full h-80 sm:h-96 md:h-[28rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.preferences}
              margin={{ top: 20, right: 10, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="time_slot"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: "#475569", fontSize: 11 }}
                interval={0}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 12 }}
                label={{
                  value: "Bookings",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#475569", fontSize: 12 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px",
                  fontSize: "13px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: any, name?: string, props?: any) => {
                  if (!name || !props) return [value, ""];
                  return [
                    `${value} bookings (${props.payload.percentage_of_total.toFixed(1)}%)`,
                    "Completed",
                  ];
                }}
                labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
              />
              <Bar dataKey="completed_bookings" radius={[8, 8, 0, 0]}>
                {data.preferences.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.completed_bookings)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
