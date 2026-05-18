import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Building2, User, QrCode, LayoutDashboard } from "lucide-react";
import { useNavigationState } from "@/hooks/useNavigationState";

const navItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "Palestre", url: createPageUrl("Gyms"), icon: Building2 },
  { title: "Check-in", url: "/CheckIn", icon: QrCode, highlight: true },
  { title: "Dashboard", url: createPageUrl("ClientDashboard"), icon: LayoutDashboard },
  { title: "Profilo", url: createPageUrl("Profile"), icon: User },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { navState, restoreState } = useNavigationState();
  const previousPathRef = useRef(location.pathname);

  const handleNavClick = (url, e) => {
    const isActive = location.pathname === url || 
      (url === "/CheckIn" && location.pathname.startsWith("/CheckIn"));
    
    if (isActive) {
      // Scroll to top if already on this tab
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // State restoration happens in useEffect only when switching tabs
  };

  // Restore state only when switching between tabs (not on initial load or nested routes)
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = previousPathRef.current;
    
    // Check if we're switching between main tabs
    const currentTab = navItems.find(item => 
      currentPath === item.url || 
      (item.url === "/CheckIn" && currentPath.startsWith("/CheckIn"))
    );
    const prevTab = navItems.find(item => 
      prevPath === item.url || 
      (item.url === "/CheckIn" && prevPath.startsWith("/CheckIn"))
    );
    
    // Only restore if switching between different main tabs
    if (currentTab && prevTab && currentTab.url !== prevTab.url) {
      restoreState(currentTab.url);
    }
    
    previousPathRef.current = currentPath;
  }, [location.pathname]);

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
              <Link 
                key={item.title} 
                to={item.url} 
                onClick={(e) => handleNavClick(item.url, e)}
                className="flex flex-col items-center -mt-5"
              >
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
              onClick={(e) => handleNavClick(item.url, e)}
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