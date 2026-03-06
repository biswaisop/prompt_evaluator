export default function HistorySidebar({
  history,
  loading,
  onSelect,
  onDelete,
}) {
  return (
    <aside className="space-y-4">
      <h2 className="text-sm font-semibold">History</h2>
      {loading ? (
        <p className="text-xs text-gray-400">Loading…</p>
      ) : history.length === 0 ? (
        <p className="text-xs text-gray-400">No history yet.</p>
      ) : (
        <ul className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {history.map((entry) => (
            <li
              key={entry._id}
              className="rounded-md border border-gray-200 p-3 text-sm hover:border-[#4F46E5] transition-colors cursor-pointer group"
              onClick={() => onSelect(entry)}
            >
              <p className="truncate font-medium">{entry.prompt}</p>
              <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
                <span>{entry.model}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(entry._id);
                  }}
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
  );
}
