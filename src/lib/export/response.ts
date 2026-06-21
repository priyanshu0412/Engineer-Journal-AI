import { NextResponse } from "next/server";

/** Build a download response for a generated file (Buffer or string body). */
export function fileResponse(
  body: Buffer | string,
  filename: string,
  contentType: string,
): NextResponse {
  const data = typeof body === "string" ? Buffer.from(body, "utf-8") : body;
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(data.length),
      "Cache-Control": "no-store",
    },
  });
}
