export default function ResultCard({ result, streaming }) {
  if (!result) return null;

  return (
    <div className="rounded-lg border border-gray-200 p-5 space-y-3">
      {(result.model || result.token_used) && (
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {result.model && (
            <span>
              Model:{" "}
              <span className="text-gray-700 font-medium">{result.model}</span>
            </span>
          )}
          {result.token_used != null && !streaming && (
            <span>
              Tokens:{" "}
              <span className="text-gray-700 font-medium">{result.token_used}</span>
            </span>
          )}
        </div>
      )}
      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
        {result.output}
        {streaming && <span className="inline-block w-2 h-4 bg-[#4F46E5] animate-pulse rounded-sm align-middle ml-0.5" />}
      </pre>
    </div>
  );
}
