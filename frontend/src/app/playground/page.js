"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import PromptForm from "@/components/PromptForm";
import ResultCard from "@/components/ResultCard";
import HistorySidebar from "@/components/HistorySidebar";

export default function PlaygroundPage() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiFetch("/api/getEntries");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.entries ?? data);
      }
    } catch {
      // apiFetch handles 401 redirect
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const { form, loadFromHistory } = PromptForm({
    loading,
    onSubmit: async (payload) => {
      setError("");
      setResult(null);
      setLoading(true);
      setStreaming(true);

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/prompt/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          setError(data.detail || "Something went wrong.");
          setLoading(false);
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let output = "";
        let model = "";
        let tokenUsed = 0;

        setLoading(false); // hide spinner once stream starts
        setResult({ output: "", model: "", token_used: 0 });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = JSON.parse(line.slice(6));

            if (json.error) {
              setError(json.error);
              setStreaming(false);
              return;
            }

            if (json.done) {
              model = json.model || model;
              tokenUsed = json.token_used ?? tokenUsed;
              setResult({ output, model, token_used: tokenUsed });
              setStreaming(false);
              fetchHistory();
              return;
            }

            output += json.token;
            setResult((prev) => ({ ...prev, output }));
          }
        }

        setStreaming(false);
      } catch {
        setError("Request failed. Please try again.");
        setLoading(false);
        setStreaming(false);
      }
    },
  });

  async function handleDelete(entryId) {
    try {
      const res = await apiFetch(`/api/deleteHistory/${entryId}`, { method: "DELETE" });
      if (res.ok) setHistory((prev) => prev.filter((h) => h._id !== entryId));
    } catch {
      // silent
    }
  }

  function handleHistoryClick(entry) {
    loadFromHistory(entry);
    setResult({
      output: entry.response,
      model: entry.model,
      token_used: entry.token_used,
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        links={[
          { href: "/compare", label: "Compare" },
          { href: "/history", label: "History" },
        ]}
        onLogout={logout}
      />

      <div className="flex-1 mx-auto w-full max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          {form}

          {loading && <Spinner text="Waiting for response…" />}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <ResultCard result={result} streaming={streaming} />
        </div>

        <HistorySidebar
          history={history}
          loading={historyLoading}
          onSelect={handleHistoryClick}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
