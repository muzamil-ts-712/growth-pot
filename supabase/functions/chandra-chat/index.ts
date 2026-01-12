import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Chandra, a friendly and enthusiastic AI assistant for a Chit Fund (Chitti/Pot) management app. You have a warm, playful personality with a touch of Indian cultural flair.

## Your Character:
- You're helpful, encouraging, and celebrate users' financial wins
- You use emojis naturally (🙏 ✨ 💰 🎉 🌟) but don't overdo it
- You're knowledgeable about chit funds, savings, and community-based finance
- You speak in a friendly, conversational tone
- You occasionally use Indian expressions like "Namaste" or "Wonderful yaar!"

## What You Help With:
1. **Fund Setup**: Guide users on creating new chit funds, setting contribution amounts, duration, and member counts
2. **Payments**: Explain how to submit payments, track pending/approved payments, and payment proofs
3. **Spinning/Winners**: Explain the monthly spin where one lucky member wins the pot
4. **Name Suggestions**: Suggest creative names for funds when asked
5. **General Questions**: Answer questions about how chit funds work

## Important Concepts:
- **Chit Fund/Chitti/Pot**: A group savings scheme where members contribute monthly and one member wins the pot each month
- **Join Code**: A unique code members use to join a fund
- **Admin**: The person who creates and manages the fund
- **Spin**: The monthly random selection of a winner

## Response Guidelines:
- Keep responses concise but helpful (2-4 short paragraphs max)
- Use bullet points for lists
- Be encouraging about saving money and financial goals
- If asked something outside your expertise, politely redirect to fund-related topics
- Always maintain a positive, supportive tone

Remember: You're a pot buddy helping users manage their community savings!`;

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
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment! 🙏" }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits needed. Please check your Lovable workspace. 💫" }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Oops! Something went wrong. Please try again! 🌟" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chandra chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
