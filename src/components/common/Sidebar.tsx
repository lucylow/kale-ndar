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
  Wallet
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/kale', icon: Sprout, label: 'KALE Farming' },
    { path: '/reflector', icon: TrendingUp, label: 'Reflector Oracle' },
    { path: '/defi', icon: Coins, label: 'DeFi Protocols' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === path
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">KALE Balance</span>
              <span className="text-sm font-medium">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">XRF Tokens</span>
              <span className="text-sm font-medium">567</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Portfolio Value</span>
              <span className="text-sm font-medium">$12,345</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
