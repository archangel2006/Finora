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

export default function TextOutput({ data }) {
  const formattedBody = formatMarkdownText(data.body);

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: C.line, background: C.panel }}>
      {data.title && <div className="font-serif text-sm mb-2" style={{ color: C.text }}>{data.title}</div>}

      {formattedBody ? (
        <ReactMarkdown
          className="text-sm leading-relaxed"
          components={{
            p: ({ node, ...props }) => (
              <p className="text-sm leading-relaxed mb-3" style={{ color: C.text }} {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold" style={{ color: C.text }} {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic" style={{ color: C.text }} {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="ml-4 list-disc text-sm leading-relaxed mb-2" style={{ color: C.text }} {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="mb-3" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="ml-4 list-decimal mb-3" {...props} />
            ),
            h1: ({ node, ...props }) => (
              <h1 className="text-base font-semibold mt-4 mb-2" style={{ color: C.text }} {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-sm font-semibold mt-4 mb-2" style={{ color: C.text }} {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-sm font-semibold mt-4 mb-2" style={{ color: C.text }} {...props} />
            ),
          }}
        >
          {formattedBody}
        </ReactMarkdown>
      ) : null}

      {data.citations && data.citations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.citations.map((c, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-md border font-mono" style={{ borderColor: C.lineSoft, color: C.muted }}>{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}
