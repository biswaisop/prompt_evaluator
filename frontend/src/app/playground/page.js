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
      try {
        const res = await apiFetch("/api/prompt", {
          method: "POST",
          body: JSON.stringify(payload),
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
        links={[{ href: "/history", label: "History" }]}
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

          <ResultCard result={result} />
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
