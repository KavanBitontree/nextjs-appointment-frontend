"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { IndianRupee, Calendar, TrendingUp } from "lucide-react";

type Props = {
  data: Array<{
    date?: string;
    week_start?: string;
    month?: number;
    total_revenue: number;
    completed_appointments: number;
  }>;
  timeframe: "daily" | "weekly" | "monthly";
};

export default function RevenueChart({ data, timeframe }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-slate-400">
        <IndianRupee className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">No revenue data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => {
    let label = "";
    let fullDate = "";

    if (timeframe === "daily" && item.date) {
      const date = new Date(item.date);
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      fullDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (timeframe === "weekly" && item.week_start) {
      const date = new Date(item.week_start);
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      fullDate = `Week starting ${date.toLocaleDateString()}`;
    } else if (timeframe === "monthly" && item.month) {
      label = new Date(2024, item.month - 1).toLocaleString("default", {
        month: "short",
      });
      fullDate = new Date(2024, item.month - 1).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }

    return {
      label,
      fullDate,
      revenue: Number(item.total_revenue),
      appointments: item.completed_appointments,
    };
  });

  // Calculate totals
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalAppointments = chartData.reduce(
    (sum, item) => sum + item.appointments,
    0,
  );
  const avgRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xs font-medium text-emerald-700">
              Total Revenue
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-900">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-blue-700">Appointments</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {totalAppointments}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-purple-700">Average</p>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            ₹{Math.round(avgRevenue).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
          Revenue & Appointments Trend
        </h3>
        <div className="w-full h-80 sm:h-96 md:h-[28rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: "#475569", fontSize: 11 }}
                interval={0}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#475569", fontSize: 11 }}
                tickFormatter={formatCurrency}
                label={{
                  value: "Revenue (₹)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#475569", fontSize: 12 },
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#475569", fontSize: 11 }}
                label={{
                  value: "Appointments",
                  angle: 90,
                  position: "insideRight",
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
                formatter={(value: any, name?: string) => {
                  if (!name) return [value, ""];
                  return [
                    name === "revenue"
                      ? `₹${Number(value).toLocaleString()}`
                      : value,
                    name === "revenue" ? "Revenue" : "Appointments",
                  ];
                }}
                labelFormatter={(label: any, payload?: any) => {
                  if (payload && payload.length > 0) {
                    return payload[0].payload.fullDate || label || "";
                  }
                  return label || "";
                }}
                labelStyle={{ fontWeight: 600, marginBottom: "8px" }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: "16px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
                iconType="rect"
                iconSize={12}
              />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Revenue"
              />
              <Bar
                yAxisId="right"
                dataKey="appointments"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Appointments"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
