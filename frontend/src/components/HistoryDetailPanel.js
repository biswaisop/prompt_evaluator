export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryDetailPanel({
  selected,
  loading,
  onDelete,
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-6 min-h-[300px]">
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : selected ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Prompt
            </h3>
            <p className="text-sm">{selected.prompt}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Response
            </h3>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {selected.response}
            </pre>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
            <span>
              Model:{" "}
              <span className="text-gray-700 font-medium">{selected.model}</span>
            </span>
            <span>
              Temperature:{" "}
              <span className="text-gray-700 font-medium">{selected.temp}</span>
            </span>
            <span>
              Max Tokens:{" "}
              <span className="text-gray-700 font-medium">{selected.max_token}</span>
            </span>
            <span>
              Tokens Used:{" "}
              <span className="text-gray-700 font-medium">{selected.token_used}</span>
            </span>
            <span>
              Date:{" "}
              <span className="text-gray-700 font-medium">
                {formatDate(selected.created_at)}
              </span>
            </span>
          </div>
          <button
            onClick={() => onDelete(selected._id)}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Delete this entry
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Select an entry to view details</p>
      )}
    </div>
  );
}
