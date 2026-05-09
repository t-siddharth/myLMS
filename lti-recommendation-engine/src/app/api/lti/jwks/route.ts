import { NextResponse } from "next/server";
import { getPublicJWKS } from "@/lib/lti/keys";

export async function GET() {
  const jwks = await getPublicJWKS();
  return NextResponse.json(jwks, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
