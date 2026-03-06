import Link from "next/link";

const features = [
  {
    title: "Test Prompts",
    description:
      "Run your prompts against multiple LLMs and compare outputs side by side.",
  },
  {
    title: "Tune Parameters",
    description:
      "Adjust temperature, top-p, and other parameters to get the perfect response.",
  },
  {
    title: "Track History",
    description:
      "Save and revisit every prompt run so you never lose a good result.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-gray-200">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">
            Prompt Playground
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 rounded-md transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Your AI Prompt Workbench
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Test prompts, tune parameters, and track results — all in one clean
            interface.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] px-6 py-2.5 rounded-md transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 border border-gray-200 hover:border-gray-400 px-6 py-2.5 rounded-md transition-colors"
            >
              Log In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-gray-200 p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-sm text-gray-400">
          Prompt Playground
        </div>
      </footer>
    </div>
  );
}
