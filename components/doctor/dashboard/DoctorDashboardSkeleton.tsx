export default function DoctorDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-10 bg-slate-200 rounded w-64 mb-3" />
        <div className="h-5 bg-slate-100 rounded w-96" />
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            <div className="h-4 bg-slate-100 rounded w-24 mb-3" />
            <div className="h-8 bg-slate-200 rounded w-32 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
          <div className="h-64 bg-slate-100 rounded" />
        </div>

        {/* Appointment Status Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
          <div className="h-64 bg-slate-100 rounded" />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Analytics */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="h-6 bg-slate-200 rounded w-32 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
          </div>
        </div>

        {/* Slot Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
          <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 bg-slate-100 rounded w-24" />
                <div className="flex-1 h-3 bg-slate-100 rounded" />
                <div className="h-4 bg-slate-100 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
