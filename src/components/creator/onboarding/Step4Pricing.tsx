import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, DollarSign } from "lucide-react";

interface Step4PricingProps {
  creatorId: string;
  onNext: () => void;
}

interface PricingPackage {
  id?: string;
  package_name: string;
  hours_range: string;
  price: number;
  description: string;
  includes: string[];
}

const DEFAULT_PACKAGE: PricingPackage = {
  package_name: "",
  hours_range: "",
  price: 0,
  description: "",
  includes: [],
};

const Step4Pricing = ({ creatorId }: Step4PricingProps) => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [newInclude, setNewInclude] = useState<Record<number, string>>({});

  useEffect(() => {
    if (creatorId) {
      fetchPricing();
    }
  }, [creatorId]);

  const fetchPricing = async () => {
    const { data } = await supabase
      .from("creator_pricing")
      .select("*")
      .eq("creator_id", creatorId)
      .order("price");

    if (data && data.length > 0) {
      setPackages(data);
    } else {
      // Start with one empty package
      setPackages([{ ...DEFAULT_PACKAGE }]);
    }
  };

  const addPackage = () => {
    setPackages([...packages, { ...DEFAULT_PACKAGE }]);
  };

  const removePackage = async (index: number) => {
    const pkg = packages[index];
    if (pkg.id) {
      await supabase.from("creator_pricing").delete().eq("id", pkg.id);
    }
    setPackages(packages.filter((_, i) => i !== index));
  };

  const updatePackage = (index: number, field: keyof PricingPackage, value: any) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };

  const addInclude = (index: number) => {
    const text = newInclude[index]?.trim();
    if (text) {
      const updated = [...packages];
      updated[index].includes = [...updated[index].includes, text];
      setPackages(updated);
      setNewInclude({ ...newInclude, [index]: "" });
    }
  };

  const removeInclude = (pkgIndex: number, includeIndex: number) => {
    const updated = [...packages];
    updated[pkgIndex].includes = updated[pkgIndex].includes.filter((_, i) => i !== includeIndex);
    setPackages(updated);
  };

  const savePackage = async (index: number) => {
    const pkg = packages[index];
    
    if (!pkg.package_name || !pkg.hours_range || pkg.price <= 0) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in package name, hours, and price.",
      });
      return;
    }

    if (pkg.id) {
      // Update
      await supabase
        .from("creator_pricing")
        .update({
          package_name: pkg.package_name,
          hours_range: pkg.hours_range,
          price: pkg.price,
          description: pkg.description,
          includes: pkg.includes,
        })
        .eq("id", pkg.id);
    } else {
      // Insert
      const { data } = await supabase
        .from("creator_pricing")
        .insert({
          creator_id: creatorId,
          package_name: pkg.package_name,
          hours_range: pkg.hours_range,
          price: pkg.price,
          description: pkg.description,
          includes: pkg.includes,
        })
        .select()
        .single();

      if (data) {
        const updated = [...packages];
        updated[index] = data;
        setPackages(updated);
      }
    }

    toast({
      title: "Package saved",
      description: "Your pricing package has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600">
        Create pricing packages for your services. You can create multiple packages with different durations and rates.
      </div>

      {packages.map((pkg, index) => (
        <div key={index} className="border rounded-lg p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900">Package {index + 1}</h4>
            {packages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePackage(index)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm">Package Name</Label>
              <Input
                value={pkg.package_name}
                onChange={(e) => updatePackage(index, "package_name", e.target.value)}
                placeholder="e.g., Basic Package"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Duration / Hours</Label>
              <Input
                value={pkg.hours_range}
                onChange={(e) => updatePackage(index, "hours_range", e.target.value)}
                placeholder="e.g., 2-3 hours"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-slate-400" />
                Price (₹)
              </Label>
              <Input
                type="number"
                value={pkg.price || ""}
                onChange={(e) => updatePackage(index, "price", Number(e.target.value))}
                placeholder="1200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Description</Label>
            <Textarea
              value={pkg.description}
              onChange={(e) => updatePackage(index, "description", e.target.value)}
              placeholder="Describe what's included in this package..."
              rows={2}
            />
          </div>

          {/* Includes */}
          <div className="space-y-3">
            <Label className="text-sm">What's Included</Label>
            <div className="flex flex-wrap gap-2">
              {pkg.includes.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {item}
                  <button
                    onClick={() => removeInclude(index, i)}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newInclude[index] || ""}
                onChange={(e) => setNewInclude({ ...newInclude, [index]: e.target.value })}
                placeholder="e.g., Concept development"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInclude(index))}
              />
              <Button type="button" variant="outline" onClick={() => addInclude(index)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button onClick={() => savePackage(index)} className="bg-purple-600 hover:bg-purple-700">
            Save Package
          </Button>
        </div>
      ))}

      <Button variant="outline" onClick={addPackage} className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Add Another Package
      </Button>
    </div>
  );
};

export default Step4Pricing;