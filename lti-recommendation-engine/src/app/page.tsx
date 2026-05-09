import Link from "next/link";

export default function Home() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-900 mb-3">
            NeuroCog LMS
          </h1>
          <p className="text-lg text-gray-600">
            Neuro-Cognitive Aware Personalized Learning
          </p>
          <p className="text-sm text-gray-400 mt-1">
            LTI 1.3 AI Recommendation Engine
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              LTI 1.3 Tool Configuration
            </h2>
            <div className="space-y-3 text-sm">
              <ConfigRow label="Login Initiation URL" value={`${appUrl}/api/lti/login`} />
              <ConfigRow label="Launch / Redirect URL" value={`${appUrl}/api/lti/launch`} />
              <ConfigRow label="Public Keyset URL" value={`${appUrl}/api/lti/jwks`} />
              <ConfigRow label="Deep Linking URL" value={`${appUrl}/api/lti/launch`} />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Links
            </h2>
            <div className="flex gap-3">
              <Link
                href="/dashboard/onboarding"
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Onboarding Demo
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Dashboard Demo
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Demo links work without LTI authentication for development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span className="font-medium text-gray-700 sm:w-48 flex-shrink-0">
        {label}
      </span>
      <code className="text-xs bg-gray-50 px-3 py-1.5 rounded-md text-gray-600 break-all flex-1">
        {value}
      </code>
    </div>
  );
}
