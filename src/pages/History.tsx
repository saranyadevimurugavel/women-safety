import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import type { Tables } from "@/integrations/supabase/types";

const History = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Tables<"sos_alerts">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("sos_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("triggered_at", { ascending: false })
      .then(({ data }) => {
        setAlerts(data || []);
        setLoading(false);
      });
  }, [user]);

  return (
    <AppLayout>
      <header className="pt-8 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Alert History</h1>
        <p className="text-sm text-muted-foreground mt-1">Your previous SOS alerts</p>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No alerts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border bg-card p-4 flex items-start gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">SOS Alert Triggered</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(alert.triggered_at).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default History;
