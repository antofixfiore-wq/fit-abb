import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Building2, User, LogOut, LayoutDashboard, Menu, Sparkles, Users, QrCode } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [userGym, setUserGym] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        const gymsData = await base44.entities.Gym.list();
        const gym = gymsData.find(g => g.manager_email === userData.email);
        setUserGym(gym);
      } catch (error) {
        console.error("User not logged in or error loading gym data:", error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const navigationItems = [
    {
      title: "Home",
      url: createPageUrl("Home"),
      icon: Home,
    },
    {
      title: "Dashboard",
      url: createPageUrl("ClientDashboard"),
      icon: LayoutDashboard,
    },
    {
      title: "Scanner QR",
      url: createPageUrl("QRScanner"),
      icon: QrCode,
    },
    {
      title: "AI Workout",
      url: createPageUrl("WorkoutPlanner"),
      icon: Sparkles,
    },
    {
      title: "Comunità",
      url: createPageUrl("Community"),
      icon: Users,
    },
    {
      title: "Palestre",
      url: createPageUrl("Gyms"),
      icon: Building2,
    },
    {
      title: "Profilo",
      url: createPageUrl("Profile"),
      icon: User,
    },
  ];

  const getSubscriptionBadge = () => {
    if (!user?.subscription_type || user.subscription_type === "none") {
      return null;
    }
    
    const colors = {
      silver: "bg-gray-200 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      premium: "bg-gradient-to-r from-blue-500 to-orange-500 text-white"
    };

    return (
      <Badge className={`${colors[user.subscription_type]} text-xs`}>
        {user.subscription_type.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#fafaf9]">
      <style>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #3b82f6 0%, #f97316 100%);
          --accent-gradient: linear-gradient(135deg, #60a5fa 0%, #fb923c 100%);
          --success-color: #10b981;
          --background: #fafaf9;
          --primary-blue: #3b82f6;
          --primary-orange: #f97316;
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-200 flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6900e246d71384c10b97f155/979b3bbd7_EnergeticBlueandOrangeFitnessAppLogo.png"
              alt="Fit ABB Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Fit ABB</h2>
              <p className="text-xs text-gray-500">Allena Italia</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.url;
              return (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-orange-50 text-blue-700' 
                        : 'hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </li>
              );
            })}

            {userGym && (
              <li>
                <Link
                  to={createPageUrl("GymDashboard")}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === createPageUrl("GymDashboard")
                      ? 'bg-gradient-to-r from-blue-50 to-orange-50 text-blue-700' 
                      : 'hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">Dashboard Palestra</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Footer */}
        {user && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-orange-500">
                <span className="text-white font-semibold text-sm">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{user.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            {getSubscriptionBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6900e246d71384c10b97f155/979b3bbd7_EnergeticBlueandOrangeFitnessAppLogo.png"
                alt="Fit ABB"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-lg font-bold">Fit ABB</h1>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="mt-4 pt-4 border-t">
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.url;
                  return (
                    <li key={item.title}>
                      <Link
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-50 to-orange-50 text-blue-700' 
                            : 'hover:bg-blue-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}