import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, Mail, MapPin, Globe, Camera
} from "lucide-react";

interface Step1ProfileProps {
  creatorId: string;
  onNext: () => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const LANGUAGES = [
  "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi",
  "Bengali", "Gujarati", "Punjabi", "Odia", "Urdu"
];

const Step1Profile = ({ creatorId }: Step1ProfileProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bio: "",
    state: "",
    city: "",
    location: "",
    languages: [] as string[],
  });
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null }>({ full_name: "", email: "" });

  useEffect(() => {
    fetchData();
  }, [creatorId]);

  const fetchData = async () => {
    // Fetch base profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", user?.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch creator profile
    if (creatorId) {
      const { data: creatorData } = await supabase
        .from("creator_profiles")
        .select("bio, state, city, location, languages")
        .eq("id", creatorId)
        .maybeSingle();

      if (creatorData) {
        setFormData({
          bio: creatorData.bio || "",
          state: creatorData.state || "",
          city: creatorData.city || "",
          location: creatorData.location || "",
          languages: creatorData.languages || [],
        });
      }
    }
  };

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-save to database
    if (creatorId) {
      supabase
        .from("creator_profiles")
        .update({ [field]: value })
        .eq("id", creatorId)
        .then();
    }
  };

  const toggleLanguage = (lang: string) => {
    const newLanguages = formData.languages.includes(lang)
      ? formData.languages.filter(l => l !== lang)
      : [...formData.languages, lang];
    handleChange("languages", newLanguages);
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Placeholder */}
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
          <Camera className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="font-medium text-slate-900">Profile Picture</p>
          <p className="text-sm text-slate-500">Upload a professional photo</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-slate-400" />
            Full Name
          </Label>
          <Input value={profile.full_name || ""} disabled className="bg-slate-50" />
          <p className="text-xs text-slate-400">From your account profile</p>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-slate-400" />
            Email
          </Label>
          <Input value={profile.email || ""} disabled className="bg-slate-50" />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label className="text-sm">Bio</Label>
        <Textarea
          value={formData.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Tell us about yourself and your creative journey..."
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-slate-400">{formData.bio.length}/500 characters</p>
      </div>

      {/* Location */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-slate-400" />
            State
          </Label>
          <select
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">City</Label>
          <Input
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="Your city"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Specific Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Area or landmark"
          />
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-slate-400" />
          Languages You Speak
        </Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                formData.languages.includes(lang)
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step1Profile;