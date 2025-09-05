import { Button } from "@/components/ui/button";
import { Play, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { wallet, availableWallets, connectWallet, isLoading } = useWallet();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    console.log('Button clicked!', { 
      isConnected: wallet.isConnected, 
      isLoading, 
      isConnecting 
    });
    
    if (!wallet.isConnected) {
      try {
        setIsConnecting(true);
        console.log('Attempting to connect wallet...');
        await connectWallet();
        toast({
          title: "Wallet Connected!",
          description: "Redirecting to your dashboard...",
        });
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Wallet connection failed:', error);
        toast({
          title: "Connection Failed",
          description: availableWallets.length === 0 
            ? "No Stellar wallets are available. Please install a Stellar wallet like Freighter, Lobstr, Rabet, or Albedo."
            : error instanceof Error ? error.message : "Failed to connect wallet. Please make sure your wallet is installed and unlocked.",
          variant: "destructive",
        });
      } finally {
        setIsConnecting(false);
      }
    } else {
      console.log('Already connected, navigating to dashboard...');
      // If already connected, navigate to dashboard
      navigate('/dashboard');
    }
  };

  const handleWatchDemo = () => {
    // Open demo video or show demo modal
    toast({
      title: "Demo Coming Soon",
      description: "Interactive demo will be available soon. Try connecting your wallet to explore the platform!",
    });
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-hero pt-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-teal/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-teal/10 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: "2s"}} />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">Live Prediction Markets</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 animate-fade-in leading-tight">
            <span className="bg-gradient-accent bg-clip-text text-transparent animate-pulse-glow">
              Predict the Future,
            </span>
            <br />
            <span className="text-foreground relative">
              Earn KALE
              <div className="absolute -top-2 -right-4 w-6 h-6 bg-accent-gold rounded-full animate-bounce" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            KALE-ndar is a revolutionary prediction market platform where you can stake KALE tokens 
            on real-world events and earn rewards for accurate forecasts.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 animate-fade-in max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">$2.4M</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent-teal">1,247</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Active Markets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-accent-gold">24.5%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Avg. ROI</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 animate-fade-in px-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 group hover:scale-105 transition-all duration-300 cursor-pointer w-full sm:w-auto"
              onClick={handleGetStarted}
              disabled={isLoading || isConnecting}
              type="button"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-background border-t-transparent mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  {wallet.isConnected ? 'Start Predicting' : 'Get Started Now'}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 group hover:bg-accent/20 transition-all duration-300 w-full sm:w-auto"
              onClick={handleWatchDemo}
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative max-w-5xl mx-auto animate-fade-in px-4">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-card border border-white/10 shadow-card group">
              <img
                src={heroDashboard}
                alt="KALE-ndar Prediction Market Dashboard"
                className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              
              {/* Floating elements */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 p-2 sm:p-3 bg-primary/90 rounded-lg backdrop-blur-sm animate-float shadow-lg">
                <span className="text-primary-foreground font-semibold text-xs sm:text-sm">+24.5% ROI</span>
              </div>
              
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 p-2 sm:p-3 bg-accent-teal/90 rounded-lg backdrop-blur-sm animate-float shadow-lg" style={{animationDelay: "2s"}}>
                <span className="text-background font-semibold text-xs sm:text-sm">1,247 Active Markets</span>
              </div>

              {/* New floating element */}
              <div className="absolute top-1/2 left-2 sm:left-4 p-2 sm:p-3 bg-accent-gold/90 rounded-lg backdrop-blur-sm animate-float shadow-lg" style={{animationDelay: "4s"}}>
                <span className="text-background font-semibold text-xs sm:text-sm">$2.4M Volume</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;