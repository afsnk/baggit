import { Outlet } from "@tanstack/react-router";
import { AuthProvider } from "../lib/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </AuthProvider>
  );
}
