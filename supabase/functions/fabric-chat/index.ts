import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are FabricPrint AI, a professional textile and fabric printing expert assistant. You specialize in:

- Fabric printing methods: DTF (Direct to Film), screen printing, sublimation, DTG (Direct to Garment), heat transfer, embroidery, and more
- Fabric selection: cotton, polyester, blends, performance fabrics, and their suitability for different printing methods
- Color theory for clothing and textiles: complementary colors, seasonal palettes, color matching for different skin tones
- Design ideas for t-shirts, hoodies, hats, tote bags, and other textile products
- Troubleshooting printing problems: bleeding, fading, cracking, poor adhesion, color inconsistency
- Business advice for starting and growing a textile printing business: equipment, pricing, suppliers, marketing
- Trend forecasting in fashion and print design

Your communication style is:
- Friendly, warm, and encouraging — like a knowledgeable friend in the industry
- Professional but never condescending
- Clear and practical — give actionable advice
- Use bullet points and structured responses when listing options or steps
- Include specific product recommendations, temperature settings, or technical specs when relevant
- If asked something outside your expertise, politely redirect to textile/fabric topics

Always aim to be genuinely helpful and provide the kind of expert advice that would save someone time, money, and frustration.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI service error. Please try again." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("fabric-chat error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
