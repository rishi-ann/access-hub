import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Bell, CalendarDays, LogOut, Loader2, 
  CheckCircle, Clock, XCircle, AlertCircle, Phone, Mail, Sparkles
} from "lucide-react";

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string | null;
  services: {
    name: string;
    duration_minutes: number;
    price: number;
  } | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const InfluencerDashboard = () => {
  const { user, userRole, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");

  useEffect(() => {
    if (!isLoading && (!user || userRole !== "customer")) {
      navigate("/influencer/auth");
    }
  }, [user, userRole, isLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "customer") {
      fetchData();
    }
  }, [user, userRole]);

  const fetchData = async () => {
    setIsLoadingData(true);
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("user_id", user?.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
      setFormName(profileData.full_name || "");
      setFormPhone(profileData.phone || "");
    }

    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        booking_time,
        status,
        notes,
        services (
          name,
          duration_minutes,
          price
        )
      `)
      .eq("customer_id", user?.id)
      .order("booking_date", { ascending: false });

    if (bookingsData) {
      setBookings(bookingsData);
    }

    // Fetch notifications
    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (notificationsData) {
      setNotifications(notificationsData);
    }

    setIsLoadingData(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: formName, phone: formPhone })
      .eq("user_id", user?.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update profile.",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      fetchData();
    }
    setIsSaving(false);
  };

  const markNotificationAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    fetchData();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      confirmed: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      cancelled: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      completed: { variant: "outline", icon: <CheckCircle className="h-3 w-3" /> },
    };
    const { variant, icon } = variants[status] || { variant: "secondary" as const, icon: <AlertCircle className="h-3 w-3" /> };
    return (
      <Badge variant={variant} className="gap-1 capitalize">
        {icon} {status}
      </Badge>
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading || isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Influencer Dashboard</h1>
              <p className="text-sm text-slate-500">
                Welcome back, {profile?.full_name || profile?.email || "Influencer"}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="text-slate-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="bookings" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 relative">
              <Bell className="h-4 w-4" />
              Notifications
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-600 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>View and track your creator bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <CalendarDays className="mx-auto mb-4 h-12 w-12 opacity-40" />
                    <p className="font-medium">No bookings yet</p>
                    <p className="text-sm mt-1">Your creator bookings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{booking.services?.name || "Service"}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(booking.booking_date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at {booking.booking_time}
                          </p>
                          {booking.notes && (
                            <p className="text-sm text-slate-400 mt-1">{booking.notes}</p>
                          )}
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Stay updated on your bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Bell className="mx-auto mb-4 h-12 w-12 opacity-40" />
                    <p className="font-medium">No notifications</p>
                    <p className="text-sm mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                          notification.is_read ? "bg-white" : "bg-pink-50 border-pink-200"
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-slate-900">{notification.title}</p>
                            <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                          </div>
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-pink-600 flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={profile?.email || ""}
                      disabled
                      className="bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-pink-600 hover:bg-pink-700">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InfluencerDashboard;