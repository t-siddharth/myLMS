import { NextRequest, NextResponse } from "next/server";
import { verifyLtiToken } from "@/lib/lti/jwt";
import { getToolUrls } from "@/lib/lti/config";
import { db, initializeDatabase } from "@/lib/db";
import { learnerProfiles, ltiSessions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const idToken = formData.get("id_token") as string;
  const state = formData.get("state") as string;

  if (!idToken || !state) {
    return NextResponse.json(
      { error: "Missing id_token or state" },
      { status: 400 }
    );
  }

  const storedState = request.cookies.get("lti_state")?.value;
  const storedNonce = request.cookies.get("lti_nonce")?.value;

  if (!storedState || state !== storedState) {
    return NextResponse.json(
      { error: "State mismatch — possible CSRF attack" },
      { status: 403 }
    );
  }

  let claims;
  try {
    claims = await verifyLtiToken(idToken);
  } catch (error) {
    return NextResponse.json(
      { error: `Token verification failed: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 401 }
    );
  }

  if (storedNonce && claims.nonce !== storedNonce) {
    return NextResponse.json(
      { error: "Nonce mismatch" },
      { status: 403 }
    );
  }

  initializeDatabase();

  const platformId = "default";
  const ltiUserId = claims.sub;
  const now = new Date().toISOString();

  let learner = await db.query.learnerProfiles.findFirst({
    where: and(
      eq(learnerProfiles.platformId, platformId),
      eq(learnerProfiles.ltiUserId, ltiUserId)
    ),
  });

  if (!learner) {
    const learnerId = uuidv4();
    await db.insert(learnerProfiles).values({
      id: learnerId,
      platformId,
      ltiUserId,
      name: claims.name || "Unknown Learner",
      email: claims.email || "",
      createdAt: now,
      updatedAt: now,
    });
    learner = await db.query.learnerProfiles.findFirst({
      where: eq(learnerProfiles.id, learnerId),
    });
  }

  const context = claims["https://purl.imsglobal.org/spec/lti/claim/context"];
  const nrps = claims["https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"];
  const ags = claims["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"];

  const sessionId = uuidv4();
  await db.insert(ltiSessions).values({
    id: sessionId,
    learnerId: learner!.id,
    platformId,
    nonce: claims.nonce,
    state,
    contextId: context?.id,
    contextTitle: context?.title,
    nrpsUrl: nrps?.context_memberships_url,
    agsEndpoint: ags?.lineitems,
    createdAt: now,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  const toolUrls = getToolUrls();
  const redirectUrl = learner!.onboardingCompleted
    ? toolUrls.dashboardUrl
    : toolUrls.onboardingUrl;

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("lti_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 86400,
    path: "/",
  });

  response.cookies.delete("lti_state");
  response.cookies.delete("lti_nonce");

  return response;
}
