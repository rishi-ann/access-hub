import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Building, User, Hash, Smartphone, Shield } from "lucide-react";

interface Step6BankingProps {
  creatorId: string;
  onNext: () => void;
  onComplete: () => void;
  isSubmitting: boolean;
}

interface BankingDetails {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
}

const Step6Banking = ({ creatorId, onComplete, isSubmitting }: Step6BankingProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BankingDetails>({
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (creatorId) {
      fetchBanking();
    }
  }, [creatorId]);

  const fetchBanking = async () => {
    const { data } = await supabase
      .from("creator_banking")
      .select("*")
      .eq("creator_id", creatorId)
      .maybeSingle();

    if (data) {
      setFormData({
        account_holder_name: data.account_holder_name || "",
        bank_name: data.bank_name || "",
        account_number: data.account_number || "",
        ifsc_code: data.ifsc_code || "",
        upi_id: data.upi_id || "",
      });
    }
  };

  const handleChange = (field: keyof BankingDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Check if record exists
    const { data: existing } = await supabase
      .from("creator_banking")
      .select("id")
      .eq("creator_id", creatorId)
      .maybeSingle();

    if (existing) {
      // Update
      const { error } = await supabase
        .from("creator_banking")
        .update(formData)
        .eq("creator_id", creatorId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save banking details.",
        });
      } else {
        toast({
          title: "Saved",
          description: "Banking details updated.",
        });
      }
    } else {
      // Insert
      const { error } = await supabase
        .from("creator_banking")
        .insert({
          creator_id: creatorId,
          ...formData,
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save banking details.",
        });
      } else {
        toast({
          title: "Saved",
          description: "Banking details saved.",
        });
      }
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">Your information is secure</p>
          <p className="text-amber-700">
            Banking details are encrypted and only used for payment processing. You can skip this and add later.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-slate-400" />
            Account Holder Name
          </Label>
          <Input
            value={formData.account_holder_name}
            onChange={(e) => handleChange("account_holder_name", e.target.value)}
            placeholder="As per bank records"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-slate-400" />
            Bank Name
          </Label>
          <Input
            value={formData.bank_name}
            onChange={(e) => handleChange("bank_name", e.target.value)}
            placeholder="e.g., State Bank of India"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-slate-400" />
            Account Number
          </Label>
          <Input
            value={formData.account_number}
            onChange={(e) => handleChange("account_number", e.target.value)}
            placeholder="Enter account number"
            type="password"
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-slate-400" />
            IFSC Code
          </Label>
          <Input
            value={formData.ifsc_code}
            onChange={(e) => handleChange("ifsc_code", e.target.value.toUpperCase())}
            placeholder="e.g., SBIN0001234"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-slate-900 mb-4">Alternative Payment Method</h4>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Smartphone className="h-4 w-4 text-slate-400" />
            UPI ID
          </Label>
          <Input
            value={formData.upi_id}
            onChange={(e) => handleChange("upi_id", e.target.value)}
            placeholder="yourname@upi"
          />
          <p className="text-xs text-slate-500">You can add UPI ID as an alternative to bank transfer</p>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button
          onClick={handleSave}
          variant="outline"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Details
        </Button>
        <Button
          onClick={onComplete}
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 flex-1"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Complete Setup & Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Step6Banking;