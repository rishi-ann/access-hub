import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, Palette, Calendar, DollarSign, 
  Image, Settings, CheckCircle
} from "lucide-react";

interface CreatorMainDashboardProps {
  creatorProfile: any;
}

const CreatorMainDashboard = ({ creatorProfile }: CreatorMainDashboardProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Palette className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Creator Dashboard</h1>
              <p className="text-sm text-slate-500">Welcome back!</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="text-slate-600">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-purple-800 text-white border-0">
          <CardContent className="py-8">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Your profile is live! 🎉</h2>
                <p className="text-purple-100 mt-1">
                  Influencers can now discover you and book your services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Portfolio Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">-</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">-</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Profile Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Manage Your Profile</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:border-purple-300 transition-colors cursor-pointer">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <Image className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">Portfolio</CardTitle>
              <CardDescription>Update your showcase work</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-purple-300 transition-colors cursor-pointer">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">Pricing</CardTitle>
              <CardDescription>Manage your packages</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-purple-300 transition-colors cursor-pointer">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">Availability</CardTitle>
              <CardDescription>Set your schedule</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-purple-300 transition-colors cursor-pointer">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <Settings className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-base">Settings</CardTitle>
              <CardDescription>Profile & banking</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreatorMainDashboard;