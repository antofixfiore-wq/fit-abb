import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Building2, User, LogOut, LayoutDashboard, Menu, Sparkles, Users, QrCode, Activity, Euro } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [userGym, setUserGym] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    // Set PWA icons
    const logoUrl = "https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png";
    
    // Remove existing icons
    document.querySelectorAll('link[rel="apple-touch-icon"]').forEach(el => el.remove());
    document.querySelectorAll('link[rel="icon"]').forEach(el => el.remove());
    
    // Add apple touch icon
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = logoUrl;
    document.head.appendChild(appleTouchIcon);
    
    // Add favicon
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = logoUrl;
    document.head.appendChild(favicon);
    
    // Add meta tags for PWA
    let metaAppleMobile = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!metaAppleMobile) {
      metaAppleMobile = document.createElement('meta');
      metaAppleMobile.name = 'apple-mobile-web-app-capable';
      document.head.appendChild(metaAppleMobile);
    }
    metaAppleMobile.content = 'yes';
    
    let metaAppleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!metaAppleTitle) {
      metaAppleTitle = document.createElement('meta');
      metaAppleTitle.name = 'apple-mobile-web-app-title';
      document.head.appendChild(metaAppleTitle);
    }
    metaAppleTitle.content = 'Fit ABB';
    
    let metaAppleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!metaAppleStatus) {
      metaAppleStatus = document.createElement('meta');
      metaAppleStatus.name = 'apple-mobile-web-app-status-bar-style';
      document.head.appendChild(metaAppleStatus);
    }
    metaAppleStatus.content = 'black-translucent';
  }, []);

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
      title: "I Miei Dati",
      url: createPageUrl("FitnessTracking"),
      icon: Activity,
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
      title: "Personal Trainer",
      url: createPageUrl("PersonalTrainers"),
      icon: Users,
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
      gold: "bg-yellow-300 text-black",
      premium: "bg-[#E8FF00] text-black"
    };

    return (
      <Badge className={`${colors[user.subscription_type]} text-xs`}>
        {user.subscription_type.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      <style>{`
        :root {
          --primary-gradient: linear-gradient(135deg, #000000 0%, #E8FF00 100%);
          --accent-gradient: linear-gradient(135deg, #1a1a1a 0%, #E8FF00 100%);
          --success-color: #E8FF00;
          --background: #0a0a0a;
          --primary-yellow: #E8FF00;
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 flex-col">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
              alt="Fit ABB Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h2 className="font-bold text-white text-lg">Fit ABB</h2>
              <p className="text-xs text-gray-400">Allena Italia</p>
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-[#E8FF00]/10 text-[#E8FF00] border-l-2 border-[#E8FF00]' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
          <div className="border-t border-white/10 p-4 space-y-3 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: '#E8FF00'}}>
                <span className="text-black font-semibold text-sm">
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            {getSubscriptionBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
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
        <header className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
                alt="Fit ABB"
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-lg font-bold text-white">Fit ABB</h1>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-lg text-white"
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
                            ? 'bg-[#E8FF00]/10 text-[#E8FF00] border-l-2 border-[#E8FF00]' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
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