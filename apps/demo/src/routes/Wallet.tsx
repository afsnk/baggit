import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";

export default function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Please sign in to view your wallet</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto px-4 py-8 bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Close button */}
      <button
        onClick={() => navigate({ to: "/" })}
        className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-light"
      >
        ✕
      </button>

      {/* Main Card */}
      <div className="w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user.image}
              alt={user.name}
              className="w-14 h-14 rounded-full border-2 border-orange-500"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}&apos;s Account</h1>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="text-gray-400 hover:text-white text-xl"
          >
            ⋮
          </button>
        </div>

        {/* Available Balance */}
        <div>
          <p className="text-gray-400 text-sm mb-2">Available balance</p>
          <p className="text-5xl font-bold text-white">$64,434</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-slate-700/50 hover:bg-slate-700 rounded-2xl border border-slate-600 transition">
            <span className="text-xl">+</span>
            <span className="text-xs text-gray-300">Top up</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-slate-700/50 hover:bg-slate-700 rounded-2xl border border-slate-600 transition">
            <span className="text-xl">✈</span>
            <span className="text-xs text-gray-300">Transfer</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-slate-700/50 hover:bg-slate-700 rounded-2xl border border-slate-600 transition">
            <span className="text-xl">↔</span>
            <span className="text-xs text-gray-300">Exchange</span>
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-slate-700">
          <p>MAY 27, 2025 | REFRESHED EVERY 6HRS</p>
        </div>
      </div>

      {/* Navigation back */}
      <button
        onClick={() => navigate({ to: "/" })}
        className="mt-8 px-6 py-2 text-gray-400 hover:text-white transition"
      >
        ← Back to Home
      </button>
    </main>
  );
}
