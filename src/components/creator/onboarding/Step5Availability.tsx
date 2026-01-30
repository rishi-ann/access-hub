import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Step5AvailabilityProps {
  creatorId: string;
  onNext: () => void;
}

const DAYS = [
  { id: 0, name: "Sunday", short: "Sun" },
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
  { id: 6, name: "Saturday", short: "Sat" },
];

const TIME_OPTIONS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00"
];

interface DayAvailability {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DEFAULT_AVAILABILITY: Omit<DayAvailability, 'day_of_week'> = {
  start_time: "09:00",
  end_time: "18:00",
  is_available: true,
};

const Step5Availability = ({ creatorId }: Step5AvailabilityProps) => {
  const { toast } = useToast();
  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS.map(d => ({ day_of_week: d.id, ...DEFAULT_AVAILABILITY, is_available: d.id !== 0 && d.id !== 6 }))
  );

  useEffect(() => {
    if (creatorId) {
      fetchAvailability();
    }
  }, [creatorId]);

  const fetchAvailability = async () => {
    const { data } = await supabase
      .from("creator_availability")
      .select("*")
      .eq("creator_id", creatorId);

    if (data && data.length > 0) {
      // Merge fetched data with defaults
      const merged = DAYS.map(d => {
        const existing = data.find(a => a.day_of_week === d.id);
        return existing || { day_of_week: d.id, ...DEFAULT_AVAILABILITY, is_available: d.id !== 0 && d.id !== 6 };
      });
      setAvailability(merged);
    }
  };

  const updateDay = async (dayId: number, field: keyof DayAvailability, value: any) => {
    const updated = availability.map(a =>
      a.day_of_week === dayId ? { ...a, [field]: value } : a
    );
    setAvailability(updated);

    const dayData = updated.find(a => a.day_of_week === dayId);
    if (!dayData) return;

    // Upsert to database
    const { error } = await supabase
      .from("creator_availability")
      .upsert({
        creator_id: creatorId,
        day_of_week: dayId,
        start_time: dayData.start_time,
        end_time: dayData.end_time,
        is_available: dayData.is_available,
      }, { onConflict: 'creator_id,day_of_week' });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save availability.",
      });
    }
  };

  const formatTime = (time: string) => {
    const [hours] = time.split(":");
    const hour = parseInt(hours);
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600">
        Set your working hours for each day of the week. Toggle days on/off to indicate your availability.
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const dayAvail = availability.find(a => a.day_of_week === day.id);
          if (!dayAvail) return null;

          return (
            <div
              key={day.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                dayAvail.is_available
                  ? "bg-white border-purple-200"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              {/* Day Toggle */}
              <div className="w-24 flex items-center gap-3">
                <Switch
                  checked={dayAvail.is_available}
                  onCheckedChange={(checked) => updateDay(day.id, "is_available", checked)}
                />
                <span className={`text-sm font-medium ${
                  dayAvail.is_available ? "text-slate-900" : "text-slate-400"
                }`}>
                  {day.short}
                </span>
              </div>

              {/* Time Selectors */}
              {dayAvail.is_available ? (
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-slate-500">From</Label>
                    <select
                      value={dayAvail.start_time}
                      onChange={(e) => updateDay(day.id, "start_time", e.target.value)}
                      className="h-9 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{formatTime(time)}</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-slate-400">—</span>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-slate-500">To</Label>
                    <select
                      value={dayAvail.end_time}
                      onChange={(e) => updateDay(day.id, "end_time", e.target.value)}
                      className="h-9 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{formatTime(time)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-slate-400 italic">Not available</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-purple-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-purple-900 mb-2">Availability Summary</h4>
        <p className="text-sm text-purple-700">
          You're available {availability.filter(a => a.is_available).length} days per week
        </p>
      </div>
    </div>
  );
};

export default Step5Availability;