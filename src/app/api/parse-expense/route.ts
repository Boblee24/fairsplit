// app/api/parse-expense/route.ts
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expense parser for FairSplit, a group expense splitting app.
Extract expense details from natural language input and return ONLY a valid JSON object.

Rules:
- "amount" must be a positive number (no currency symbols)
- "payerHint" is the name or nickname of whoever paid (could be "me", "I", a name, etc.)
- "splitType" is "equal" if split evenly, "custom" if specific amounts are mentioned
- "description" is a short label for the expense (e.g. "Dinner", "Uber ride", "Groceries")
- "memberCount" is how many people are splitting (if mentioned), otherwise null
- "notes" captures any extra context

Return ONLY this JSON structure, no markdown, no explanation:
{
  "description": string,
  "amount": number,
  "payerHint": string | null,
  "splitType": "equal" | "custom",
  "memberCount": number | null,
  "notes": string | null,
  "confidence": "high" | "medium" | "low"
}

Examples:
Input: "Sarah paid $120 for dinner, split between 4 of us"
Output: {"description":"Dinner","amount":120,"payerHint":"Sarah","splitType":"equal","memberCount":4,"notes":null,"confidence":"high"}

Input: "I covered the Uber, was $35 total"
Output: {"description":"Uber","amount":35,"payerHint":"me","splitType":"equal","memberCount":null,"notes":null,"confidence":"medium"}

Input: "John paid 50 dollars for groceries for the 3 of us but Mike only owes $10"
Output: {"description":"Groceries","amount":50,"payerHint":"John","splitType":"custom","memberCount":3,"notes":"Mike owes $10","confidence":"high"}`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return NextResponse.json(
        { error: "Please provide a description of the expense." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI parser is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        max_tokens: 256,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Input: "${text.trim()}"` },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json(
        { error: "AI parser request failed. Try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content?.trim() ?? "";

    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Couldn't understand that. Try rephrasing." },
        { status: 422 }
      );
    }

    if (!parsed.amount || isNaN(Number(parsed.amount)) || parsed.amount <= 0) {
      return NextResponse.json(
        { error: "Couldn't find a valid amount. Please include the cost." },
        { status: 422 }
      );
    }

    return NextResponse.json({ result: parsed });
  } catch (err) {
    console.error("Parse expense error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}