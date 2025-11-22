import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanitize sensitive data in logs (masks UUIDs and emails)
const sanitizeForLog = (data: any): any => {
  if (typeof data === 'string') {
    return data
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID-****')
      .replace(/[\w.-]+@[\w.-]+\.\w+/gi, 'email-****');
  }
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = Array.isArray(data) ? [] : {};
    for (const key in data) {
      if (key.toLowerCase().includes('id') || key.toLowerCase().includes('email')) {
        sanitized[key] = '****';
      } else {
        sanitized[key] = sanitizeForLog(data[key]);
      }
    }
    return sanitized;
  }
  return data;
};

const safeLog = (...args: any[]) => {
  console.log(...args.map(sanitizeForLog));
};

const safeError = (...args: any[]) => {
  console.error(...args.map(sanitizeForLog));
};

interface VerifyResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, newPassword }: VerifyResetRequest = await req.json();
    safeLog("Verifying reset code");

    if (!email || !code || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Email, código e nova senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "A senha deve ter no mínimo 6 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find valid code
    const { data: resetCode, error: codeError } = await supabase
      .from("password_reset_codes")
      .select("*")
      .eq("user_email", email)
      .eq("code", code)
      .eq("used", false)
      .single();

    if (codeError || !resetCode) {
      safeLog("Invalid or expired code");
      return new Response(
        JSON.stringify({ error: "Código inválido ou expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if code is expired
    const expiresAt = new Date(resetCode.expires_at);
    if (expiresAt < new Date()) {
      safeLog("Code expired");
      return new Response(
        JSON.stringify({ error: "Código expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user by email
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users.find((u) => u.email === email);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      safeError("Error updating password:", updateError);
      throw updateError;
    }

    // Mark code as used
    await supabase
      .from("password_reset_codes")
      .update({ used: true })
      .eq("id", resetCode.id);

    safeLog("Password reset successful");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    safeError("Error in verify-reset-code:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao verificar código" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);