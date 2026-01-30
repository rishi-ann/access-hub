import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

interface Step2SpecializationProps {
  creatorId: string;
  onNext: () => void;
}

const SPECIALIZATIONS = [
  { id: "brand_strategy", label: "Brand Strategy", description: "Develop brand identity and positioning" },
  { id: "content_creation", label: "Content Creation", description: "Create engaging content for social media" },
  { id: "reel_direction", label: "Reel Direction", description: "Direct and produce short-form videos" },
  { id: "story_telling", label: "Story Telling", description: "Craft compelling narratives" },
  { id: "creative_direction", label: "Creative Direction", description: "Lead overall creative vision" },
  { id: "photography", label: "Photography", description: "Professional photo shoots" },
  { id: "video_editing", label: "Video Editing", description: "Edit and produce videos" },
  { id: "social_media_management", label: "Social Media Management", description: "Manage social media accounts" },
  { id: "influencer_marketing", label: "Influencer Marketing", description: "Connect brands with influencers" },
  { id: "copywriting", label: "Copywriting", description: "Write persuasive copy and captions" },
];

const SKILL_LEVELS = [
  { id: "beginner", label: "Beginner", color: "bg-green-100 text-green-700 border-green-300" },
  { id: "intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { id: "expert", label: "Expert", color: "bg-purple-100 text-purple-700 border-purple-300" },
];

type SkillLevel = "beginner" | "intermediate" | "expert";

interface SelectedSkill {
  category: string;
  skill_level: SkillLevel;
}

const Step2Specialization = ({ creatorId }: Step2SpecializationProps) => {
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);

  useEffect(() => {
    if (creatorId) {
      fetchSpecializations();
    }
  }, [creatorId]);

  const fetchSpecializations = async () => {
    const { data } = await supabase
      .from("creator_specializations")
      .select("category, skill_level")
      .eq("creator_id", creatorId);

    if (data) {
      setSelectedSkills(data.map(d => ({
        category: d.category,
        skill_level: d.skill_level as SkillLevel
      })));
    }
  };

  const toggleSpecialization = async (specId: string) => {
    const existing = selectedSkills.find(s => s.category === specId);
    
    if (existing) {
      // Remove - use raw SQL approach for dynamic enum value
      await supabase
        .from("creator_specializations")
        .delete()
        .eq("creator_id", creatorId)
        .eq("category", specId as any);
      
      setSelectedSkills(prev => prev.filter(s => s.category !== specId));
    } else {
      // Add with default beginner level
      const { error } = await supabase
        .from("creator_specializations")
        .insert({
          creator_id: creatorId,
          category: specId as any,
          skill_level: "beginner"
        } as any);
      
      if (!error) {
        setSelectedSkills(prev => [...prev, { category: specId, skill_level: "beginner" }]);
      }
    }
  };

  const updateSkillLevel = async (specId: string, level: SkillLevel) => {
    await supabase
      .from("creator_specializations")
      .update({ skill_level: level })
      .eq("creator_id", creatorId)
      .eq("category", specId as any);

    setSelectedSkills(prev => 
      prev.map(s => s.category === specId ? { ...s, skill_level: level } : s)
    );
  };

  const getSkillForSpec = (specId: string) => {
    return selectedSkills.find(s => s.category === specId);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600">
        Select your areas of expertise and set your skill level for each. You can select multiple specializations.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SPECIALIZATIONS.map((spec) => {
          const skill = getSkillForSpec(spec.id);
          const isSelected = !!skill;
          
          return (
            <div
              key={spec.id}
              className={`rounded-lg border-2 p-4 transition-all cursor-pointer ${
                isSelected
                  ? "border-purple-500 bg-purple-50/50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => toggleSpecialization(spec.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{spec.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{spec.description}</p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "bg-purple-600 border-purple-600" : "border-slate-300"
                }`}>
                  {isSelected && (
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Skill Level Selector */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-purple-200" onClick={(e) => e.stopPropagation()}>
                  <Label className="text-xs text-slate-600 mb-2 block">Skill Level</Label>
                  <div className="flex gap-2">
                    {SKILL_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => updateSkillLevel(spec.id, level.id as SkillLevel)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                          skill?.skill_level === level.id
                            ? level.color
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
        <strong>Selected: </strong>
        {selectedSkills.length === 0
          ? "No specializations selected yet"
          : selectedSkills.map(s => {
              const spec = SPECIALIZATIONS.find(sp => sp.id === s.category);
              return spec?.label;
            }).join(", ")
        }
      </div>
    </div>
  );
};

export default Step2Specialization;