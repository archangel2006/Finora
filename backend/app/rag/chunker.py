import re
from typing import List
from langchain_core.documents import Document

KNOWN_HEADINGS = [
    "Item 1. Business Overview", "Item 1A. Risk Factors",
    "Item 7. Management's Discussion and Analysis",
    "Consolidated Income Statement Summary", "Balance Sheet Highlights",
    "Revenue by Segment", "Revenue by Category", "Competitive Landscape",
    "Outlook", "Quarter Highlights", "Condensed Income Statement",
    "Revenue and Guidance", "Segment Performance", "Management Commentary",
    "Prepared Remarks (Condensed)", "Analyst Q&A Session",
]
_LOOKUP = {h.lower(): h for h in KNOWN_HEADINGS}


def _is_heading(line: str) -> bool:
    line = line.strip()
    if not line:
        return False
    if line.lower() in _LOOKUP:
        return True
    if len(line) > 70 or line.endswith((".", ",", ":", ";", "•")):
        return False
    words = line.split()
    if len(words) < 2:
        return False
    return sum(1 for w in words if w[0].isupper()) / len(words) > 0.6


def chunk_by_heading(text: str, base_metadata: dict) -> List[Document]:
    lines = [l.strip() for l in text.splitlines()]
    sections, heading, buf = [], "Preamble", []

    def flush():
        joined = "\n".join(buf).strip()
        if joined:
            sections.append((heading, joined))

    for line in lines:
        if _is_heading(line):
            flush()
            heading = _LOOKUP.get(line.lower(), line)
            buf = []
        else:
            buf.append(line)
    flush()

    docs = []
    for section_name, section_text in sections:
        # long sections still get sub-split, same section metadata carried through
        if len(section_text) <= 1200:
            docs.append(Document(page_content=section_text,
                                  metadata={**base_metadata, "section": section_name}))
            continue
        paras, chunk_buf = section_text.split("\n\n"), ""
        for p in paras:
            if len(chunk_buf) + len(p) > 900:
                docs.append(Document(page_content=chunk_buf.strip(),
                                      metadata={**base_metadata, "section": section_name}))
                chunk_buf = p
            else:
                chunk_buf += "\n\n" + p
        if chunk_buf.strip():
            docs.append(Document(page_content=chunk_buf.strip(),
                                  metadata={**base_metadata, "section": section_name}))
    return docs