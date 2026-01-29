import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Settings, BarChart3, LogOut, Loader2, 
  Plus, Trash2, Edit, DollarSign, Clock, Briefcase
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalCustomers: number;
  totalTeamMembers: number;
}

const AdminDashboard = () => {
  const { isAdminLoggedIn, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [services, setServices] = useState<Service[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalCustomers: 0,
    totalTeamMembers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    duration_minutes: 60,
    price: 0,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

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
      fetchServices(),
      fetchTeamMembers(),
      fetchStats(),
    ]);
    setIsLoading(false);
  };

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setServices(data);
    }
  };

  const fetchTeamMembers = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .eq("role", "team");

    if (!error && data) {
      // Fetch profiles for team members
      const userIds = data.map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, p]) || []
      );

      const membersWithProfiles = data.map(member => ({
        ...member,
        profiles: profilesMap.get(member.user_id) || null,
      }));

      setTeamMembers(membersWithProfiles);
    }
  };

  const fetchStats = async () => {
    // Fetch booking stats
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("status");

    // Fetch customer count
    const { data: customersData } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "customer");

    // Fetch team count
    const { data: teamData } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "team");

    setStats({
      totalBookings: bookingsData?.length || 0,
      pendingBookings: bookingsData?.filter(b => b.status === "pending").length || 0,
      completedBookings: bookingsData?.filter(b => b.status === "completed").length || 0,
      totalCustomers: customersData?.length || 0,
      totalTeamMembers: teamData?.length || 0,
    });
  };

  const handleAddService = async () => {
    if (!newService.name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Service name is required.",
      });
      return;
    }

    setIsAddingService(true);

    const { error } = await supabase
      .from("services")
      .insert({
        name: newService.name,
        description: newService.description || null,
        duration_minutes: newService.duration_minutes,
        price: newService.price,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add service.",
      });
    } else {
      toast({
        title: "Service added",
        description: `${newService.name} has been added.`,
      });
      setNewService({ name: "", description: "", duration_minutes: 60, price: 0 });
      setDialogOpen(false);
      fetchServices();
    }

    setIsAddingService(false);
  };

  const handleToggleService = async (serviceId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: isActive })
      .eq("id", serviceId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update service.",
      });
    } else {
      fetchServices();
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete service.",
      });
    } else {
      toast({
        title: "Service deleted",
        description: "The service has been removed.",
      });
      fetchServices();
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Full system control and management
            </p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
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
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeamMembers}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList>
            <TabsTrigger value="services" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Services</CardTitle>
                  <CardDescription>Manage available services</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Service</DialogTitle>
                      <DialogDescription>
                        Create a new service for customers to book
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-name">Name</Label>
                        <Input
                          id="service-name"
                          value={newService.name}
                          onChange={(e) =>
                            setNewService({ ...newService, name: e.target.value })
                          }
                          placeholder="e.g., Haircut"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-description">Description</Label>
                        <Textarea
                          id="service-description"
                          value={newService.description}
                          onChange={(e) =>
                            setNewService({ ...newService, description: e.target.value })
                          }
                          placeholder="Service description..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="service-duration">Duration (minutes)</Label>
                          <Input
                            id="service-duration"
                            type="number"
                            value={newService.duration_minutes}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                duration_minutes: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="service-price">Price ($)</Label>
                          <Input
                            id="service-price"
                            type="number"
                            step="0.01"
                            value={newService.price}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleAddService}
                        disabled={isAddingService}
                      >
                        {isAddingService && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Add Service
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Briefcase className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No services yet</p>
                    <p className="text-sm">Add your first service to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={`flex items-center justify-between rounded-lg border p-4 ${
                          !service.is_active ? "opacity-50" : ""
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{service.name}</p>
                            {!service.is_active && (
                              <span className="text-xs text-muted-foreground">(Inactive)</span>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {service.duration_minutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {service.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={service.is_active}
                            onCheckedChange={(checked) =>
                              handleToggleService(service.id, checked)
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  View registered team members (they register through Team Portal)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>No team members yet</p>
                    <p className="text-sm">Team members can register via the Team Portal</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">
                            {member.profiles?.full_name || "Team Member"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {member.profiles?.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    System settings will be available in a future update. 
                    For now, you can manage services and view team members.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
