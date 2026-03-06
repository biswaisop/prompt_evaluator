"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";

const AVAILABLE_MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B" },
  { id: "llama3-8b-8192", label: "Llama 3 8B" },
];

function streamModel(
  apiUrl,
  token,
  payload,
  modelId,
  onToken,
  onDone,
  onError,
) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${apiUrl}/api/prompt/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...payload, model: modelId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        onError(modelId, data.detail || "Request failed.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let output = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = JSON.parse(line.slice(6));

          if (json.error) {
            onError(modelId, json.error);
            return;
          }

          if (json.done) {
            onDone(modelId, {
              output,
              model: json.model || modelId,
              token_used: json.token_used ?? 0,
            });
            return;
          }

          output += json.token;
          onToken(modelId, output);
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        onError(modelId, "Connection failed.");
      }
    }
  })();

  return controller;
}

export default function ComparePage() {
  const { logout } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [temp, setTemp] = useState(0.7);
  const [maxToken, setMaxToken] = useState(512);
  const [selectedModels, setSelectedModels] = useState([
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ]);
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const controllersRef = useRef([]);
  const pendingRef = useRef(0);

  function toggleModel(modelId) {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((m) => m !== modelId)
        : [...prev, modelId],
    );
  }

  const handleToken = useCallback((modelId, output) => {
    setResults((prev) => ({
      ...prev,
      [modelId]: { ...prev[modelId], output, streaming: true },
    }));
  }, []);

  const handleDone = useCallback((modelId, data) => {
    setResults((prev) => ({
      ...prev,
      [modelId]: { ...data, streaming: false, error: null },
    }));
    pendingRef.current -= 1;
    if (pendingRef.current === 0) setRunning(false);
  }, []);

  const handleError = useCallback((modelId, message) => {
    setResults((prev) => ({
      ...prev,
      [modelId]: {
        output: "",
        model: modelId,
        token_used: 0,
        streaming: false,
        error: message,
      },
    }));
    pendingRef.current -= 1;
    if (pendingRef.current === 0) setRunning(false);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim() || !apiKey.trim() || selectedModels.length === 0) return;

    // Abort any existing streams
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current = [];

    const payload = {
      api_key: apiKey.trim(),
      prompt: prompt.trim(),
      temp,
      max_token: maxToken,
    };

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Initialize results
    const init = {};
    for (const m of selectedModels) {
      init[m] = {
        output: "",
        model: m,
        token_used: 0,
        streaming: true,
        error: null,
      };
    }
    setResults(init);
    setRunning(true);
    pendingRef.current = selectedModels.length;

    const controllers = selectedModels.map((modelId) =>
      streamModel(
        apiUrl,
        token,
        payload,
        modelId,
        handleToken,
        handleDone,
        handleError,
      ),
    );
    controllersRef.current = controllers;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        links={[
          { href: "/playground", label: "Playground" },
          { href: "/history", label: "History" },
        ]}
        onLogout={logout}
      />

      <div className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Compare Models</h1>

        <form onSubmit={handleSubmit} className="space-y-5 mb-8">
          {/* API Key */}
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium mb-1.5"
            >
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Groq API key"
              className="w-full max-w-md rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
            />
          </div>

          {/* Prompt */}
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium mb-1.5"
            >
              Prompt
            </label>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] resize-y"
            />
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label
                htmlFor="temp"
                className="block text-sm font-medium mb-1.5"
              >
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
            </div>
            <div>
              <label
                htmlFor="maxToken"
                className="block text-sm font-medium mb-1.5"
              >
                Max Tokens
              </label>
              <input
                id="maxToken"
                type="text"
                inputMode="numeric"
                value={maxToken}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setMaxToken(raw === "" ? "" : parseInt(raw, 10));
                }}
                onBlur={() => {
                  const v = parseInt(maxToken, 10);
                  if (isNaN(v) || v < 100) setMaxToken(100);
                  else if (v > 2000) setMaxToken(2000);
                }}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Models ({selectedModels.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_MODELS.map((m) => {
                const active = selectedModels.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleModel(m.id)}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      active
                        ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#4F46E5]"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !prompt.trim() ||
              !apiKey.trim() ||
              selectedModels.length === 0 ||
              running
            }
            className="text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-md transition-colors"
          >
            {running ? "Comparing…" : "Compare"}
          </button>
        </form>

        {/* Results grid */}
        {Object.keys(results).length > 0 && (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(selectedModels.length, 3)}, 1fr)`,
            }}
          >
            {selectedModels.map((modelId) => {
              const r = results[modelId];
              if (!r) return null;
              const label =
                AVAILABLE_MODELS.find((m) => m.id === modelId)?.label ||
                modelId;
              return (
                <div
                  key={modelId}
                  className="rounded-lg border border-gray-200 p-4 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    <span className="text-sm font-semibold">{label}</span>
                    {!r.streaming && !r.error && (
                      <span className="text-xs text-gray-400">
                        {r.token_used} tokens
                      </span>
                    )}
                  </div>

                  {r.error ? (
                    <p className="text-sm text-red-600">{r.error}</p>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed flex-1 min-h-[120px]">
                      {r.output}
                      {r.streaming && (
                        <span className="inline-block w-2 h-4 bg-[#4F46E5] animate-pulse rounded-sm align-middle ml-0.5" />
                      )}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
