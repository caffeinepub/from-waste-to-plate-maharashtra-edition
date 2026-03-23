import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, Heart, ShieldCheck, Users } from "lucide-react";
import React from "react";

const entities = [
  {
    key: "hotel",
    label: "Hotel / Restaurant",
    description:
      "Donate surplus food and track your contributions to reduce waste.",
    icon: Building2,
    route: "/login/hotel",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "ngo",
    label: "NGO / Food Bank",
    description:
      "Accept food donations and coordinate distribution to those in need.",
    icon: Heart,
    route: "/login/ngo",
    color: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "volunteer",
    label: "Volunteer",
    description: "Pick up and deliver food donations to NGOs and communities.",
    icon: Users,
    route: "/login/volunteer",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "admin",
    label: "Admin",
    description:
      "Manage the platform, view analytics, and oversee all operations.",
    icon: ShieldCheck,
    route: "/login/admin",
    color: "from-purple-500 to-violet-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

export default function LoginLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <img
            src="/assets/generated/logo-icon.dim_128x128.png"
            alt="Left2Lift"
            className="h-9 w-9 rounded-xl"
          />
          <span className="text-xl font-bold text-foreground tracking-tight">
            Left2Lift
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Heart className="h-4 w-4" />
            Maharashtra Food Rescue Network
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            Who are you joining as?
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your role to access your personalized dashboard and start
            making a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {entities.map((entity) => {
            const Icon = entity.icon;
            return (
              <button
                type="button"
                key={entity.key}
                onClick={() => navigate({ to: entity.route })}
                className={`group relative flex flex-col items-start p-6 rounded-2xl border-2 ${entity.bg} ${entity.border} hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
              >
                <div className={`p-3 rounded-xl ${entity.iconBg} mb-4`}>
                  <Icon className={`h-7 w-7 ${entity.iconColor}`} />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  {entity.label}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {entity.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Login <ArrowRight className="h-4 w-4" />
                </div>
                {/* Gradient accent bar */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r ${entity.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </button>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          New to Left2Lift?{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="text-primary hover:underline font-medium"
          >
            Learn more about our mission
          </button>
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Left2Lift. Built with{" "}
          <span className="text-red-500">♥</span> using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
