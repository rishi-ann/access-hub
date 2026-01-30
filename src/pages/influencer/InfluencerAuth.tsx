import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Check, Sparkles } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Must be at least 6 characters");

const InfluencerAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && user && userRole === "customer") {
      navigate("/influencer/dashboard");
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
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Welcome", description: "Signed in successfully." });
    }
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const { error } = await signUp(email, password, "customer", fullName);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Success", description: "Account created." });
      navigate("/influencer/dashboard");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/30">
      
      {/* Back Button - Top Left */}
      <div className="absolute top-8 left-8 z-10">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-pink-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Left side: Centered Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md border-slate-200 shadow-sm bg-white">
          <CardContent className="pt-8 pb-10 px-8">
            <div className="mb-8">
              <div className="h-12 w-12 bg-pink-50 rounded-xl flex items-center justify-center mb-5">
                <Sparkles className="h-6 w-6 text-pink-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Influencer Portal</h1>
              <p className="text-slate-500 text-sm">Connect with talented creators for your brand.</p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-slate-100 p-1">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 border-slate-200 focus-visible:ring-pink-600"
                      required
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 border-slate-200 focus-visible:ring-pink-600"
                      required
                    />
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                  </div>
                  <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 h-10 font-medium" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your Brand Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10 border-slate-200 focus-visible:ring-pink-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-up">Email address</Label>
                    <Input
                      id="email-up"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 border-slate-200 focus-visible:ring-pink-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-up">Password</Label>
                    <Input
                      id="password-up"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 border-slate-200 focus-visible:ring-pink-600"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 h-10 font-medium" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right side: Branding Content */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-pink-500 to-rose-600 p-16 flex-col justify-between text-white">
        <div className="text-sm font-bold tracking-tight">Influencer Hub</div>
        
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-6">Find the perfect creator for your brand.</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-pink-200 mt-0.5" />
              <p className="text-pink-50 text-sm leading-relaxed">
                Browse portfolios and discover talented creators who match your vision.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-pink-200 mt-0.5" />
              <p className="text-pink-50 text-sm leading-relaxed">
                Book creators directly and manage all your collaborations in one place.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-pink-200 mt-0.5" />
              <p className="text-pink-50 text-sm leading-relaxed">
                Get instant notifications and updates on your project status.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-pink-200 opacity-80">© 2026 ServiceFlow</div>
      </div>
    </div>
  );
};

export default InfluencerAuth;