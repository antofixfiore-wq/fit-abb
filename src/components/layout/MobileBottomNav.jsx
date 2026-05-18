import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Building2, User, QrCode, LayoutDashboard } from "lucide-react";

const navItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "Palestre", url: createPageUrl("Gyms"), icon: Building2 },
  { title: "Check-in", url: "/CheckIn", icon: QrCode, highlight: true },
  { title: "Dashboard", url: createPageUrl("ClientDashboard"), icon: LayoutDashboard },
  { title: "Profilo", url: createPageUrl("Profile"), icon: User },
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.url || 
            (item.url === "/CheckIn" && location.pathname.startsWith("/CheckIn"));

          if (item.highlight) {
            return (
              <Link key={item.title} to={item.url} className="flex flex-col items-center -mt-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isActive ? "scale-110" : ""
                }`} style={{ background: "#E8FF00" }}>
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <span className="text-[10px] mt-1 font-semibold" style={{ color: "#E8FF00" }}>
                  {item.title}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive ? "opacity-100" : "opacity-50 hover:opacity-70"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#E8FF00]" : "text-gray-400"}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-[#E8FF00]" : "text-gray-500"}`}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}