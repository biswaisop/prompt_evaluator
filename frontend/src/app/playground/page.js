"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function PlaygroundPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [temp, setTemp] = useState(0.7);
  const [maxToken, setMaxToken] = useState(512);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiFetch("/history/");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.entries ?? data);
      }
    } catch {
      // silent — apiFetch handles 401 redirect
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    fetchHistory();
  }, [router, fetchHistory]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await apiFetch("/prompt/prompt", {
        method: "POST",
        body: JSON.stringify({ prompt: prompt.trim(), temp, max_token: maxToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Something went wrong.");
        return;
      }
      const data = await res.json();
      setResult(data);
      fetchHistory();
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(entryId) {
    try {
      const res = await apiFetch(`/history/${entryId}`, { method: "DELETE" });
      if (res.ok) setHistory((prev) => prev.filter((h) => h._id !== entryId));
    } catch {
      // silent
    }
  }

  function handleHistoryClick(entry) {
    setPrompt(entry.prompt);
    setTemp(entry.temp);
    setMaxToken(entry.max_token);
    setResult({ output: entry.response, model: entry.model, token_used: entry.token_used });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-gray-200">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">Prompt Playground</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="flex-1 mx-auto w-full max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Main panel */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Prompt */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-1.5">
                Prompt
              </label>
              <textarea
                id="prompt"
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] resize-y"
              />
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="temp" className="block text-sm font-medium mb-1.5">
                  Temperature: {temp}
                </label>
                <input
                  id="temp"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={temp}
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                  className="w-full accent-[#4F46E5]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>1</span>
                </div>
              </div>
              <div>
                <label htmlFor="maxToken" className="block text-sm font-medium mb-1.5">
                  Max Tokens
                </label>
                <input
                  id="maxToken"
                  type="number"
                  min={100}
                  max={2000}
                  step={50}
                  value={maxToken}
                  onChange={(e) => setMaxToken(parseInt(e.target.value, 10) || 512)}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-md transition-colors"
            >
              {loading ? "Running…" : "Run Prompt"}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-lg border border-gray-200 p-5 space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Model: <span className="text-gray-700 font-medium">{result.model}</span></span>
                <span>Tokens: <span className="text-gray-700 font-medium">{result.token_used}</span></span>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{result.output}</pre>
            </div>
          )}
        </div>

        {/* History sidebar */}
        <aside className="space-y-4">
          <h2 className="text-sm font-semibold">History</h2>
          {historyLoading ? (
            <p className="text-xs text-gray-400">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-gray-400">No history yet.</p>
          ) : (
            <ul className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {history.map((entry) => (
                <li
                  key={entry._id}
                  className="rounded-md border border-gray-200 p-3 text-sm hover:border-[#4F46E5] transition-colors cursor-pointer group"
                  onClick={() => handleHistoryClick(entry)}
                >
                  <p className="truncate font-medium">{entry.prompt}</p>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
                    <span>{entry.model}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(entry._id); }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
