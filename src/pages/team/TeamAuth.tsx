import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card"; // Added for the container
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Briefcase, Check } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const TeamAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user && userRole === "team") {
      navigate("/team/dashboard");
    }
  }, [user, userRole, isLoading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.email = e.errors[0].message;
    }
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.password = e.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "Please check your credentials.",
      });
    } else {
      toast({ title: "Welcome back!", description: "Successfully signed in." });
    }
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const { error } = await signUp(email, password, "team", fullName);
    if (error) {
      let errorMessage = "An error occurred during sign up.";
      if (error.message?.includes("already registered")) errorMessage = "Email already registered.";
      toast({ variant: "destructive", title: "Sign up failed", description: errorMessage });
    } else {
      toast({ title: "Account created!", description: "Welcome to the team portal." });
      navigate("/team/dashboard");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans antialiased text-slate-900 relative">
      
      {/* Absolute Back Button */}
      <div className="absolute top-8 left-8 z-10">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Left Column: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="pt-10 pb-12 px-8">
            <div className="mb-8">
              <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
                <Briefcase className="h-6 w-6 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Team Access</h1>
              <p className="text-slate-500 text-sm">Coordinate schedules and manage appointments.</p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-slate-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="signin" 
                  className="text-sm font-medium data-[state=active]:text-indigo-600"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="text-sm font-medium data-[state=active]:text-indigo-600"
                >
                  Join Team
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 border-slate-200 focus-visible:ring-indigo-600"
                      required
                    />
                    {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-slate-200 focus-visible:ring-indigo-600"
                      required
                    />
                    {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-bold shadow-md transition-all active:scale-[0.98]" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Sign In to Portal"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 border-slate-200 focus-visible:ring-indigo-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-up" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Work Email</Label>
                    <Input
                      id="email-up"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 border-slate-200 focus-visible:ring-indigo-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-up" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</Label>
                    <Input
                      id="password-up"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-slate-200 focus-visible:ring-indigo-600"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-bold shadow-md transition-all active:scale-[0.98]" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Create Team Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Indigo Branding */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 p-16 flex-col justify-between text-white">
        <div className="text-xs font-bold tracking-[0.2em] opacity-80 uppercase">Operations Control</div>
        
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-8 leading-tight">Simplify your <br />daily operations.</h2>
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="bg-white/10 p-2 rounded-lg">
                <Check className="h-5 w-5 text-indigo-100" />
              </div>
              <div>
                <p className="font-bold text-lg mb-1">Live Schedules</p>
                <p className="text-indigo-50/70 text-sm leading-relaxed">
                  Real-time visibility into all bookings to help you prepare for your next client seamlessly.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="bg-white/10 p-2 rounded-lg">
                <Check className="h-5 w-5 text-indigo-100" />
              </div>
              <div>
                <p className="font-bold text-lg mb-1">Efficient Management</p>
                <p className="text-indigo-50/70 text-sm leading-relaxed">
                  Update statuses, manage notes, and track history across the entire team in one place.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-300">
          ServiceFlow © 2024
        </div>
      </div>
    </div>
  );
};

export default TeamAuth;
