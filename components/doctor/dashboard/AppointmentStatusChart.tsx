"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

type Props = {
  data: {
    total_appointments: number;
    requested: number;
    approved: number;
    rejected: number;
    paid: number;
    completed: number;
    cancelled: number;
  };
};

const STATUS_CONFIG = {
  requested: {
    color: "#f59e0b",
    label: "Requested",
    icon: Clock,
    gradient: "from-amber-50 to-amber-100",
    border: "border-amber-200",
  },
  approved: {
    color: "#3b82f6",
    label: "Approved",
    icon: CheckCircle2,
    gradient: "from-blue-50 to-blue-100",
    border: "border-blue-200",
  },
  rejected: {
    color: "#ef4444",
    label: "Rejected",
    icon: XCircle,
    gradient: "from-red-50 to-red-100",
    border: "border-red-200",
  },
  paid: {
    color: "#8b5cf6",
    label: "Paid",
    icon: CheckCircle2,
    gradient: "from-purple-50 to-purple-100",
    border: "border-purple-200",
  },
  completed: {
    color: "#10b981",
    label: "Completed",
    icon: CheckCircle2,
    gradient: "from-emerald-50 to-emerald-100",
    border: "border-emerald-200",
  },
  cancelled: {
    color: "#6b7280",
    label: "Cancelled",
    icon: XCircle,
    gradient: "from-slate-50 to-slate-100",
    border: "border-slate-200",
  },
};

export default function AppointmentStatusChart({ data }: Props) {
  const chartData = Object.entries(STATUS_CONFIG)
    .map(([key, config]) => ({
      name: config.label,
      value: data[key as keyof typeof data] as number,
      color: config.color,
      key,
    }))
    .filter((item) => item.value > 0);

  if (data.total_appointments === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-slate-400">
        <FileText className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">No appointment data available</p>
      </div>
    );
  }

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label if slice is too small

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-[10px] sm:text-xs font-bold drop-shadow-lg"
        style={{
          paintOrder: "stroke",
          stroke: "rgba(0,0,0,0.3)",
          strokeWidth: "2px",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Total Summary */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 md:p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-600 mb-2">
          Total Appointments
        </p>
        <p className="text-4xl md:text-5xl font-bold text-slate-900">
          {data.total_appointments}
        </p>
      </div>

      {/* Pie Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
          Appointment Status Distribution
        </h3>
        <div className="w-full h-72 sm:h-80 md:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius="80%"
                innerRadius="45%"
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
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
                  const percent = (
                    (value / data.total_appointments) *
                    100
                  ).toFixed(1);
                  return [`${value} appointments (${percent}%)`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const value = data[key as keyof typeof data] as number;
          if (value === 0) return null;

          const Icon = config.icon;
          const percentage = ((value / data.total_appointments) * 100).toFixed(
            1,
          );

          return (
            <div
              key={key}
              className={`bg-gradient-to-br ${config.gradient} border ${config.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: config.color + "20" }}
                >
                  <Icon className="h-4 w-4" style={{ color: config.color }} />
                </div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: config.color }}
                >
                  {config.label}
                </p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                {value}
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 rounded-full flex-1"
                  style={{ backgroundColor: config.color + "30" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: config.color,
                      width: `${percentage}%`,
                    }}
                  />
                </div>
                <p className="text-xs font-medium text-slate-600">
                  {percentage}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
