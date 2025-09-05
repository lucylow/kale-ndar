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
    <aside className="fixed left-0 top-20 bottom-0 w-64 bg-background/95 backdrop-blur-xl border-r border-white/10 shadow-card overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                location.pathname === path
                  ? 'bg-gradient-primary text-primary-foreground shadow-primary'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:scale-105'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${
                location.pathname === path 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground group-hover:text-accent-teal'
              }`} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Stats</h3>
          <Card className="bg-gradient-card border-white/10 shadow-card">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">KALE Balance</span>
                  <span className="text-sm font-medium text-primary">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">XRF Tokens</span>
                  <span className="text-sm font-medium text-accent-teal">567</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Portfolio Value</span>
                  <span className="text-sm font-medium text-accent-gold">$12,345</span>
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
