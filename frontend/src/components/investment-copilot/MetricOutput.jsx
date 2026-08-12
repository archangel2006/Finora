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

export default function MetricOutput({ data }) {
  const tone = data.tone === "amber" ? C.amber : C.teal;
  const formattedNote = formatMarkdownText(data.note);

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
      <div className="text-xs uppercase tracking-wider font-mono mb-1" style={{ color: C.faint }}>{data.label}</div>
      <div className="font-mono text-3xl mb-1" style={{ color: tone }}>{data.value}</div>
      <div className="text-xs font-mono mb-3" style={{ color: C.muted }}>{data.sub}</div>

      {formattedNote && (
        <ReactMarkdown
          className="text-sm leading-relaxed"
          components={{
            p: ({ node, ...props }) => (
              <p className="text-sm leading-relaxed mb-2" style={{ color: C.text }} {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold" style={{ color: C.text }} {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic" style={{ color: C.text }} {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="ml-4 list-disc text-sm leading-relaxed mb-1" style={{ color: C.text }} {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="mb-2" {...props} />
            ),
          }}
        >
          {formattedNote}
        </ReactMarkdown>
      )}
    </div>
  );
}
