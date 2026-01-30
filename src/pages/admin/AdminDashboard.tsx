import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, BarChart3, LogOut, Loader2, 
  Palette, Sparkles, MapPin, Globe, DollarSign, Image, Calendar
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreatorProfile {
  id: string;
  user_id: string;
  bio: string | null;
  state: string | null;
  city: string | null;
  languages: string[];
  onboarding_completed: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
  specializations?: Array<{
    category: string;
    skill_level: string;
  }>;
  pricing?: Array<{
    package_name: string;
    hours_range: string;
    price: number;
    includes: string[];
  }>;
  portfolio_count?: number;
  banking?: {
    bank_name: string | null;
    upi_id: string | null;
  };
  availability?: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }>;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalInfluencers: number;
  totalCreators: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AdminDashboard = () => {
  const { isAdminLoggedIn, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalInfluencers: 0,
    totalCreators: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate("/admin/login");
    } else {
      fetchData();
    }
  }, [isAdminLoggedIn, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchCreators(),
      fetchStats(),
    ]);
    setIsLoading(false);
  };

  const fetchCreators = async () => {
    // Fetch creator profiles
    const { data: creatorsData, error } = await supabase
      .from("creator_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !creatorsData) {
      console.error("Error fetching creators:", error);
      return;
    }

    // Fetch additional data for each creator
    const enrichedCreators = await Promise.all(
      creatorsData.map(async (creator) => {
        // Get profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("user_id", creator.user_id)
          .maybeSingle();

        // Get specializations
        const { data: specsData } = await supabase
          .from("creator_specializations")
          .select("category, skill_level")
          .eq("creator_id", creator.id);

        // Get pricing
        const { data: pricingData } = await supabase
          .from("creator_pricing")
          .select("package_name, hours_range, price, includes")
          .eq("creator_id", creator.id);

        // Get portfolio count
        const { count: portfolioCount } = await supabase
          .from("creator_portfolio")
          .select("id", { count: "exact", head: true })
          .eq("creator_id", creator.id);

        // Get banking
        const { data: bankingData } = await supabase
          .from("creator_banking")
          .select("bank_name, upi_id")
          .eq("creator_id", creator.id)
          .maybeSingle();

        // Get availability
        const { data: availData } = await supabase
          .from("creator_availability")
          .select("day_of_week, start_time, end_time, is_available")
          .eq("creator_id", creator.id);

        return {
          ...creator,
          profile: profileData,
          specializations: specsData || [],
          pricing: pricingData || [],
          portfolio_count: portfolioCount || 0,
          banking: bankingData,
          availability: availData || [],
        };
      })
    );

    setCreators(enrichedCreators);
  };

  const fetchStats = async () => {
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("status");

    const { data: influencersData } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "customer");

    const { data: creatorsData } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "team");

    setStats({
      totalBookings: bookingsData?.length || 0,
      pendingBookings: bookingsData?.filter(b => b.status === "pending").length || 0,
      completedBookings: bookingsData?.filter(b => b.status === "completed").length || 0,
      totalInfluencers: influencersData?.length || 0,
      totalCreators: creatorsData?.length || 0,
    });
  };

  const viewCreatorDetails = (creator: CreatorProfile) => {
    setSelectedCreator(creator);
    setDetailsOpen(true);
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/");
  };

  const formatSpecialization = (cat: string) => {
    return cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">
              Manage creators and platform analytics
            </p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-slate-600">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <BarChart3 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <BarChart3 className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.pendingBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.completedBookings}</div>
            </CardContent>
          </Card>
          <Card className="bg-pink-50 border-pink-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-pink-700">Influencers</CardTitle>
              <Sparkles className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-700">{stats.totalInfluencers}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Creators</CardTitle>
              <Palette className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats.totalCreators}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <Tabs defaultValue="creators" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="creators" className="gap-2">
              <Palette className="h-4 w-4" />
              Creator Profiles
            </TabsTrigger>
            <TabsTrigger value="influencers" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Influencers
            </TabsTrigger>
          </TabsList>

          {/* Creators Tab */}
          <TabsContent value="creators">
            <Card>
              <CardHeader>
                <CardTitle>All Creators</CardTitle>
                <CardDescription>
                  View all registered creators and their profile details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {creators.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Palette className="mx-auto mb-4 h-12 w-12 opacity-40" />
                    <p className="font-medium">No creators yet</p>
                    <p className="text-sm mt-1">Creators will appear here after they sign up</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creators.map((creator) => (
                      <div
                        key={creator.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <Palette className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {creator.profile?.full_name || "Unnamed Creator"}
                              </p>
                              <p className="text-sm text-slate-500">{creator.profile?.email}</p>
                            </div>
                          </div>
                          
                          {/* Quick Info */}
                          <div className="flex flex-wrap gap-3 text-sm">
                            {creator.city && creator.state && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="h-3.5 w-3.5" />
                                {creator.city}, {creator.state}
                              </span>
                            )}
                            {creator.languages && creator.languages.length > 0 && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Globe className="h-3.5 w-3.5" />
                                {creator.languages.slice(0, 2).join(", ")}
                                {creator.languages.length > 2 && ` +${creator.languages.length - 2}`}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-slate-500">
                              <Image className="h-3.5 w-3.5" />
                              {creator.portfolio_count} portfolio items
                            </span>
                            {creator.pricing && creator.pricing.length > 0 && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <DollarSign className="h-3.5 w-3.5" />
                                {creator.pricing.length} packages
                              </span>
                            )}
                          </div>

                          {/* Specializations */}
                          {creator.specializations && creator.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {creator.specializations.map((spec, i) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary"
                                  className="text-xs bg-purple-100 text-purple-700"
                                >
                                  {formatSpecialization(spec.category)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant={creator.onboarding_completed ? "default" : "secondary"}>
                            {creator.onboarding_completed ? "Complete" : "Onboarding"}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewCreatorDetails(creator)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Influencers Tab */}
          <TabsContent value="influencers">
            <Card>
              <CardHeader>
                <CardTitle>All Influencers</CardTitle>
                <CardDescription>
                  View registered influencers who can book creators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-slate-500">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 opacity-40" />
                  <p className="font-medium">Influencer management coming soon</p>
                  <p className="text-sm mt-1">This section will show registered influencers</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Creator Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              {selectedCreator?.profile?.full_name || "Creator Details"}
            </DialogTitle>
            <DialogDescription>
              {selectedCreator?.profile?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedCreator && (
            <div className="space-y-6 py-4">
              {/* Bio */}
              {selectedCreator.bio && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Bio</h4>
                  <p className="text-sm text-slate-600">{selectedCreator.bio}</p>
                </div>
              )}

              {/* Location */}
              {(selectedCreator.city || selectedCreator.state) && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Location</h4>
                  <p className="text-sm text-slate-600">
                    {[selectedCreator.city, selectedCreator.state].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}

              {/* Languages */}
              {selectedCreator.languages && selectedCreator.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCreator.languages.map((lang, i) => (
                      <Badge key={i} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Specializations */}
              {selectedCreator.specializations && selectedCreator.specializations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Specializations</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCreator.specializations.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                        <span>{formatSpecialization(spec.category)}</span>
                        <Badge 
                          variant="secondary"
                          className={
                            spec.skill_level === "expert" 
                              ? "bg-purple-100 text-purple-700"
                              : spec.skill_level === "intermediate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }
                        >
                          {spec.skill_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              {selectedCreator.pricing && selectedCreator.pricing.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Pricing Packages</h4>
                  <div className="space-y-3">
                    {selectedCreator.pricing.map((pkg, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{pkg.package_name}</span>
                          <span className="text-purple-600 font-bold">₹{pkg.price}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">{pkg.hours_range}</p>
                        {pkg.includes && pkg.includes.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {pkg.includes.map((item, j) => (
                              <Badge key={j} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              {selectedCreator.availability && selectedCreator.availability.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Availability
                  </h4>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((day, i) => {
                      const avail = selectedCreator.availability?.find(a => a.day_of_week === i);
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded text-center text-xs ${
                            avail?.is_available
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          <div className="font-medium">{day}</div>
                          {avail?.is_available && (
                            <div className="mt-1 text-[10px]">
                              {avail.start_time?.slice(0, 5)}-{avail.end_time?.slice(0, 5)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Banking */}
              {selectedCreator.banking && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Banking Details</h4>
                  <div className="p-3 bg-slate-50 rounded-lg text-sm">
                    {selectedCreator.banking.bank_name && (
                      <p><span className="text-slate-500">Bank:</span> {selectedCreator.banking.bank_name}</p>
                    )}
                    {selectedCreator.banking.upi_id && (
                      <p><span className="text-slate-500">UPI:</span> {selectedCreator.banking.upi_id}</p>
                    )}
                    {!selectedCreator.banking.bank_name && !selectedCreator.banking.upi_id && (
                      <p className="text-slate-400 italic">No banking details provided</p>
                    )}
                  </div>
                </div>
              )}

              {/* Portfolio Count */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Portfolio</h4>
                <p className="text-sm text-slate-600">
                  {selectedCreator.portfolio_count} items uploaded
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;