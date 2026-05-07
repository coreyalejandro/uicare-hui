"""
Invoker: call OpenAI-compatible chat endpoints using Plugboard config.
"""

from __future__ import annotations

from typing import List, Dict, Optional
import time
import random
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout

from . import plugboard


_POOL = ThreadPoolExecutor(max_workers=8)


def chat_completion(
    model_id: str,
    messages: List[Dict[str, str]],
    max_tokens: int = 700,
    temperature: float = 0.7,
    timeout_s: float = 20.0,
    retries: int = 2,
    max_chars: int = 4000,
) -> Optional[str]:
    meta = plugboard.get_model(model_id)
    if not meta:
        return None
    api_key = plugboard.get_api_key(model_id)
    if not api_key:
        return None

    base_url = meta.get("base_url")
    default_model = meta.get("default_model")
    if not base_url or not default_model:
        return None

    def _call() -> Optional[str]:
        try:
            from openai import OpenAI
            client = OpenAI(base_url=base_url, api_key=api_key)
            completion = client.chat.completions.create(
                model=default_model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            if completion and completion.choices:
                content = completion.choices[0].message.content
                if isinstance(content, str) and len(content) > max_chars:
                    return content[:max_chars] + "\n...[truncated]"
                return content
        except Exception as e:  # noqa: BLE001
            print(f"invoke error for {model_id}: {e}")
            return None
        return None

    delay = 0.6
    for attempt in range(retries + 1):
        fut = _POOL.submit(_call)
        try:
            return fut.result(timeout=timeout_s)
        except FuturesTimeout:
            # cancel best-effort
            try:
                fut.cancel()
            except Exception:
                pass
        except Exception:
            pass
        if attempt < retries:
            time.sleep(delay + random.random() * 0.2)
            delay *= 2
    return None


