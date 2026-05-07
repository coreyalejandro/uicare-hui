"""
EnhancedResearchAgent (minimal) for Hui:
- Web search via ddgs
- Wikipedia lookup via wikipedia
- Caching and in-flight coalescing
- Parallel when depth="deep"

This is a lightweight subset; additional sources can be added later.
"""

from __future__ import annotations

import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
from typing import Dict, List, Tuple


try:
    from ddgs import DDGS  # type: ignore
except Exception:  # pragma: no cover
    DDGS = None

try:
    import wikipedia  # type: ignore
except Exception:  # pragma: no cover
    wikipedia = None


_inflight_locks: Dict[Tuple[str, str], threading.Lock] = {}
_inflight_results: Dict[Tuple[str, str], str] = {}
_inflight_global_lock = threading.Lock()


def _key(tool: str, query: str) -> Tuple[str, str]:
    return (tool, query.strip().lower())


class EnhancedResearchAgent:
    def __init__(self, max_workers: int = 6) -> None:
        self._pool = ThreadPoolExecutor(max_workers=max_workers)

    # Public API
    def search(self, query: str, research_depth: str = "standard") -> str:
        if research_depth == "deep":
            return self._deep_search(query)
        return self._standard_search(query)

    # Tools
    def _web_search(self, query: str) -> str:
        if DDGS is None:
            return "[web] ddgs not installed"
        try:
            results = []
            with DDGS() as ddgs:  # type: ignore[call-arg]
                for r in ddgs.text(query, max_results=5):
                    title = r.get("title", "")
                    href = r.get("href", "")
                    body = r.get("body", "")
                    results.append(f"- {title} ({href})\n  {body}")
            if not results:
                return "[web] no results"
            return "\n".join(results)
        except Exception as e:  # noqa: BLE001
            return f"[web] error: {e}"

    def _wikipedia_search(self, query: str) -> str:
        if wikipedia is None:
            return "[wikipedia] wikipedia not installed"
        try:
            wikipedia.set_lang("en")  # type: ignore[attr-defined]
            page_titles = wikipedia.search(query)  # type: ignore[attr-defined]
            if not page_titles:
                return "[wikipedia] no results"
            title = page_titles[0]
            page = wikipedia.page(title)  # type: ignore[attr-defined]
            summary = wikipedia.summary(title, sentences=5)  # type: ignore[attr-defined]
            return f"{title}\n{page.url}\n\n{summary}"
        except Exception as e:  # noqa: BLE001
            return f"[wikipedia] error: {e}"

    # Caching and coalescing
    @lru_cache(maxsize=512)
    def _cached(self, tool: str, query: str) -> str:
        if tool == "web":
            return self._web_search(query)
        if tool == "wikipedia":
            return self._wikipedia_search(query)
        return ""

    def _coalesced(self, tool: str, query: str) -> str:
        k = _key(tool, query)
        with _inflight_global_lock:
            lock = _inflight_locks.get(k)
            if lock is None:
                lock = threading.Lock()
                _inflight_locks[k] = lock
        with lock:
            if k in _inflight_results:
                return _inflight_results.pop(k)
            result = self._cached(tool, query)
            _inflight_results[k] = result
            with _inflight_global_lock:
                _inflight_locks.pop(k, None)
            return result

    # Strategies
    def _standard_search(self, query: str) -> str:
        # simple routing: wikipedia for "what is" style, else web
        ql = query.lower()
        tool = "wikipedia" if any(x in ql for x in ["what is", "who is", "wikipedia"]) else "web"
        return self._coalesced(tool, query)

    def _deep_search(self, query: str) -> str:
        tools = ["web", "wikipedia"]
        futures = {self._pool.submit(self._coalesced, t, query): t for t in tools}
        parts: List[str] = []
        for fut in as_completed(futures):
            try:
                res = fut.result()
                if res:
                    parts.append(f"## {futures[fut].title()}\n{res}")
            except Exception as e:  # noqa: BLE001
                parts.append(f"## {futures[fut].title()}\nerror: {e}")
        if not parts:
            return "No sources returned results."
        return "\n\n".join(parts)


