import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";
import { useState } from "react";
import SignInModal from "../components/auth/SignInModal";

export default function Home() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full max-w-md mx-auto px-4 py-8 bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Close button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-light"
      >
        ✕
      </button>

      {/* Logo */}
      <div className="mb-12 mt-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-2xl font-bold">A</span>
        </div>
      </div>

      {/* Header and Auth Section */}
      <div className="w-full text-center mb-8">
        {user ? (
          <>
            <div className="flex items-center justify-center gap-4 mb-6">
              <img
                src={user.image}
                alt={user.name}
                className="w-12 h-12 rounded-full border-2 border-orange-500"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}&apos;s Account</h1>
              </div>
            </div>

            {/* Menu Options */}
            <div className="space-y-3">
              {[
                { icon: "+", label: "Buy", path: "/buy" },
                { icon: "−", label: "Sell", path: "/sell" },
                { icon: "💰", label: "Wallet", path: "/wallet" },
              ].map(({ icon, label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate({ to: path })}
                  className="w-full flex items-center gap-4 px-6 py-4 bg-slate-800/50 hover:bg-slate-700 rounded-lg border border-slate-700 hover:border-slate-600 transition text-white text-left group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">{icon}</span>
                  <span className="flex-1">{label}</span>
                  <span className="text-gray-400">›</span>
                </button>
              ))}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="mt-8 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full text-sm font-medium transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to AilPay!</h1>
            <p className="text-gray-400 mb-8">Login to unlock the full experience</p>

            <button
              onClick={() => setShowSignIn(true)}
              className="w-full px-6 py-3 bg-white text-slate-900 rounded-full font-semibold hover:bg-gray-100 transition mb-8"
            >
              Sign in
            </button>

            {/* Menu Options */}
            <div className="space-y-3">
              {[
                { icon: "+", label: "Buy", path: "/buy" },
                { icon: "−", label: "Sell", path: "/sell" },
                { icon: "↔", label: "Swap", path: "#" },
              ].map(({ icon, label, path }) => (
                <button
                  key={label}
                  onClick={() => path !== "#" && navigate({ to: path as any })}
                  disabled={path === "#"}
                  className="w-full flex items-center gap-4 px-6 py-4 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-slate-700 hover:border-slate-600 transition text-white text-left group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">{icon}</span>
                  <span className="flex-1">{label}</span>
                  <span className="text-gray-400">›</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sign In Modal */}
      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </main>
  );
}
