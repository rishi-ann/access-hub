import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Shield, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-900 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-[15px] font-bold tracking-tight text-blue-600 uppercase">
            ServiceFlow.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/team/auth" className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">
              Team Login
            </Link>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4 rounded-md shadow-sm transition-all" asChild>
              <Link to="/customer/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-slate-50/50 border-b border-slate-100">
          <div className="container mx-auto px-6 py-12 lg:py-16">
            <div className="max-w-xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4 leading-[1.1]">
                Booking systems <br />
                <span className="text-blue-600 font-bold">simplified for everyone.</span>
              </h1>
              <p className="text-[15px] text-slate-500 leading-relaxed font-normal max-w-md">
                A streamlined platform for professional service providers and their clients. 
                Manage schedules, track history, and grow your business.
              </p>
            </div>
          </div>
        </section>

        {/* Portal Grid */}
        <section className="container mx-auto px-6 py-10">
          <div className="grid gap-5 md:grid-cols-3">
            
            {/* Customer Portal */}
            <div className="group flex flex-col p-6 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors duration-300">
                <Users className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-bold mb-2 text-slate-900">Customer Portal</h3>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                Personalized dashboard to book new services and manage your upcoming schedule.
              </p>
              <div className="mt-auto">
                <Link to="/customer/auth" className="inline-flex items-center gap-2 text-[13px] font-bold text-blue-600 hover:gap-3 transition-all">
                  Access Portal <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Team Portal */}
            <div className="group flex flex-col p-6 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors duration-300">
                <Briefcase className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-bold mb-2 text-slate-900">Team Portal</h3>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                Internal tool for team members to coordinate bookings and client communication.
              </p>
              <div className="mt-auto">
                <Link to="/team/auth" className="inline-flex items-center gap-2 text-[13px] font-bold text-blue-600 hover:gap-3 transition-all">
                  Staff Login <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Admin Portal */}
            <div className="group flex flex-col p-6 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-600 transition-colors duration-300">
                <Shield className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-bold mb-2 text-slate-900">Admin Portal</h3>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                Control center for system configuration, user permissions, and analytics.
              </p>
              <div className="mt-auto">
                <Link to="/admin/login" className="inline-flex items-center gap-2 text-[13px] font-bold text-blue-600 hover:gap-3 transition-all">
                  Admin Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Blue Footer */}
      <footer className="bg-blue-600 text-white py-10 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[13px] font-semibold tracking-wide">
              SERVICEFLOW.
            </div>
            
            <div className="flex gap-8 text-[12px] font-medium text-blue-100">
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>

            <div className="text-[12px] text-blue-200 font-medium">
              © 2026 All rights reserved.
            </div>
          </div>
          
          {/* Watermark in Blue Footer */}
          <div className="mt-12 pt-8 border-t border-blue-500/50 flex justify-center">
            <span className="text-[10px] tracking-[0.4em] uppercase text-blue-400 font-black select-none">
             powered by redlix systems
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
