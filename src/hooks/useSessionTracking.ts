import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSessionTracking = () => {
  useEffect(() => {
    const trackSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get session info
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get device and browser info
        const userAgent = navigator.userAgent;
        let deviceInfo = "Desktop";
        
        if (/mobile/i.test(userAgent)) {
          deviceInfo = "Mobile";
        } else if (/tablet/i.test(userAgent)) {
          deviceInfo = "Tablet";
        }

        // Hash the access token for tracking (simple hash)
        const sessionTokenHash = btoa(session.access_token.substring(0, 20));

        // Check if session already exists
        const { data: existingSessions } = await supabase
          .from("active_sessions")
          .select("id")
          .eq("user_id", user.id)
          .eq("session_token_hash", sessionTokenHash)
          .eq("revoked", false);

        if (!existingSessions || existingSessions.length === 0) {
          // Create new session record
          await supabase.from("active_sessions").insert({
            user_id: user.id,
            session_token_hash: sessionTokenHash,
            device_info: deviceInfo,
            user_agent: userAgent,
            // IP address would need to be captured server-side
          });
        } else {
          // Update last activity
          await supabase
            .from("active_sessions")
            .update({ last_activity: new Date().toISOString() })
            .eq("id", existingSessions[0].id);
        }
      } catch (error) {
        console.error("Error tracking session:", error);
      }
    };

    trackSession();

    // Update activity every 5 minutes
    const interval = setInterval(trackSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
