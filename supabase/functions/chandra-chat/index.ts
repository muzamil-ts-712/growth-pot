import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Input validation for messages
function validateMessages(messages: unknown): boolean {
  if (!Array.isArray(messages)) return false;
  if (messages.length === 0 || messages.length > 50) return false;
  
  return messages.every(msg => {
    if (typeof msg !== 'object' || msg === null) return false;
    const { role, content } = msg as { role?: unknown; content?: unknown };
    if (typeof role !== 'string' || !['user', 'assistant'].includes(role)) return false;
    if (typeof content !== 'string' || content.length === 0 || content.length > 4000) return false;
    return true;
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Please log in to chat with Chandra 🔐" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify JWT and get user claims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid session 🔐" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // Parse and validate input
    const body = await req.json();
    const { messages } = body;
    
    if (!validateMessages(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
