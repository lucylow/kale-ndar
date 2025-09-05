import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import MarketList from "@/components/MarketList";
import { YieldOptimizer } from "@/components/YieldOptimizer";
import { WalletProvider, useWallet } from "@/contexts/WalletContext";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IndexContent = () => {
  const { wallet, isLoading } = useWallet();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && wallet.isConnected) {
      navigate('/dashboard');
    }
  }, [wallet.isConnected, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main>
        <Hero />
        <MarketList />
        <YieldOptimizer />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

const Index = () => {
  return (
    <WalletProvider>
      <IndexContent />
      <Toaster />
    </WalletProvider>
  );
};

export default Index;
