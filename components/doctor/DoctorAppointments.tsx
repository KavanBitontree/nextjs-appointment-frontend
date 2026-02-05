"use client";

import React from "react";

export default function DoctorAppointments() {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-600">
          Dummy page for now (will show doctor appointment history here).
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-600">
          Coming soon: filters (Requested/Approved/Paid/Completed), patient name,
          and quick actions.
        </p>
      </div>
    </div>
  );
}


