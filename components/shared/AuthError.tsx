"use client";

export default function AuthError({ message }: { message: string }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
      <p className="font-medium mb-2">Authentication Required</p>
      <p className="text-sm mb-4">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
      >
        Refresh Page
      </button>
    </div>
  );
}
