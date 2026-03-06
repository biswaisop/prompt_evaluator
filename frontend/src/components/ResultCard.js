export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="rounded-lg border border-gray-200 p-5 space-y-3">
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>
          Model:{" "}
          <span className="text-gray-700 font-medium">{result.model}</span>
        </span>
        <span>
          Tokens:{" "}
          <span className="text-gray-700 font-medium">{result.token_used}</span>
        </span>
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
        {result.output}
      </pre>
    </div>
  );
}
