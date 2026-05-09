"use client";

import { useEffect, useState, useCallback } from "react";

interface CourseData {
  id: string;
  title: string;
  description: string;
  topics: string[];
  skills: string[];
  difficultyLevel: string;
  bloomLevel: string;
  durationMinutes: number;
  format: string;
  learningOutcomes: string[];
}

interface RecommendationData {
  courseId: string;
  rank: number;
  reasoning: string;
  zpd: string;
  cognitiveLoadLevel: string;
  course?: CourseData;
}

interface RecommendationResponse {
  recommendations: RecommendationData[];
  pathSummary?: string;
  neuroCognitiveNotes?: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-800",
  intermediate: "bg-amber-100 text-amber-800",
  advanced: "bg-red-100 text-red-800",
};

const FORMAT_ICONS: Record<string, string> = {
  video: "🎬",
  text: "📖",
  interactive: "💻",
  project: "🛠",
};

const LOAD_INDICATORS: Record<string, { color: string; label: string }> = {
  low: { color: "bg-green-400", label: "Light" },
  medium: { color: "bg-yellow-400", label: "Moderate" },
  high: { color: "bg-red-400", label: "Intensive" },
};

const ZPD_LABELS: Record<string, { label: string; color: string }> = {
  below_zpd: { label: "Review", color: "text-blue-600" },
  in_zpd: { label: "Growth Zone", color: "text-emerald-600" },
  above_zpd: { label: "Stretch", color: "text-orange-600" },
};

export default function DashboardPage() {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const generateNew = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/recommendations", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setGenerating(false);
    }
  };

  const hasRecommendations =
    data && data.recommendations && data.recommendations.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-indigo-900">
              NeuroCog LMS
            </h1>
            <p className="text-sm text-gray-500">
              Your Personalized Learning Path
            </p>
          </div>
          <button
            onClick={generateNew}
            disabled={generating}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Analyzing...
              </>
            ) : (
              <>Generate Recommendations</>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : !hasRecommendations ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to build your learning path?
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Click &quot;Generate Recommendations&quot; to get AI-powered
              course suggestions tailored to your goals and learning style.
            </p>
            <button
              onClick={generateNew}
              disabled={generating}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate My Learning Path"}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Path Summary */}
            {data.pathSummary && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Learning Path
                </h2>
                <p className="text-gray-600">{data.pathSummary}</p>
                {data.neuroCognitiveNotes && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-indigo-800">
                      <span className="font-semibold">🧠 Neuro-Cognitive Notes: </span>
                      {data.neuroCognitiveNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cognitive Load Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Cognitive Load Distribution
              </h3>
              <div className="flex gap-1 h-4 rounded-full overflow-hidden">
                {data.recommendations.map((rec, i) => {
                  const load = LOAD_INDICATORS[rec.cognitiveLoadLevel] || LOAD_INDICATORS.medium;
                  return (
                    <div
                      key={i}
                      className={`flex-1 ${load.color} transition-all`}
                      title={`${rec.course?.title}: ${load.label}`}
                    />
                  );
                })}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-green-400" /> Light
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-yellow-400" /> Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-red-400" /> Intensive
                </span>
              </div>
            </div>

            {/* Course Cards */}
            <div className="space-y-4">
              {data.recommendations.map((rec) => {
                const course = rec.course;
                if (!course) return null;
                const zpd = ZPD_LABELS[rec.zpd] || ZPD_LABELS.in_zpd;

                return (
                  <div
                    key={rec.courseId}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                        {rec.rank}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {course.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[course.difficultyLevel] || ""}`}>
                            {course.difficultyLevel}
                          </span>
                          <span className={`text-xs font-medium ${zpd.color}`}>
                            {zpd.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {rec.reasoning}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {FORMAT_ICONS[course.format] || "📚"}{" "}
                            {course.format}
                          </span>
                          <span>
                            ⏱ {Math.round(course.durationMinutes / 60)}h{" "}
                            {course.durationMinutes % 60 > 0
                              ? `${course.durationMinutes % 60}m`
                              : ""}
                          </span>
                          <span className="capitalize">
                            🎯 {course.bloomLevel}
                          </span>
                          {rec.cognitiveLoadLevel && (
                            <span className="flex items-center gap-1">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  LOAD_INDICATORS[rec.cognitiveLoadLevel]?.color || ""
                                }`}
                              />
                              {LOAD_INDICATORS[rec.cognitiveLoadLevel]?.label}
                            </span>
                          )}
                        </div>

                        {course.skills.length > 0 && (
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {course.skills.map((skill) => (
                              <span
                                key={skill}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
