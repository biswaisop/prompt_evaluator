"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import Navbar from "@/components/Navbar";
import HistoryDetailPanel, { formatDate } from "@/components/HistoryDetailPanel";

export default function HistoryPage() {
  const { logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleSelect(entry) {
    setDetailLoading(true);
    try {
      const res = await apiFetch(`/api/getHistory/${entry._id}`);
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
      }
    } catch {
      // silent
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDelete(entryId) {
    try {
      const res = await apiFetch(`/api/deleteHistory/${entryId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((h) => h._id !== entryId));
        if (selected && selected._id === entryId) setSelected(null);
      }
    } catch {
      // silent
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        links={[{ href: "/playground", label: "Playground" }]}
        onLogout={logout}
      />

      <div className="flex-1 mx-auto w-full max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">History</h1>

        {loading ? (
          <p className="text-sm text-gray-400">Loading history…</p>
        ) : history.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No history yet.</p>
            <Link
              href="/playground"
              className="mt-4 inline-block text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors"
            >
              Go to Playground
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            {/* Entry list */}
            <ul className="space-y-2 max-h-[calc(100vh-14rem)] overflow-y-auto">
              {history.map((entry) => (
                <li
                  key={entry._id}
                  onClick={() => handleSelect(entry)}
                  className={`rounded-md border p-3 text-sm cursor-pointer transition-colors group ${
                    selected && selected._id === entry._id
                      ? "border-[#4F46E5] bg-indigo-50"
                      : "border-gray-200 hover:border-[#4F46E5]"
                  }`}
                >
                  <p className="truncate font-medium">{entry.prompt}</p>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
                    <span>{entry.model}</span>
                    <span>{formatDate(entry.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                    <span>
                      Temp: {entry.temp} · Tokens: {entry.token_used}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <HistoryDetailPanel
              selected={selected}
              loading={detailLoading}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
