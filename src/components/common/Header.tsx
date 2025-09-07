import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, User, Leaf, Sun, Moon, Monitor, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WalletConnection from './WalletConnection';
import { useTheme } from '@/contexts/ThemeContext';
import NotificationBadge from '@/components/ui/notification-badge';
import RealtimeNotifications from '../RealtimeNotifications';
import MobileMenu from '@/components/ui/mobile-menu';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="h-4 w-4" />;
    if (resolvedTheme === 'dark') return <Moon className="h-4 w-4" />;
    return <Sun className="h-4 w-4" />;
  };

  return (
    <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-lg' 
        : 'bg-background/80 backdrop-blur-xl border-b border-white/5'
    }`}>
      <nav className="flex items-center justify-between px-6 py-4">
        {/* Left side with sidebar trigger and logo */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:inline-flex" />
          <div className="flex items-center gap-3 group cursor-pointer">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative p-2 rounded-xl bg-gradient-primary transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary animate-pulse-glow">
                <Leaf className="h-6 w-6 text-background transition-all duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-30 animate-ping group-hover:animate-none" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-all duration-300 hover:tracking-wide">
                KALE-ndar
              </span>
            </Link>
          </div>
        </div>

        {/* Enhanced Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <WalletConnection />
          
          <RealtimeNotifications />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative hover:bg-accent/50 transition-all duration-300 hover:scale-110 group"
            aria-label="Toggle theme"
          >
            <div className="transition-all duration-300 group-hover:rotate-180">
              {getThemeIcon()}
            </div>
          </Button>
          
          <Link 
            to="/settings" 
            className="p-2 text-muted-foreground hover:text-accent-teal transition-all duration-300 hover:scale-110 hover:bg-accent-teal/10 rounded-lg group"
          >
            <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
          </Link>
          
          <button className="p-2 text-muted-foreground hover:text-accent-teal transition-all duration-300 hover:scale-110 hover:bg-accent-teal/10 rounded-lg group">
            <User className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" />
          </button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu />
      </nav>
    </header>
  );
};

export default Header;
