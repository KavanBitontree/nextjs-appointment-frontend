export default function AppointmentFormLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8 animate-pulse">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="h-9 bg-slate-200 rounded mb-3 w-2/3" />
              <div className="h-5 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="text-right">
              <div className="h-4 bg-slate-100 rounded mb-2 w-24" />
              <div className="h-8 bg-slate-200 rounded w-28" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-slate-100 rounded mb-2 w-20" />
                <div className="h-5 bg-slate-200 rounded w-32" />
              </div>
            ))}
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 animate-pulse">
          <div className="space-y-6">
            {/* Calendar Section */}
            <div>
              <div className="h-6 bg-slate-200 rounded w-32 mb-4" />
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-slate-100 rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* Time Slots Section */}
            <div>
              <div className="h-6 bg-slate-200 rounded w-32 mb-4" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
              <div className="h-10 bg-slate-100 rounded" />
            </div>

            {/* Button */}
            <div className="h-12 bg-slate-900 rounded-lg w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
