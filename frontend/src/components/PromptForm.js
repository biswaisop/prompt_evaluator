"use client";

import { useState } from "react";

export default function PromptForm({ onSubmit, loading }) {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [temp, setTemp] = useState(0.7);
  const [maxToken, setMaxToken] = useState(512);

  function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim() || !apiKey.trim()) return;
    onSubmit({ api_key: apiKey.trim(), prompt: prompt.trim(), temp, max_token: maxToken });
  }

  function loadFromHistory(entry) {
    setPrompt(entry.prompt);
    setTemp(entry.temp);
    setMaxToken(entry.max_token);
  }

  return { form: (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* API Key */}
      <div>
        <label htmlFor="apiKey" className="block text-sm font-medium mb-1.5">
          API Key
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Groq API key"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
        />
      </div>

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

      <button
        type="submit"
        disabled={loading || !prompt.trim() || !apiKey.trim()}
        className="text-sm font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-md transition-colors"
      >
        {loading ? "Running…" : "Run Prompt"}
      </button>
    </form>
  ), loadFromHistory };
}
