import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  BarChart3, 
  Wallet, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  Monitor,
  Bell
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import WalletConnection from '../common/WalletConnection';
import RealtimeNotifications from '../RealtimeNotifications';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="h-5 w-5" />;
    if (resolvedTheme === 'dark') return <Moon className="h-5 w-5" />;
    return <Sun className="h-5 w-5" />;
  };

  const menuItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { label: 'Markets', icon: BarChart3, href: '/prediction-markets' },
    { label: 'Portfolio', icon: Wallet, href: '/portfolio' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-accent/50 transition-all duration-300 hover:scale-110"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-80 bg-card border-l border-border/50">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pt-4">
              <div className="p-2 rounded-xl bg-gradient-primary animate-pulse-glow">
                <Home className="h-5 w-5 text-background" />
              </div>
              <span className="text-xl font-display font-bold text-foreground">
                KALE-ndar
              </span>
            </div>

            {/* Wallet Connection */}
            <div className="mb-6">
              <WalletConnection />
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent/50 rounded-lg transition-all duration-300 hover:translate-x-1 group"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-border/50 pt-4 space-y-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start gap-3 hover:bg-accent/50 transition-all duration-300"
              >
                <div className="transition-all duration-300 hover:rotate-180">
                  {getThemeIcon()}
                </div>
                <span>
                  Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </span>
              </Button>

              {/* Notifications */}
              <div className="flex items-center gap-3 px-4 py-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Notifications</span>
                <div className="ml-auto">
                  <RealtimeNotifications />
                </div>
              </div>

              {/* User Profile */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 hover:bg-accent/50 transition-all duration-300"
              >
                <User className="h-5 w-5 text-muted-foreground" />
                <span>Profile</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;