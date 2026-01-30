import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InfluencerAuth from "./pages/influencer/InfluencerAuth";
import InfluencerDashboard from "./pages/influencer/InfluencerDashboard";
import CreatorAuth from "./pages/creator/CreatorAuth";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Influencer Routes (formerly Customer) */}
              <Route path="/influencer/auth" element={<InfluencerAuth />} />
              <Route path="/influencer/dashboard" element={<InfluencerDashboard />} />
              
              {/* Creator Routes (formerly Team) */}
              <Route path="/creator/auth" element={<CreatorAuth />} />
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* Legacy redirects */}
              <Route path="/customer/auth" element={<InfluencerAuth />} />
              <Route path="/customer/dashboard" element={<InfluencerDashboard />} />
              <Route path="/team/auth" element={<CreatorAuth />} />
              <Route path="/team/dashboard" element={<CreatorDashboard />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;