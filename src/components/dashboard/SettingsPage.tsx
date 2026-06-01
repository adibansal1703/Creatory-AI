import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMMON_TIMEZONES } from "@/lib/constants/timezones";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, timezone")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name ?? "");
          setTimezone(data.timezone ?? "Asia/Kolkata");
        }
        setLoading(false);
      });
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, timezone, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => toast.success("Settings saved"),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <div className="glass rounded-2xl p-6 border border-border/60 space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled className="glass border-border/60" />
        </div>
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            className="glass border-border/60"
          />
        </div>
        <div className="space-y-2">
          <Label>Default timezone</Label>
          <Select value={timezone} onValueChange={setTimezone} disabled={loading}>
            <SelectTrigger className="glass border-border/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="bg-gradient-brand border-0"
          disabled={saveMutation.isPending || loading}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
