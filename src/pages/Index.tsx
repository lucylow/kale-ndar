import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import MarketList from "@/components/MarketList";
import { YieldOptimizer } from "@/components/YieldOptimizer";
import { WalletProvider } from "@/contexts/WalletContext";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <WalletProvider>
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
      <Toaster />
    </WalletProvider>
  );
};

export default Index;
