"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { C } from "@/lib/investment-copilot/constants";
import {
  FileText, TrendingUp, TrendingDown, ShieldAlert, MessageSquare,
} from "@/components/investment-copilot/icons";
import ConfidencePill from "@/components/investment-copilot/ui/ConfidencePill";
import StatusBadge from "@/components/investment-copilot/ui/StatusBadge";

function DownloadIcon({ size = 16, className, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  MEMO CARD                                                           */
/* ------------------------------------------------------------------ */
export default function MemoCard({ memo, mode, onSubmit }) {
  const [tab, setTab] = useState("summary");
  const tabs = [
    { key: "summary", label: "Summary", icon: FileText },
    { key: "financials", label: "Financials", icon: TrendingUp },
    { key: "comparison", label: "Comparison", icon: TrendingDown },
    { key: "risks", label: "Risks", icon: ShieldAlert },
    { key: "citations", label: "Citations", icon: MessageSquare },
  ];

  const sanitizeMemoSummary = (text) => {
    if (!text) return { body: "", note: "" };

    const bodyParagraphs = [];
    const noteParagraphs = [];

    // Split text by paragraph blocks
    const paragraphs = text.split(/\n\s*\n/);

    for (const p of paragraphs) {
      const trimmed = p.trim();
      if (!trimmed) continue;

      // Check if paragraph is an out-of-scope warning, joke disclaimer, or meta note
      const isDisclaimer =
        trimmed.startsWith("---") ||
        trimmed.startsWith("⚠️") ||
        /outside (my|supported) (coverage universe|investment research)/i.test(trimmed) ||
        /joke/i.test(trimmed) ||
        /different analyst/i.test(trimmed) ||
        /keeping the memo professional/i.test(trimmed);

      if (isDisclaimer) {
        noteParagraphs.push(trimmed.replace(/^---\s*/, ""));
      } else {
        bodyParagraphs.push(trimmed);
      }
    }

    return {
      body: bodyParagraphs.join("\n\n").trim(),
      note: noteParagraphs.join("\n\n").trim(),
    };
  };

  const { body: cleanSummary, note: disclaimerNote } = sanitizeMemoSummary(memo.summary);

  const formatMarkdownToHtml = (text) => {
    if (!text) return "";
    let html = text;
    // Replace double asterisks with strong bold tags
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Replace markdown lists with list items
    html = html.replace(/^\s*-\s+(.*?)$/gm, "<li>$1</li>");
    // Wrap lists nicely in ul containers
    html = html.replace(/(<li>.*?<\/li>)/gs, "<ul>$1</ul>");
    // Remove duplicate consecutive ul markers
    html = html.replace(/<\/ul>\s*<ul>/g, "");
    // Separate blocks into clean HTML paragraphs
    html = html.split("\n\n").map(p => {
      const trimmed = p.trim();
      if (trimmed.startsWith("<ul") || trimmed.startsWith("<li") || trimmed.startsWith("<h")) {
        return p;
      }
      return `<p>${p}</p>`;
    }).join("");
    return html;
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedSummary = formatMarkdownToHtml(cleanSummary);
    const comparisonColumns = memo.comparison?.columns || [];
    const comparisonRows = memo.comparison?.rows || [];

    const comparisonSection = comparisonRows.length > 0 && comparisonColumns.length > 0
      ? `
          <div class="section">
            <div class="section-title">Peer Comparison</div>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  ${comparisonColumns.map((col) => `<th>${col}</th>`).join("")}
                </tr>
              </thead>
              <tbody style="font-family: monospace;">
                ${comparisonRows.map((row) => `
                  <tr>
                    <td style="font-family: sans-serif; color: #5E6A80;">${row.metric}</td>
                    ${comparisonColumns.map((col) => `<td>${row[col] ?? "n/a"}</td>`).join("")}
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `
      : `
          <div class="section">
            <div class="section-title">Peer Comparison</div>
            <div style="color: #5E6A80; font-size: 14px;">Comparison data is unavailable.</div>
          </div>
        `;

    const html = `
      <html>
        <head>
          <title>Investment Memo - ${memo.company} (${memo.ticker})</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1D2739;
              line-height: 1.6;
              padding: 40px;
              background: #FFFFFF;
            }
            .header {
              border-bottom: 2px solid #E3E0D4;
              padding-bottom: 20px;
              margin-bottom: 25px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .company-title {
              font-size: 24px;
              font-weight: 700;
              margin: 0 0 5px 0;
              color: #14213B;
            }
            .ticker {
              font-family: monospace;
              font-size: 14px;
              color: #94A0B2;
              margin-left: 8px;
            }
            .meta-row {
              margin-top: 10px;
              font-size: 14px;
              color: #5E6A80;
            }
            .confidence {
              border: 1px solid #22794F;
              color: #22794F;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 12px;
              font-family: monospace;
              margin-left: 10px;
              font-weight: bold;
            }
            .section {
              margin-bottom: 35px;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #0F7A6E;
              border-bottom: 1px solid #EDEAE0;
              padding-bottom: 5px;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .summary-text {
              font-size: 14px;
            }
            .summary-text p {
              margin-bottom: 15px;
            }
            .summary-text ul {
              margin-bottom: 15px;
              padding-left: 20px;
            }
            .summary-text li {
              margin-bottom: 8px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .financial-card {
              border: 1px solid #EDEAE0;
              padding: 10px 15px;
              border-radius: 6px;
            }
            .financial-label {
              font-size: 12px;
              color: #94A0B2;
            }
            .financial-value {
              font-size: 16px;
              font-weight: 600;
              font-family: monospace;
              margin-top: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            }
            th {
              text-align: left;
              font-weight: 500;
              color: #94A0B2;
              padding: 8px;
              border-bottom: 1px solid #E3E0D4;
            }
            td {
              padding: 10px 8px;
              border-bottom: 1px solid #EDEAE0;
            }
            .risk-list {
              padding-left: 20px;
              margin: 0;
            }
            .risk-item {
              font-size: 14px;
              margin-bottom: 8px;
            }
            .citation-tag {
              display: inline-block;
              font-family: monospace;
              font-size: 12px;
              padding: 4px 8px;
              background: #F3F1E9;
              border-radius: 4px;
              margin-right: 8px;
              margin-bottom: 8px;
              color: #5E6A80;
              border: 1px solid #E3E0D4;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="company-title">${memo.company}<span class="ticker">${memo.ticker}</span></h1>
              <div class="meta-row">
                <strong>Thesis:</strong> ${memo.thesis}
                <span class="confidence">${memo.confidence}% Confidence</span>
              </div>
            </div>
            <div style="text-align: right; font-size: 13px; color: #94A0B2;">
              <div>Status: <strong>${memo.status}</strong></div>
              <div>Author: ${memo.author || "Priya Shah"}</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Executive Summary</div>
            <div class="summary-text">${formattedSummary}</div>
          </div>

          <div class="section">
            <div class="section-title">Key Financials</div>
            <div class="grid">
              ${memo.financials.map(f => `
                <div class="financial-card">
                  <div class="financial-label">${f.label}</div>
                  <div class="financial-value">${f.value}</div>
                </div>
              `).join("")}
            </div>
          </div>

          ${comparisonSection}

          <div class="section">
            <div class="section-title">Risk Assessment</div>
            <ul class="risk-list">
              ${memo.risks.map(r => `
                <li class="risk-item">${r}</li>
              `).join("")}
            </ul>
          </div>

          <div class="section">
            <div class="section-title">Supporting Citations</div>
            <div>
              ${memo.citations.map(c => `
                <span class="citation-tag">${c}</span>
              `).join("")}
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: C.line, background: C.panel }}>
      <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: C.lineSoft }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-serif text-lg" style={{ color: C.text }}>{memo.company}</span>
            <span className="font-mono text-xs" style={{ color: C.faint }}>{memo.ticker}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: C.teal }}>{memo.thesis}</span>
            <ConfidencePill value={memo.confidence} />
          </div>
        </div>
        <div className="flex items-start gap-3">
          <button
            onClick={handleDownloadPDF}
            title="Download PDF"
            className="p-1.5 rounded-md border transition-all duration-150 flex items-center justify-center cursor-pointer"
            style={{ borderColor: C.success, background: C.successDim, color: C.success }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.success;
              e.currentTarget.style.color = "#FAF9F5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.successDim;
              e.currentTarget.style.color = C.success;
            }}
          >
            <DownloadIcon size={14} />
          </button>
          <div className="text-right">
            <StatusBadge status={memo.status} decision={memo.decision} />
            <div className="text-xs mt-1" style={{ color: C.faint }}>{memo.author}</div>
          </div>
        </div>
      </div>

      <div className="flex border-b overflow-x-auto" style={{ borderColor: C.lineSoft }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors"
            style={{ borderColor: tab === t.key ? C.teal : "transparent", color: tab === t.key ? C.text : C.muted }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "summary" && cleanSummary ? (
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
            {cleanSummary}
          </ReactMarkdown>
        ) : null}
        {tab === "financials" && (
          <div className="grid grid-cols-2 gap-3">
            {memo.financials.map((f, i) => (
              <div key={i} className="rounded-md border px-3 py-2" style={{ borderColor: C.lineSoft }}>
                <div className="text-xs" style={{ color: C.faint }}>{f.label}</div>
                <div className="font-mono text-sm mt-0.5" style={{ color: C.text }}>{f.value}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "comparison" && (
          memo.comparison && memo.comparison.columns?.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: C.faint }}>
                  <th className="text-left font-normal py-1">Metric</th>
                  {memo.comparison.columns.map((col) => (
                    <th key={col} className="text-left font-normal py-1">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono">
                {memo.comparison.rows.map((r, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.lineSoft}` }}>
                    <td className="py-1.5" style={{ color: C.muted, fontFamily: "inherit" }}>{r.metric}</td>
                    {memo.comparison.columns.map((col) => (
                      <td key={col} className="py-1.5" style={{ color: C.text }}>
                        {r[col] ?? "n/a"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-sm" style={{ color: C.muted }}>
              Comparison data unavailable for this memo.
            </div>
          )
        )}
        {tab === "risks" && (
          <ul className="space-y-2">
            {memo.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: C.text }}>
                <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" style={{ color: C.amber }} />
                {r}
              </li>
            ))}
          </ul>
        )}
        {tab === "citations" && (
          <div className="flex flex-wrap gap-2">
            {memo.citations.map((c, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-md border font-mono" style={{ borderColor: C.lineSoft, color: C.muted }}>{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
