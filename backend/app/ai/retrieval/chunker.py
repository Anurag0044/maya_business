from __future__ import annotations

import re


def chunk_text(text: str, max_chars: int = 1400, overlap_chars: int = 180) -> list[str]:
    """Create retrieval-friendly, paragraph-aware chunks.

    Headings are kept with the following content where possible. Chunks are
    deliberately character-based so ingestion remains dependency-light.
    """
    text = re.sub(r"\r\n?", "\n", text or "").strip()
    if not text:
        return []

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: list[str] = []
    current = ""

    for paragraph in paragraphs:
        candidate = f"{current}\n\n{paragraph}" if current else paragraph
        if len(candidate) <= max_chars:
            current = candidate
            continue

        if current:
            chunks.append(current.strip())

        # Split an unusually large paragraph on sentence boundaries first.
        if len(paragraph) > max_chars:
            sentences = re.split(r"(?<=[.!?])\s+", paragraph)
            current = ""
            for sentence in sentences:
                candidate = f"{current} {sentence}".strip()
                if len(candidate) <= max_chars:
                    current = candidate
                else:
                    if current:
                        chunks.append(current.strip())
                    current = sentence[:max_chars]
            continue

        # Keep a small tail from the previous chunk to preserve context.
        tail = chunks[-1][-overlap_chars:] if chunks and overlap_chars else ""
        current = f"{tail}\n\n{paragraph}".strip() if tail else paragraph

    if current:
        chunks.append(current.strip())

    return [chunk for chunk in chunks if chunk]
