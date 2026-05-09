import { NextRequest, NextResponse } from "next/server";
import { getCurrentLearner } from "@/lib/lti/session";
import { db, initializeDatabase } from "@/lib/db";
import { learnerProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  initializeDatabase();

  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const {
    goals = [],
    priorKnowledge = [],
    learningStyle = "mixed",
    weeklyHoursAvailable = 10,
    sessionLengthPreference = 30,
  } = body;

  await db
    .update(learnerProfiles)
    .set({
      goals: JSON.stringify(goals),
      priorKnowledge: JSON.stringify(priorKnowledge),
      learningStyle,
      weeklyHoursAvailable,
      sessionLengthPreference,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(learnerProfiles.id, learner.id));

  return NextResponse.json({ success: true });
}
