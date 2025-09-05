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
import Sidebar from "@/components/common/Sidebar";
import Footer from "@/components/common/Footer";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import KalePage from "./pages/KalePage";
import ReflectorPage from "./pages/ReflectorPage";
import DeFiPage from "./pages/DeFiPage";
import Portfolio from "./pages/Portfolio";
import Settings from "./pages/Settings";
import WalletTest from "./pages/WalletTest";
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
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  {/* Landing page without layout */}
                  <Route path="/" element={<Index />} />
                  <Route path="/wallet-test" element={<WalletTest />} />
                  
                  {/* App pages with layout */}
                  <Route path="/dashboard" element={
                    <AuthGuard>
                      <div className="flex flex-col min-h-screen">
                        <Header />
                        <div className="flex flex-1">
                          <Sidebar />
                          <main className="flex-1 ml-64 p-6 pt-24">
                            <Dashboard />
                          </main>
                        </div>
                        <Footer />
                      </div>
                    </AuthGuard>
                  } />
                  
                  <Route path="/kale" element={
                    <AuthGuard>
                      <div className="flex flex-col min-h-screen">
                        <Header />
                        <div className="flex flex-1">
                          <Sidebar />
                          <main className="flex-1 ml-64 p-6 pt-24">
                            <KalePage />
                          </main>
                        </div>
                        <Footer />
                      </div>
                    </AuthGuard>
                  } />
                  
                  <Route path="/reflector" element={
                    <AuthGuard>
                      <div className="flex flex-col min-h-screen">
                        <Header />
                        <div className="flex flex-1">
                          <Sidebar />
                          <main className="flex-1 ml-64 p-6 pt-24">
                            <ReflectorPage />
                          </main>
                        </div>
                        <Footer />
                      </div>
                    </AuthGuard>
                  } />
                  
                  <Route path="/defi" element={
                    <AuthGuard>
                      <div className="flex flex-col min-h-screen">
                        <Header />
                        <div className="flex flex-1">
                          <Sidebar />
                          <main className="flex-1 ml-64 p-6 pt-24">
                            <DeFiPage />
                          </main>
                        </div>
                        <Footer />
                      </div>
                    </AuthGuard>
                  } />
                  
                  <Route path="/portfolio" element={
                    <AuthGuard>
                      <div className="flex flex-col min-h-screen">
                        <Header />
                        <div className="flex flex-1">
                          <Sidebar />
                          <main className="flex-1 ml-64 p-6 pt-24">
                            <Portfolio />
                          </main>
                        </div>
                        <Footer />
                      </div>
                    </AuthGuard>
                  } />
                  
                  <Route path="/settings" element={
                    <AuthGuard>
                      <div className="flex flex-col min-h-screen">
                        <Header />
                        <div className="flex flex-1">
                          <Sidebar />
                          <main className="flex-1 ml-64 p-6 pt-24">
                            <Settings />
                          </main>
                        </div>
                        <Footer />
                      </div>
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
