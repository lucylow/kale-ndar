import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, User, Leaf, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WalletConnection from './WalletConnection';
import { useTheme } from '@/contexts/ThemeContext';
import NotificationBadge from '@/components/ui/notification-badge';

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
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-lg' 
        : 'bg-background/80 backdrop-blur-xl border-b border-white/5'
    }`}>
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-xl bg-gradient-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary">
                <Leaf className="h-6 w-6 text-background" />
              </div>
              <span className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
                KALE-ndar
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/dashboard" 
              className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
            >
              Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/kale" 
              className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
            >
              KALE
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/reflector" 
              className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
            >
              Reflector
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/defi" 
              className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
            >
              DeFi
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/markets" 
              className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
            >
              Markets
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
          
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <WalletConnection />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-accent/50 transition-colors"
              aria-label="Toggle theme"
            >
              {getThemeIcon()}
            </Button>
            
            {/* Notification Button */}
            <NotificationBadge count={notificationCount} variant="default">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent/50 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </NotificationBadge>
            
            <Link to="/settings" className="p-2 text-muted-foreground hover:text-accent-teal transition-colors">
              <Settings className="w-5 h-5" />
            </Link>
            <button className="p-2 text-muted-foreground hover:text-accent-teal transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
