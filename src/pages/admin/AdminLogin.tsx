import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, ShieldCheck, Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const { adminLogin, isAdminLoggedIn } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate("/admin/dashboard");
    }
  }, [isAdminLoggedIn, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    // Functionality preserved from original code
    const result = adminLogin(email, password);
    
    if (result.success) {
      toast({
        title: "Welcome back",
        description: "Admin session authenticated successfully.",
      });
      navigate("/admin/dashboard");
    } else {
      setError(result.error || "Invalid credentials");
    }
    
    setIsSubmitting(false);
  };

  if (isSubmitting && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-900 relative">
      
      {/* Top Left Back Button */}
      <div className="absolute top-8 left-8 z-10">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Left Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 md:px-20 lg:px-24">
        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Access</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Enter your administrative credentials to manage the ServiceFlow platform.
            </p>
          </div>

          {/* Demo Alert - Stylized */}
          <Alert className="mb-6 border-blue-100 bg-blue-50/50 text-blue-700 py-3">
            <AlertDescription className="text-[12px] font-medium flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px] bg-blue-100 px-1.5 py-0.5 rounded">Note</span>
              admin@example.com / admin123
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-sm font-medium">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                className="h-11 border-slate-200 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="admin-password" stroke-width="1.5" className="text-sm font-medium">Password</Label>
              </div>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                className="h-11 border-slate-200 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded border border-red-100">{error}</p>
            )}
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-medium transition-all" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In to Dashboard"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side: Simple Blue Background */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 p-16 flex-col justify-between text-white">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-white rounded flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm font-bold tracking-tight">Admin Console</span>
        </div>
        
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            System management <br />and oversight.
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <Lock className="h-4 w-4 text-blue-100" />
              </div>
              <p className="text-blue-50 text-sm leading-relaxed">
                Secure access point for managing team members, viewing business analytics, and configuring system services.
              </p>
            </div>
          </div>
        </div>

        <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-blue-300">
          ServiceFlow © 2024 • Admin System
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;