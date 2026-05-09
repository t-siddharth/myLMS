"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const GOAL_OPTIONS = [
  "Become a Data Scientist",
  "Transition to ML Engineering",
  "Improve Data Analysis Skills",
  "Learn AI/Deep Learning",
  "Build a Data Science Portfolio",
  "Prepare for Data Science Interviews",
  "Apply ML to Business Problems",
  "Research and Academia",
];

const KNOWLEDGE_OPTIONS = [
  "python-basics",
  "sql-queries",
  "statistical-thinking",
  "data-visualization",
  "pandas",
  "ml-fundamentals",
  "deep-learning",
  "linear-algebra",
];

const KNOWLEDGE_LABELS: Record<string, string> = {
  "python-basics": "Python Programming",
  "sql-queries": "SQL & Databases",
  "statistical-thinking": "Statistics & Probability",
  "data-visualization": "Data Visualization",
  "pandas": "Pandas / Data Wrangling",
  "ml-fundamentals": "Machine Learning Basics",
  "deep-learning": "Deep Learning / Neural Networks",
  "linear-algebra": "Linear Algebra",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [goals, setGoals] = useState<string[]>([]);
  const [priorKnowledge, setPriorKnowledge] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState("mixed");
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [sessionLength, setSessionLength] = useState(30);

  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string
  ) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals,
          priorKnowledge,
          learningStyle,
          weeklyHoursAvailable: weeklyHours,
          sessionLengthPreference: sessionLength,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    // Step 0: Goals
    <div key="goals" className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        What are your learning goals?
      </h2>
      <p className="text-gray-600">Select all that apply.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOAL_OPTIONS.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleItem(goals, setGoals, goal)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              goals.includes(goal)
                ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                : "border-gray-200 hover:border-gray-300 text-gray-700"
            }`}
          >
            <span className="text-sm font-medium">{goal}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Prior Knowledge
    <div key="knowledge" className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        What do you already know?
      </h2>
      <p className="text-gray-600">
        Select topics you have some experience with.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {KNOWLEDGE_OPTIONS.map((skill) => (
          <button
            key={skill}
            onClick={() =>
              toggleItem(priorKnowledge, setPriorKnowledge, skill)
            }
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              priorKnowledge.includes(skill)
                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                : "border-gray-200 hover:border-gray-300 text-gray-700"
            }`}
          >
            <span className="text-sm font-medium">
              {KNOWLEDGE_LABELS[skill] || skill}
            </span>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Learning Style
    <div key="style" className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        How do you learn best?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            value: "visual",
            label: "Visual",
            desc: "Videos, diagrams, charts",
            icon: "🎬",
          },
          {
            value: "reading",
            label: "Reading",
            desc: "Articles, textbooks, docs",
            icon: "📖",
          },
          {
            value: "hands-on",
            label: "Hands-on",
            desc: "Projects, exercises, labs",
            icon: "🛠",
          },
          {
            value: "mixed",
            label: "Mixed",
            desc: "A bit of everything",
            icon: "🎯",
          },
        ].map((style) => (
          <button
            key={style.value}
            onClick={() => setLearningStyle(style.value)}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              learningStyle === style.value
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-2xl mb-2">{style.icon}</div>
            <div className="font-semibold text-gray-900">{style.label}</div>
            <div className="text-sm text-gray-500">{style.desc}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Availability
    <div key="availability" className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">
        How much time can you dedicate?
      </h2>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Hours per week: {weeklyHours}
          </span>
          <input
            type="range"
            min={1}
            max={40}
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            className="mt-2 w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 hr</span>
            <span>20 hrs</span>
            <span>40 hrs</span>
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Preferred session length: {sessionLength} minutes
          </span>
          <input
            type="range"
            min={15}
            max={120}
            step={15}
            value={sessionLength}
            onChange={(e) => setSessionLength(Number(e.target.value))}
            className="mt-2 w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>15 min</span>
            <span>60 min</span>
            <span>120 min</span>
          </div>
        </label>
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-900">
            Welcome to NeuroCog LMS
          </h1>
          <p className="mt-2 text-gray-600">
            Let&apos;s personalize your learning path
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8 flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-indigo-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {steps[step]}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-0"
            >
              Back
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Setting up..." : "Start Learning"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
