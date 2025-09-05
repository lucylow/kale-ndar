import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  TrendingUp, 
  Coins, 
  Briefcase, 
  Settings,
  BarChart3,
  Wallet,
  Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/kale', icon: Sprout, label: 'KALE Farming' },
    { path: '/reflector', icon: TrendingUp, label: 'Reflector Oracle' },
    { path: '/defi', icon: Coins, label: 'DeFi Protocols' },
    { path: '/markets', icon: Target, label: 'Prediction Markets' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-background/95 backdrop-blur-xl border-r border-white/10 shadow-card overflow-y-auto hover:shadow-lg transition-shadow duration-300">
      <div className="p-4 sm:p-6">
        <nav className="space-y-1">
          {menuItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group relative ${
                location.pathname === path
                  ? 'bg-gradient-primary text-primary-foreground shadow-primary scale-105'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:scale-105 hover:shadow-md'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all duration-300 ${
                location.pathname === path 
                  ? 'text-primary-foreground scale-110' 
                  : 'text-muted-foreground group-hover:text-accent-teal group-hover:scale-110'
              }`} />
              <span className="font-medium transition-all duration-300">{label}</span>
              {location.pathname === path && (
                <div className="absolute right-2 w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent-teal" />
            Quick Stats
          </h3>
          <Card className="bg-gradient-card border-white/10 shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">KALE Balance</span>
                  <span className="text-sm font-semibold text-primary group-hover:scale-110 transition-transform">1,234</span>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">XRF Tokens</span>
                  <span className="text-sm font-semibold text-accent-teal group-hover:scale-110 transition-transform">567</span>
                </div>
                <div className="flex items-center justify-between group">
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Portfolio Value</span>
                  <span className="text-sm font-semibold text-accent-gold group-hover:scale-110 transition-transform">$12,345</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>24h Change</span>
                    <span className="text-primary font-medium">+5.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
