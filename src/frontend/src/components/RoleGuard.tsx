import { Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import type React from "react";
import { type AppRole, useRoleBasedAccess } from "../hooks/useRoleBasedAccess";

interface RoleGuardProps {
  allowedRoles: AppRole[];
  redirectTo?: string;
  children: React.ReactNode;
}

const roleLoginMap: Record<AppRole, string> = {
  hotel: "/login/hotel",
  ngo: "/login/ngo",
  volunteer: "/login/volunteer",
  admin: "/login/admin",
  guest: "/login",
};

export default function RoleGuard({
  allowedRoles,
  redirectTo,
  children,
}: RoleGuardProps) {
  const { role, isLoading } = useRoleBasedAccess();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    // Determine best redirect: explicit override, or role-specific login page
    const fallback =
      redirectTo ??
      (allowedRoles.length === 1 ? roleLoginMap[allowedRoles[0]] : "/login");
    return <Navigate to={fallback} />;
  }

  return <>{children}</>;
}
