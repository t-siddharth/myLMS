import { NextResponse } from "next/server";
import { getCurrentLearner } from "@/lib/lti/session";
import { db, initializeDatabase } from "@/lib/db";
import { courses, recommendations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateRecommendations } from "@/lib/ai/recommender";
import { embedCourse } from "@/lib/ai/embeddings";
import { SEED_COURSES } from "@/lib/db/seed";
import type { Course, LearnerProfile } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  initializeDatabase();

  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const existing = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.learnerId, learner.id))
    .orderBy(recommendations.rank);

  if (existing.length > 0) {
    const allCourses = await db.select().from(courses);
    const courseMap = new Map(allCourses.map((c) => [c.id, c]));

    return NextResponse.json({
      recommendations: existing.map((r) => ({
        ...r,
        course: courseMap.get(r.courseId),
      })),
    });
  }

  return NextResponse.json({ recommendations: [] });
}

export async function POST() {
  initializeDatabase();

  const learner = await getCurrentLearner();
  if (!learner) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await ensureCoursesSeeded();

  const allCourseRows = await db.select().from(courses);
  const allCourses: Course[] = allCourseRows.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    topics: JSON.parse(c.topics),
    skills: JSON.parse(c.skills),
    difficultyLevel: c.difficultyLevel as Course["difficultyLevel"],
    bloomLevel: c.bloomLevel as Course["bloomLevel"],
    prerequisites: JSON.parse(c.prerequisites),
    durationMinutes: c.durationMinutes,
    format: c.format as Course["format"],
    learningOutcomes: JSON.parse(c.learningOutcomes),
    embeddingVector: c.embeddingVector ? JSON.parse(c.embeddingVector) : undefined,
  }));

  const profile: LearnerProfile = {
    id: learner.id,
    platformId: learner.platformId,
    ltiUserId: learner.ltiUserId,
    name: learner.name,
    email: learner.email,
    goals: JSON.parse(learner.goals),
    priorKnowledge: JSON.parse(learner.priorKnowledge),
    learningStyle: learner.learningStyle as LearnerProfile["learningStyle"],
    weeklyHoursAvailable: learner.weeklyHoursAvailable,
    sessionLengthPreference: learner.sessionLengthPreference,
    completedCourseIds: JSON.parse(learner.completedCourseIds),
    skillMastery: JSON.parse(learner.skillMastery),
    engagementMetrics: JSON.parse(learner.engagementMetrics),
    onboardingCompleted: learner.onboardingCompleted,
    createdAt: learner.createdAt,
    updatedAt: learner.updatedAt,
  };

  const result = await generateRecommendations(profile, allCourses);

  await db.delete(recommendations).where(eq(recommendations.learnerId, learner.id));

  const now = new Date().toISOString();
  for (const rec of result.recommendations) {
    await db.insert(recommendations).values({
      id: uuidv4(),
      learnerId: learner.id,
      courseId: rec.courseId,
      rank: rec.rank,
      reasoning: rec.reasoning,
      zpd: rec.zpd,
      cognitiveLoadLevel: rec.cognitiveLoadLevel,
      generatedAt: now,
    });
  }

  const courseMap = new Map(allCourses.map((c) => [c.id, c]));

  return NextResponse.json({
    recommendations: result.recommendations.map((r) => ({
      ...r,
      course: courseMap.get(r.courseId),
    })),
    pathSummary: result.pathSummary,
    neuroCognitiveNotes: result.neuroCognitiveNotes,
  });
}

async function ensureCoursesSeeded() {
  const count = await db.select().from(courses);
  if (count.length > 0) return;

  for (const course of SEED_COURSES) {
    const embedding = embedCourse(course);
    await db.insert(courses).values({
      id: course.id,
      title: course.title,
      description: course.description,
      topics: JSON.stringify(course.topics),
      skills: JSON.stringify(course.skills),
      difficultyLevel: course.difficultyLevel,
      bloomLevel: course.bloomLevel,
      prerequisites: JSON.stringify(course.prerequisites),
      durationMinutes: course.durationMinutes,
      format: course.format,
      learningOutcomes: JSON.stringify(course.learningOutcomes),
      embeddingVector: JSON.stringify(embedding),
    });
  }
}
