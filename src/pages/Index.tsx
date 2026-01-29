import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Shield, Calendar, Clock, CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Book Services with Ease
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              A simple, streamlined platform for booking appointments. 
              Connect with your service providers and manage your schedule effortlessly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Easy Scheduling</span>
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Real-time Updates</span>
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Instant Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Cards Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-foreground md:text-3xl">
            Choose Your Portal
          </h2>
          <p className="text-muted-foreground">
            Select the portal that matches your role to get started
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {/* Customer Portal */}
          <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Customer Portal</CardTitle>
              <CardDescription>
                Book appointments, manage your schedule, and stay updated with notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Book new appointments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  View booking history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Manage your profile
                </li>
              </ul>
              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link to="/customer/auth">Get Started</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Portal */}
          <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Team Portal</CardTitle>
              <CardDescription>
                Manage bookings, view customer details, and coordinate your team's schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  View all bookings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Manage appointments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Access customer info
                </li>
              </ul>
              <div className="pt-4">
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/team/auth">Team Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Portal */}
          <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Admin Portal</CardTitle>
              <CardDescription>
                Full system access to manage team members, services, and view analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Manage team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Configure services
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  View analytics
                </li>
              </ul>
              <div className="pt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/admin/login">Admin Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Service Booking Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
