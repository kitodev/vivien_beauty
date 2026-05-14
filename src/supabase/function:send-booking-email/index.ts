import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, service, date, time } = await req.json();

    if (!name || !email || !service || !date || !time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const BOOKING_RECIPIENT = Deno.env.get("BOOKING_EMAIL") || email;

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send confirmation to customer
    const customerEmail = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Lumière Beauty <onboarding@resend.dev>",
        to: [email],
        subject: "Booking Confirmation - Lumière Beauty",
        html: `
          <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #faf8f5;">
            <h1 style="font-size: 28px; color: #8B4513; text-align: center; margin-bottom: 30px;">Lumière Beauty</h1>
            <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #e8e0d8;">
              <h2 style="font-size: 22px; color: #333; margin-bottom: 20px;">Booking Confirmed ✨</h2>
              <p style="font-size: 16px; color: #555; line-height: 1.6;">Dear ${name},</p>
              <p style="font-size: 16px; color: #555; line-height: 1.6;">Your appointment has been confirmed with the following details:</p>
              <div style="background: #faf8f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 8px 0; font-size: 15px;"><strong>Service:</strong> ${service}</p>
                <p style="margin: 8px 0; font-size: 15px;"><strong>Date:</strong> ${date}</p>
                <p style="margin: 8px 0; font-size: 15px;"><strong>Time:</strong> ${time}</p>
              </div>
              <p style="font-size: 14px; color: #777; margin-top: 25px;">We look forward to seeing you!</p>
              <p style="font-size: 14px; color: #777;">— The Lumière Beauty Team</p>
            </div>
          </div>
        `,
      }),
    });

    const customerResult = await customerEmail.json();

    // Send notification to business owner
    if (BOOKING_RECIPIENT && BOOKING_RECIPIENT !== email) {
      const notifEmail = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Lumière Bookings <onboarding@resend.dev>",
          to: [BOOKING_RECIPIENT],
          subject: `New Booking: ${name} - ${service}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #8B4513;">New Booking Received</h2>
              <p><strong>Client:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
            </div>
          `,
        }),
      });
      await notifEmail.text();
    }

    return new Response(
      JSON.stringify({ success: true, data: customerResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
