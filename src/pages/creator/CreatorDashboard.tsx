import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import CreatorOnboarding from "@/components/creator/CreatorOnboarding";
import CreatorMainDashboard from "@/components/creator/CreatorMainDashboard";

const CreatorDashboard = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || userRole !== "team")) {
      navigate("/creator/auth");
    }
  }, [user, userRole, isLoading, navigate]);

  useEffect(() => {
    if (user && userRole === "team") {
      fetchCreatorProfile();
    }
  }, [user, userRole]);

  const fetchCreatorProfile = async () => {
    setIsLoadingProfile(true);
    
    const { data, error } = await supabase
      .from("creator_profiles")
      .select("*")
      .eq("user_id", user?.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching creator profile:", error);
    }
    
    setCreatorProfile(data);
    setIsLoadingProfile(false);
  };

  const handleOnboardingComplete = () => {
    fetchCreatorProfile();
  };

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // Show onboarding if profile doesn't exist or onboarding not completed
  if (!creatorProfile || !creatorProfile.onboarding_completed) {
    return (
      <CreatorOnboarding 
        creatorProfile={creatorProfile}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return <CreatorMainDashboard creatorProfile={creatorProfile} />;
};

export default CreatorDashboard;