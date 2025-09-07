import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import DevModeIndicator from "@/components/DevModeIndicator";
import Header from "@/components/common/Header";
import AppSidebar from "@/components/AppSidebar";
import Footer from "@/components/common/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import KalePage from "./pages/KalePage";
import ReflectorPage from "./pages/ReflectorPage";
import DeFiPage from "./pages/DeFiPage";
import Portfolio from "./pages/Portfolio";
import PredictionMarkets from "./pages/PredictionMarkets";
import Settings from "./pages/Settings";
import WalletTest from "./pages/WalletTest";
import PitchDeck from "./pages/PitchDeck";
import PasskeyDemo from "./pages/PasskeyDemo";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <DevModeIndicator />
            <BrowserRouter>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  {/* Landing page without layout */}
                  <Route path="/" element={<Index />} />
                  <Route path="/wallet-test" element={<WalletTest />} />
                  <Route path="/pitch-deck" element={<PitchDeck />} />
                  <Route path="/passkey-demo" element={<PasskeyDemo />} />
                  
                  {/* App pages with sidebar layout */}
                  <Route path="/dashboard" element={
                    <AuthGuard>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full">
                          <AppSidebar />
                          <div className="flex flex-col flex-1">
                            <Header />
                            <main className="flex-1 p-6 pt-24">
                              <Dashboard />
                            </main>
                            <Footer />
                          </div>
                        </div>
                      </SidebarProvider>
                    </AuthGuard>
                  } />
                  
                  <Route path="/kale" element={
                    <AuthGuard>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full">
                          <AppSidebar />
                          <div className="flex flex-col flex-1">
                            <Header />
                            <main className="flex-1 p-6 pt-24">
                              <KalePage />
                            </main>
                            <Footer />
                          </div>
                        </div>
                      </SidebarProvider>
                    </AuthGuard>
                  } />
                  
                  <Route path="/reflector" element={
                    <AuthGuard>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full">
                          <AppSidebar />
                          <div className="flex flex-col flex-1">
                            <Header />
                            <main className="flex-1 p-6 pt-24">
                              <ReflectorPage />
                            </main>
                            <Footer />
                          </div>
                        </div>
                      </SidebarProvider>
                    </AuthGuard>
                  } />
                  
                  <Route path="/defi" element={
                    <AuthGuard>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full">
                          <AppSidebar />
                          <div className="flex flex-col flex-1">
                            <Header />
                            <main className="flex-1 p-6 pt-24">
                              <DeFiPage />
                            </main>
                            <Footer />
                          </div>
                        </div>
                      </SidebarProvider>
                    </AuthGuard>
                  } />
                  
                  <Route path="/portfolio" element={
                    <AuthGuard>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full">
                          <AppSidebar />
                          <div className="flex flex-col flex-1">
                            <Header />
                            <main className="flex-1 p-6 pt-24">
                              <Portfolio />
                            </main>
                            <Footer />
                          </div>
                        </div>
                      </SidebarProvider>
                    </AuthGuard>
                  } />
                  
                  <Route path="/markets" element={
                    <AuthGuard>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full">
                          <AppSidebar />
                          <div className="flex flex-col flex-1">
                            <Header />
                            <main className="flex-1 p-6 pt-24">
                              <PredictionMarkets />
                            </main>
                            <Footer />
                          </div>
                        </div>
                      </SidebarProvider>
                    </AuthGuard>
                  } />
                  
                  <Route path="/settings" element={
                    <AuthGuard>
                      <SidebarProvider>
                        <div className="flex min-h-screen w-full">
                          <AppSidebar />
                          <div className="flex flex-col flex-1">
                            <Header />
                            <main className="flex-1 p-6 pt-24">
                              <Settings />
                            </main>
                            <Footer />
                          </div>
                        </div>
                      </SidebarProvider>
                    </AuthGuard>
                  } />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
