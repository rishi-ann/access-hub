import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, Shield, ArrowRight } from "lucide-react";

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
            <Link to="/creator/auth" className="text-xs font-medium text-slate-500 hover:text-purple-600 transition-colors">
              Creator Login
            </Link>
            <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white text-xs h-8 px-4 rounded-md shadow-sm transition-all" asChild>
              <Link to="/influencer/auth">Get Started</Link>
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
                Connect with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 font-bold">creative talent.</span>
              </h1>
              <p className="text-[15px] text-slate-500 leading-relaxed font-normal max-w-md">
                A platform connecting influencers with talented creators. 
                Book professionals for brand strategy, content creation, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Portal Grid */}
        <section className="container mx-auto px-6 py-10">
          <div className="grid gap-5 md:grid-cols-3">
            
            {/* Influencer Portal */}
            <div className="group flex flex-col p-6 rounded-xl border border-slate-200 bg-white hover:border-pink-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 group-hover:bg-pink-600 transition-colors duration-300">
                <Sparkles className="h-5 w-5 text-pink-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-bold mb-2 text-slate-900">Influencer Portal</h3>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                Discover and book talented creators for your brand campaigns and content needs.
              </p>
              <div className="mt-auto">
                <Link to="/influencer/auth" className="inline-flex items-center gap-2 text-[13px] font-bold text-pink-600 hover:gap-3 transition-all">
                  Access Portal <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Creator Portal */}
            <div className="group flex flex-col p-6 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 group-hover:bg-purple-600 transition-colors duration-300">
                <Palette className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-sm font-bold mb-2 text-slate-900">Creator Portal</h3>
              <p className="text-[13px] text-slate-500 mb-6 leading-relaxed">
                Showcase your creative work, set your rates, and get discovered by brands.
              </p>
              <div className="mt-auto">
                <Link to="/creator/auth" className="inline-flex items-center gap-2 text-[13px] font-bold text-purple-600 hover:gap-3 transition-all">
                  Creator Login <ArrowRight className="h-3.5 w-3.5" />
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
                Control center for managing creators, influencers, and platform analytics.
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

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-10 mt-auto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[13px] font-semibold tracking-wide">
              SERVICEFLOW.
            </div>
            
            <div className="flex gap-8 text-[12px] font-medium text-pink-100">
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>

            <div className="text-[12px] text-pink-200 font-medium">
              © 2026 All rights reserved.
            </div>
          </div>
          
          {/* Watermark */}
          <div className="mt-12 pt-8 border-t border-white/20 flex justify-center">
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/60 font-black select-none">
             powered by redlix systems
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;