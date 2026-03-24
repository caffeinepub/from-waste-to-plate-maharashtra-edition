import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BarChart2,
  Loader2,
  Lock,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { EntityType } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

export default function AdminLogin() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [showNameForm, setShowNameForm] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const {
    data: userProfile,
    isFetched: profileFetched,
    isLoading: profileLoading,
  } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    if (!isAuthenticated || profileLoading || !profileFetched) return;
    if (userProfile) {
      window.location.replace("/admin");
    } else {
      setShowNameForm(true);
    }
  }, [isAuthenticated, userProfile, profileFetched, profileLoading]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      if (error?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setShowNameForm(false);
    setAdminName("");
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim()) return;
    setIsSettingUp(true);
    try {
      await saveProfile.mutateAsync({
        name: adminName.trim(),
        city: "Mumbai",
        neighborhood: "",
        entityType: EntityType.admin,
      });
      window.location.replace("/admin");
    } catch (err) {
      console.error("Profile setup error:", err);
      setIsSettingUp(false);
    }
  };

  // Show spinner while checking profile after authentication
  if (
    isAuthenticated &&
    (profileLoading || (!showNameForm && !profileFetched))
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-violet-50 dark:from-purple-950/20 dark:via-background dark:to-violet-950/20 flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card border border-purple-200 dark:border-purple-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-500" />
            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-2xl mb-4">
                  <ShieldCheck className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-foreground">
                  Admin Login
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  Manage the Left2Lift platform, view analytics, and oversee all
                  operations.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  {
                    icon: BarChart2,
                    text: "View platform-wide analytics and reports",
                  },
                  {
                    icon: Settings,
                    text: "Manage users, NGOs, and volunteers",
                  },
                  { icon: Lock, text: "Secure admin-only access controls" },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                      <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>

              {!isAuthenticated ? (
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-3 rounded-xl border-0"
                  size="lg"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Connecting…
                    </>
                  ) : (
                    "Login with Internet Identity"
                  )}
                </Button>
              ) : showNameForm ? (
                <form onSubmit={handleProfileSetup} className="space-y-4">
                  <div>
                    <label
                      htmlFor="admin-name"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Admin Name
                    </label>
                    <input
                      id="admin-name"
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Platform Administrator"
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-400"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSettingUp || !adminName.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl border-0"
                    size="lg"
                  >
                    {isSettingUp ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Setting up…
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel & Logout
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Verifying credentials…</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Secured by{" "}
            <span className="font-semibold text-foreground">
              Internet Identity
            </span>{" "}
            — no passwords needed.
          </p>
        </div>
      </main>
    </div>
  );
}
