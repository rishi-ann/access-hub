import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Video, Loader2 } from "lucide-react";

interface Step3PortfolioProps {
  creatorId: string;
  onNext: () => void;
}

interface PortfolioItem {
  id: string;
  file_url: string;
  file_type: string;
  title: string | null;
}

const Step3Portfolio = ({ creatorId }: Step3PortfolioProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (creatorId) {
      fetchPortfolio();
    }
  }, [creatorId]);

  const fetchPortfolio = async () => {
    const { data } = await supabase
      .from("creator_portfolio")
      .select("id, file_url, file_type, title")
      .eq("creator_id", creatorId)
      .order("display_order");

    if (data) {
      setPortfolio(data);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (portfolio.length + files.length > 10) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: "You can upload maximum 10 items.",
      });
      return;
    }

    setIsUploading(true);

    for (const file of Array.from(files)) {
      const fileType = file.type.startsWith("video/") ? "video" : "image";
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("creator-portfolio")
        .upload(fileName, file);

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: `Could not upload ${file.name}`,
        });
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("creator-portfolio")
        .getPublicUrl(fileName);

      // Save to database
      await supabase.from("creator_portfolio").insert({
        creator_id: creatorId,
        file_url: urlData.publicUrl,
        file_type: fileType,
        display_order: portfolio.length,
      });
    }

    await fetchPortfolio();
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (item: PortfolioItem) => {
    // Delete from storage
    const path = item.file_url.split("/creator-portfolio/")[1];
    if (path) {
      await supabase.storage.from("creator-portfolio").remove([path]);
    }

    // Delete from database
    await supabase.from("creator_portfolio").delete().eq("id", item.id);
    
    await fetchPortfolio();
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600">
        Upload 6-10 of your best photos or videos to showcase your work. This will help brands understand your creative style.
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
            <p className="text-sm text-slate-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Click to upload</p>
              <p className="text-sm text-slate-500">Images or videos (max 10 files)</p>
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Grid */}
      {portfolio.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group"
            >
              {item.file_type === "video" ? (
                <video
                  src={item.file_url}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={item.file_url}
                  alt={item.title || "Portfolio item"}
                  className="h-full w-full object-cover"
                />
              )}
              
              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <div className="bg-black/60 text-white p-1.5 rounded-md">
                  {item.file_type === "video" ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Portfolio Progress</span>
          <span className="text-sm text-slate-500">{portfolio.length}/10 items</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 transition-all"
            style={{ width: `${Math.min(100, (portfolio.length / 6) * 100)}%` }}
          />
        </div>
        {portfolio.length < 6 && (
          <p className="text-xs text-slate-500 mt-2">
            Upload at least {6 - portfolio.length} more item(s) to meet the minimum requirement
          </p>
        )}
      </div>
    </div>
  );
};

export default Step3Portfolio;