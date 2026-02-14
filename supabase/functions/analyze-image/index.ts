import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a road damage classification AI expert. Analyze the provided image and determine:
1. Whether the image shows road damage (is_road_damage: true/false)
2. The type of damage: one of "Pothole", "Cracks", "Waterlogging", "Broken Surface", "Severe Structural Damage", or "Unknown"
3. A confidence score from 0.0 to 1.0
4. A brief description of the damage
5. Whether it's urgent (confidence > 0.85 or severe structural damage)

If the image does NOT show a road or road damage, set is_road_damage to false.

You MUST respond using the suggest_classification tool.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image for road damage. Classify the type and severity.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_classification",
              description: "Return the road damage classification result",
              parameters: {
                type: "object",
                properties: {
                  is_road_damage: {
                    type: "boolean",
                    description: "Whether the image shows road damage",
                  },
                  damage_type: {
                    type: "string",
                    enum: [
                      "Pothole",
                      "Cracks",
                      "Waterlogging",
                      "Broken Surface",
                      "Severe Structural Damage",
                      "Unknown",
                    ],
                  },
                  confidence_score: {
                    type: "number",
                    description: "Confidence from 0.0 to 1.0",
                  },
                  description: {
                    type: "string",
                    description: "Brief description of damage found",
                  },
                  is_urgent: {
                    type: "boolean",
                    description: "Whether the damage is urgent",
                  },
                },
                required: [
                  "is_road_damage",
                  "damage_type",
                  "confidence_score",
                  "description",
                  "is_urgent",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "suggest_classification" },
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No classification result from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-image error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
        is_road_damage: false,
        damage_type: "Unknown",
        confidence_score: 0,
        description: "Failed to analyze image. Please try again.",
        is_urgent: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
