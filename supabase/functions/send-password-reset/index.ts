import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
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

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();
    safeLog("Password reset requested");

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    const user = userData?.users.find((u) => u.email === email);

    if (!user) {
      // Don't reveal if user exists or not (security)
      safeLog("User not found, but sending success response");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Check rate limiting (max 3 attempts in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentCodes } = await supabase
      .from("password_reset_codes")
      .select("id")
      .eq("user_email", email)
      .gte("created_at", oneHourAgo.toISOString());

    if (recentCodes && recentCodes.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Muitas tentativas. Tente novamente em 1 hora." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save code to database
    const { error: insertError } = await supabase
      .from("password_reset_codes")
      .insert({
        user_email: email,
        code,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      safeError("Error inserting reset code:", insertError);
      throw insertError;
    }

    // Send email with code
    const { error: emailError } = await resend.emails.send({
      from: "DreamUp <onboarding@resend.dev>",
      to: [email],
      subject: "Código de Recuperação de Senha - DreamUp",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8B5CF6;">DreamUp</h1>
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a recuperação da sua senha. Use o código abaixo:</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 48px; letter-spacing: 8px; margin: 0; color: #8B5CF6;">${code}</h1>
          </div>
          <p>Este código é válido por 15 minutos.</p>
          <p style="color: #6B7280; font-size: 14px;">Se você não solicitou esta recuperação, ignore este email.</p>
        </div>
      `,
    });

    if (emailError) {
      safeError("Error sending email:", emailError);
      throw emailError;
    }

    safeLog("Password reset email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    safeError("Error in send-password-reset:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao enviar código de recuperação" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);