import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-900 relative">
      
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

      {/* Left Column: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 md:px-20 lg:px-24">
        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight text-indigo-600">Team Portal</h1>
            <p className="text-slate-500 text-sm">Sign in to manage bookings and schedules.</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="flex gap-6 border-b border-slate-100 rounded-none bg-transparent h-auto p-0 mb-8">
              <TabsTrigger 
                value="signin" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-2 text-sm font-medium"
              >
                Join Team
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 border-slate-200 focus:border-indigo-600"
                    required
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 border-slate-200 focus:border-indigo-600"
                    required
                  />
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-medium" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Sign In to Portal"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 border-slate-200 focus:border-indigo-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-up" className="text-sm">Work Email</Label>
                  <Input
                    id="email-up"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 border-slate-200 focus:border-indigo-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-up" className="text-sm">Password</Label>
                  <Input
                    id="password-up"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 border-slate-200 focus:border-indigo-600"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-medium" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Create Team Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Column: Indigo Branding */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 p-16 flex-col justify-between text-white">
        <div className="text-sm font-bold tracking-tight opacity-80 uppercase tracking-widest">Team Environment</div>
        
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-6">Coordinate your operations with precision.</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-500 p-1 rounded">
                <Check className="h-4 w-4 text-indigo-100" />
              </div>
              <p className="text-indigo-50 text-sm leading-relaxed font-medium">
                Access real-time schedules and customer information to provide seamless service.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-500 p-1 rounded">
                <Check className="h-4 w-4 text-indigo-100" />
              </div>
              <p className="text-indigo-50 text-sm leading-relaxed font-medium">
                Update appointment statuses and track your daily tasks in one unified system.
              </p>
            </div>
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-300">
          ServiceFlow © 2024 • Operations Panel
        </div>
      </div>
    </div>
  );
};

export default TeamAuth;