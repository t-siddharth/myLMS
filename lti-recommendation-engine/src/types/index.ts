export interface LearnerProfile {
  id: string;
  platformId: string;
  ltiUserId: string;
  name: string;
  email: string;
  goals: string[];
  priorKnowledge: string[];
  learningStyle: "visual" | "reading" | "hands-on" | "mixed";
  weeklyHoursAvailable: number;
  sessionLengthPreference: number;
  completedCourseIds: string[];
  skillMastery: Record<string, number>;
  engagementMetrics: {
    avgSessionLength: number;
    loginFrequency: number;
    quizScoreTrend: number[];
  };
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  topics: string[];
  skills: string[];
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  bloomLevel:
    | "remember"
    | "understand"
    | "apply"
    | "analyze"
    | "evaluate"
    | "create";
  prerequisites: string[];
  durationMinutes: number;
  format: "video" | "text" | "interactive" | "project";
  learningOutcomes: string[];
  embeddingVector?: number[];
}

export interface CourseCompletion {
  courseId: string;
  completedAt: string;
  score: number;
  timeSpentMinutes: number;
}

export interface Recommendation {
  courseId: string;
  rank: number;
  reasoning: string;
  zpd: string;
  cognitiveLoadLevel: "low" | "medium" | "high";
  estimatedMasteryGain: Record<string, number>;
}

export interface LearningPath {
  learnerId: string;
  recommendations: Recommendation[];
  generatedAt: string;
  nextReviewDates: Record<string, string>;
}

export interface PlatformConfig {
  id: string;
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  jwksUrl: string;
  clientId: string;
  deploymentId: string;
}

export interface LtiLaunchClaims {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  nonce: string;
  name?: string;
  email?: string;
  "https://purl.imsglobal.org/spec/lti/claim/message_type": string;
  "https://purl.imsglobal.org/spec/lti/claim/version": string;
  "https://purl.imsglobal.org/spec/lti/claim/deployment_id": string;
  "https://purl.imsglobal.org/spec/lti/claim/roles": string[];
  "https://purl.imsglobal.org/spec/lti/claim/context"?: {
    id: string;
    label?: string;
    title?: string;
    type?: string[];
  };
  "https://purl.imsglobal.org/spec/lti/claim/resource_link"?: {
    id: string;
    title?: string;
    description?: string;
  };
  "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"?: {
    context_memberships_url: string;
    service_versions: string[];
  };
  "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"?: {
    scope: string[];
    lineitems: string;
    lineitem?: string;
  };
}
