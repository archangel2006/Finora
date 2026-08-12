"use client";

import ReactMarkdown from "react-markdown";
import { C } from "@/lib/investment-copilot/constants";

function formatMarkdownText(text) {
  if (!text) return "";
  let formatted = text;
  // Convert inline bullet list items " - **" into newlines "\n- **"
  formatted = formatted.replace(/\s+-\s+\*\*/g, "\n- **");
  return formatted;
}

export default function ComparisonOutput({ data }) {
  if (!data) return null;

  // Prefer data.columns (new backend format: display names like "NVIDIA", "Microsoft")
  // Fall back to data.headers for legacy shape, then infer from row keys.
  let headers = data.columns || data.headers;
  if (!headers && data.rows && data.rows.length > 0) {
    const keys = Object.keys(data.rows[0]).filter((k) => k !== "metric" && k !== "label");
    headers = keys.map((k) => k.toUpperCase());
  }
  if (!headers || headers.length === 0) {
    return (
      <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
        <div className="text-sm" style={{ color: C.muted }}>Comparison data unavailable.</div>
      </div>
    );
  }

  // Ensure first header is "Metric" label
  const colHeaders = headers[0]?.toLowerCase() === "metric" ? headers.slice(1) : headers;
  const formattedNote = formatMarkdownText(data.note);

  return (
    <div className="rounded-lg border p-4 overflow-x-auto" style={{ borderColor: C.line, background: C.panel }}>
      {data.title && (
        <div className="font-serif text-base mb-3 font-semibold" style={{ color: C.text }}>
          {data.title}
        </div>
      )}
      <table className="w-full text-sm mb-3">
        <thead>
          <tr style={{ color: C.faint }}>
            <th className="text-left font-normal py-1.5 px-2">Metric</th>
            {colHeaders.map((h, i) => (
              <th key={i} className="text-left font-normal py-1.5 px-2 font-mono">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-mono">
          {data.rows &&
            data.rows.map((r, i) => {
              const metricName = r.metric || r.label || `Metric ${i + 1}`;
              return (
                <tr key={i} style={{ borderTop: `1px solid ${C.lineSoft}` }}>
                  <td className="py-2 px-2 font-sans" style={{ color: C.muted }}>
                    {metricName}
                  </td>
                  {colHeaders.map((h, j) => {
                    const keyLower = h.toLowerCase();
                    const val = r[keyLower] ?? r[h] ?? r[j] ?? "n/a";
                    return (
                      <td key={j} className="py-2 px-2" style={{ color: C.text }}>
                        {typeof val === "object" ? JSON.stringify(val) : String(val)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
      {formattedNote && (
        <ReactMarkdown
          className="text-xs leading-relaxed mt-2"
          components={{
            p: ({ node, ...props }) => (
              <p className="text-xs leading-relaxed mb-1" style={{ color: C.muted }} {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold" style={{ color: C.text }} {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="ml-4 list-disc text-xs leading-relaxed mb-1" style={{ color: C.muted }} {...props} />
            ),
          }}
        >
          {formattedNote}
        </ReactMarkdown>
      )}
    </div>
  );
}
