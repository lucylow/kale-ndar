import { Button } from "@/components/ui/button";
import { Leaf, Menu, X, Sun, Moon, Monitor, Bell, BarChart3, Target, Sparkles, Play } from "lucide-react";
import { useState, useEffect } from "react";
import WalletConnector from "@/components/WalletConnector";
import NetworkIndicator from "@/components/NetworkIndicator";
import { useTheme } from "@/contexts/ThemeContext";
import NotificationBadge from "@/components/ui/notification-badge";
import ConnectionStatus from "@/components/ui/connection-status";
import { useWallet } from "@/contexts/WalletContext";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count
  const { wallet } = useWallet();
  const navigate = useNavigate();

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
      <nav className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-background" />
            </div>
            <span className="text-xl sm:text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
              KALE-ndar
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {wallet.isConnected ? (
              <>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
                >
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
                </button>
                <a 
                  href="#markets" 
                  className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
                >
                  Markets
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a 
                  href="#features" 
                  className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
                >
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
                </a>
              </>
            ) : (
              <>
                <a 
                  href="#markets" 
                  className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
                >
                  Markets
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a 
                  href="#features" 
                  className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
                >
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-muted-foreground hover:text-accent-teal transition-colors relative group"
                >
                  How It Works
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-teal transition-all duration-300 group-hover:w-full"></span>
                </a>
              </>
            )}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <ConnectionStatus variant="icon" className="mr-2" />
            
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
            
            
            {/* Network Indicator */}
            <NetworkIndicator />
            
            <WalletConnector />
            {wallet.isConnected && (
              <Button 
                variant="hero" 
                size="sm" 
                className="hover:scale-105 transition-transform gap-2"
                onClick={() => navigate('/dashboard')}
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1 sm:gap-2">
            <ConnectionStatus variant="icon" className="mr-1" />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-accent/50 transition-colors h-8 w-8"
              aria-label="Toggle theme"
            >
              {getThemeIcon()}
            </Button>
            
            {/* Mobile Notification Button */}
            <NotificationBadge count={notificationCount} variant="default" size="sm">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent/50 transition-colors h-8 w-8"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </NotificationBadge>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:bg-accent/50 transition-colors h-8 w-8"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen 
            ? 'max-h-96 opacity-100 mt-4' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="flex flex-col gap-2 pb-4 border-t border-white/10 pt-4 bg-background/50 backdrop-blur-sm rounded-lg">
            {wallet.isConnected ? (
              <>
                <button 
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMenuOpen(false);
                  }}
                  className="text-muted-foreground hover:text-accent-teal transition-all duration-200 py-3 px-4 rounded-lg hover:bg-accent/20 text-left hover:translate-x-1 flex items-center gap-3"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </button>
                <a 
                  href="#markets" 
                  className="text-muted-foreground hover:text-accent-teal transition-all duration-200 py-3 px-4 rounded-lg hover:bg-accent/20 hover:translate-x-1 flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Target className="h-4 w-4" />
                  Markets
                </a>
                <a 
                  href="#features" 
                  className="text-muted-foreground hover:text-accent-teal transition-all duration-200 py-3 px-4 rounded-lg hover:bg-accent/20 hover:translate-x-1 flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Sparkles className="h-4 w-4" />
                  Features
                </a>
              </>
            ) : (
              <>
                <a 
                  href="#markets" 
                  className="text-muted-foreground hover:text-accent-teal transition-colors py-2 px-4 rounded-lg hover:bg-accent/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Markets
                </a>
                <a 
                  href="#features" 
                  className="text-muted-foreground hover:text-accent-teal transition-colors py-2 px-4 rounded-lg hover:bg-accent/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-muted-foreground hover:text-accent-teal transition-colors py-2 px-4 rounded-lg hover:bg-accent/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </a>
              </>
            )}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <WalletConnector />
              {wallet.isConnected && (
                <Button 
                  variant="hero" 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMenuOpen(false);
                  }}
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;