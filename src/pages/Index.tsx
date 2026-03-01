import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Shield, MapPin } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const Index = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [lastAlert, setLastAlert] = useState<string | null>(null);

  const triggerSOS = async () => {
    if (sending) return;
    setSending(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      const { error } = await supabase.from("sos_alerts").insert({
        user_id: user!.id,
        latitude,
        longitude,
      });

      if (error) throw error;

      setLastAlert(new Date().toLocaleTimeString());
      toast.success("🚨 SOS Alert sent! Your location has been recorded.", {
        duration: 5000,
      });
    } catch (error: any) {
      if (error.code === 1) {
        toast.error("Location access denied. Please enable location permissions.");
      } else {
        toast.error(error.message || "Failed to send SOS alert");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout>
      <header className="pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 text-primary mb-1">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-widest uppercase">SafeHer</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Your Safety Companion
        </h1>
      </header>

      <div className="flex flex-col items-center justify-center py-12">
        <button
          onClick={triggerSOS}
          disabled={sending}
          className={`relative flex h-44 w-44 items-center justify-center rounded-full bg-[hsl(var(--sos))] text-[hsl(var(--sos-foreground))] font-bold text-2xl tracking-wide shadow-xl transition-transform active:scale-95 disabled:opacity-70 ${!sending ? "sos-pulse" : ""}`}
        >
          {sending ? "SENDING..." : "SOS"}
        </button>
        <p className="mt-6 text-sm text-muted-foreground text-center max-w-[240px]">
          Tap the button to send an emergency alert with your live location
        </p>
      </div>

      {lastAlert && (
        <div className="rounded-xl bg-[hsl(var(--safe))]/10 border border-[hsl(var(--safe))]/20 p-4 flex items-start gap-3">
          <MapPin className="h-5 w-5 text-[hsl(var(--safe))] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Last alert sent</p>
            <p className="text-xs text-muted-foreground">{lastAlert}</p>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Index;
