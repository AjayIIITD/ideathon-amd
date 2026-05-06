"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, LayoutDashboard, Trophy, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
  { name: "Camera", href: "/", icon: Camera },
  { name: "Feed", href: "/feed", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading || !user || pathname === "/auth" || pathname === "/onboarding") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 md:pb-4 pointer-events-none">
      <nav className="mx-auto max-w-md pointer-events-auto">
        <div className="glass rounded-full px-6 py-4 flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-12 h-12"
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-primary/20 rounded-full scale-0 transition-transform duration-300",
                    isActive && "scale-100"
                  )}
                />
                <Icon
                  className={cn(
                    "w-6 h-6 relative z-10 transition-colors duration-300",
                    isActive ? "text-primary drop-shadow-[0_0_8px_rgba(195,255,0,0.8)]" : "text-white/50 hover:text-white"
                  )}
                />
                {isActive && (
                  <span className="absolute -bottom-3 text-[10px] font-medium text-primary">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
