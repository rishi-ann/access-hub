import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, ArrowRight, Check, Loader2, 
  User, Briefcase, Image, DollarSign, Calendar, CreditCard, Palette
} from "lucide-react";
import Step1Profile from "./onboarding/Step1Profile";
import Step2Specialization from "./onboarding/Step2Specialization";
import Step3Portfolio from "./onboarding/Step3Portfolio";
import Step4Pricing from "./onboarding/Step4Pricing";
import Step5Availability from "./onboarding/Step5Availability";
import Step6Banking from "./onboarding/Step6Banking";

interface CreatorOnboardingProps {
  creatorProfile: any;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: "Profile", icon: User, description: "Complete your profile" },
  { id: 2, title: "Specialization", icon: Briefcase, description: "Select your skills" },
  { id: 3, title: "Portfolio", icon: Image, description: "Showcase your work" },
  { id: 4, title: "Pricing", icon: DollarSign, description: "Set your rates" },
  { id: 5, title: "Availability", icon: Calendar, description: "Set your schedule" },
  { id: 6, title: "Banking", icon: CreditCard, description: "Payment details" },
];

const CreatorOnboarding = ({ creatorProfile, onComplete }: CreatorOnboardingProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(creatorProfile?.onboarding_step || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creatorId, setCreatorId] = useState<string | null>(creatorProfile?.id || null);

  // Create creator profile if it doesn't exist
  useEffect(() => {
    if (!creatorProfile && user) {
      createCreatorProfile();
    }
  }, [creatorProfile, user]);

  const createCreatorProfile = async () => {
    const { data, error } = await supabase
      .from("creator_profiles")
      .insert({ user_id: user?.id })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not initialize your profile.",
      });
    } else {
      setCreatorId(data.id);
    }
  };

  const handleNext = async () => {
    if (currentStep < 6) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Update onboarding step in database
      if (creatorId) {
        await supabase
          .from("creator_profiles")
          .update({ onboarding_step: nextStep })
          .eq("id", creatorId);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    if (creatorId) {
      const { error } = await supabase
        .from("creator_profiles")
        .update({ 
          onboarding_completed: true,
          onboarding_step: 6 
        })
        .eq("id", creatorId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not complete onboarding.",
        });
      } else {
        toast({
          title: "Welcome aboard! 🎉",
          description: "Your creator profile is now complete.",
        });
        onComplete();
      }
    }
    
    setIsSubmitting(false);
  };

  const renderStep = () => {
    const props = { creatorId: creatorId || "", onNext: handleNext };
    
    switch (currentStep) {
      case 1:
        return <Step1Profile {...props} />;
      case 2:
        return <Step2Specialization {...props} />;
      case 3:
        return <Step3Portfolio {...props} />;
      case 4:
        return <Step4Pricing {...props} />;
      case 5:
        return <Step5Availability {...props} />;
      case 6:
        return <Step6Banking {...props} onComplete={handleComplete} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Palette className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Creator Onboarding</h1>
              <p className="text-sm text-slate-500">Step {currentStep} of 6</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => signOut()} className="text-slate-600">
            Exit
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted
                          ? "bg-purple-600 border-purple-600 text-white"
                          : isActive
                          ? "bg-white border-purple-600 text-purple-600"
                          : "bg-white border-slate-200 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium hidden sm:block ${
                      isActive ? "text-purple-600" : "text-slate-500"
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? "bg-purple-600" : "bg-slate-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="flex items-center gap-3">
              {(() => {
                const StepIcon = STEPS[currentStep - 1].icon;
                return <StepIcon className="h-5 w-5 text-purple-600" />;
              })()}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          {currentStep < 6 && (
            <Button
              onClick={handleNext}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              Save & Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorOnboarding;