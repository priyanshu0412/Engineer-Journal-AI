import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";

/**
 * Google Gemini provider for DevTrack AI.
 *
 * Mirrors the contract of the Claude `extract()` helper but uses Gemini's free
 * tier (https://aistudio.google.com/apikey). Instead of forced tool-calling we
 * use JSON mode (`responseMimeType: "application/json"`) plus a generated shape
 * hint, then validate the result with the SAME Zod schemas Claude uses — so the
 * rest of the app is provider-agnostic.
 */

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let _client: GoogleGenAI | null = null;
function client(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set. Add it to .env.local.");
  }
  _client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return _client;
}

interface JsonSchemaLike {
  properties: Record<string, { description?: string }>;
  required?: string[];
}

/** Turn our JSON-Schema (reused from claude.ts) into a compact instruction. */
function shapeHint(inputSchema: JsonSchemaLike): string {
  const lines = Object.entries(inputSchema.properties).map(
    ([key, def]) => `  "${key}": ${def.description ?? ""}`,
  );
  return [
    "Respond with ONLY a single JSON object — no markdown, no code fences, no extra keys.",
    "It must contain exactly these keys:",
    "{",
    lines.join("\n"),
    "}",
    'Each "…s" field is an array of short strings; use [] when there is nothing.',
  ].join("\n");
}

/** Parse JSON, tolerating a stray ```json code fence. */
function parseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/^\s*```(?:json)?/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

/**
 * Run a Gemini JSON-mode extraction and validate against a Zod schema.
 * Returns the validated object, or `null` if nothing usable came back.
 */
export async function geminiExtract<S extends z.ZodTypeAny>(opts: {
  system: string;
  userContent: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputSchema: any;
  schema: S;
  maxTokens?: number;
}): Promise<z.infer<S> | null> {
  const response = await client().models.generateContent({
    model: MODEL,
    contents: opts.userContent,
    config: {
      systemInstruction: `${opts.system}\n\n${shapeHint(opts.inputSchema)}`,
      responseMimeType: "application/json",
      maxOutputTokens: opts.maxTokens ?? 4096,
      temperature: 0.4,
    },
  });

  const text = response.text;
  if (!text) return null;
  const json = parseJson(text);
  if (json == null) return null;
  const parsed = opts.schema.safeParse(json);
  return parsed.success ? parsed.data : null;
}
