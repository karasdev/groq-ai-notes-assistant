"use client";

import { useState } from "react";

type SourceNote = {
  title: string;
  content: string;
};

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<SourceNote[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSources([]);

    // Temporary fake response for UI testing.
    // Later replace this with fetch("/api/ask").
    setTimeout(() => {
      setAnswer(
        "You need to finish the invoice feature by Friday. John will review the API changes."
      );

      setSources([
        {
          title: "Invoice Feature",
          content:
            "We need to finish the invoice feature by Friday. John will review the API changes.",
        },
      ]);

      setLoading(false);
    }, 700);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <p className="text-sm text-slate-400">Ask AI</p>
          <h1 className="mt-2 text-3xl font-bold">Ask about your notes</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            The assistant will answer using your saved notes as context.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <label className="mb-3 block text-sm text-slate-300">
            Your question
          </label>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: What should I finish by Friday?"
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-slate-400"
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAsk}
              disabled={loading}
              className="rounded-xl bg-white px-6 py-3 font-medium text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Answer</h2>

            {!answer && !loading && (
              <p className="mt-4 text-slate-500">
                Ask a question to see the AI answer here.
              </p>
            )}

            {loading && (
              <div className="mt-4 rounded-xl bg-slate-950 p-4 text-slate-400">
                Searching your notes and asking Groq...
              </div>
            )}

            {answer && (
              <div className="mt-4 rounded-xl bg-slate-950 p-5 leading-7 text-slate-200">
                {answer}
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Sources</h2>

            {sources.length === 0 && (
              <p className="mt-4 text-sm text-slate-500">
                Source notes will appear here.
              </p>
            )}

            <div className="mt-4 space-y-4">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="font-medium">{source.title}</p>
                  <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-400">
                    {source.content}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}