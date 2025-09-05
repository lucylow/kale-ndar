import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, User } from 'lucide-react';
import WalletConnection from './WalletConnection';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StellarFi</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/kale" className="text-gray-600 hover:text-gray-900 transition-colors">
              KALE
            </Link>
            <Link to="/reflector" className="text-gray-600 hover:text-gray-900 transition-colors">
              Reflector
            </Link>
            <Link to="/defi" className="text-gray-600 hover:text-gray-900 transition-colors">
              DeFi
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <WalletConnection />
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <Link to="/settings" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
