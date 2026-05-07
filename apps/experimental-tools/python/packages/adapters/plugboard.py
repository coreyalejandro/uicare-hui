"""
Plugboard: Manage OpenAI-compatible model endpoints for Hui.

Storage:
- Persistent model metadata (no secrets) in data/plugboard.json
- Ephemeral API keys in-process (do not write to disk)
"""

from __future__ import annotations

import json
import os
import threading
from typing import Dict, List, Optional


_LOCK = threading.Lock()
_EPHEMERAL_KEYS: Dict[str, str] = {}


def _data_path() -> str:
    base = os.getenv("HUI_DATA_DIR", os.path.join(os.getcwd(), "data"))
    os.makedirs(base, exist_ok=True)
    return os.path.join(base, "plugboard.json")


def _load() -> Dict[str, dict]:
    path = _data_path()
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
        except Exception:
            return {}


def _save(models: Dict[str, dict]) -> None:
    path = _data_path()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(models, f, ensure_ascii=False, indent=2)


def list_models() -> List[dict]:
    with _LOCK:
        return list(_load().values())


def get_model(model_id: str) -> Optional[dict]:
    with _LOCK:
        return _load().get(model_id)


def add_or_update_model(
    *,
    model_id: str,
    name: str,
    base_url: str,
    default_model: str,
    supports_functions: bool = True,
    enabled: bool = True,
    api_key: Optional[str] = None,  # ephemeral only
) -> None:
    meta = {
        "id": model_id,
        "name": name,
        "base_url": base_url,
        "default_model": default_model,
        "supports_functions": bool(supports_functions),
        "enabled": bool(enabled),
    }
    with _LOCK:
        models = _load()
        models[model_id] = meta
        _save(models)
        if api_key:
            _EPHEMERAL_KEYS[model_id] = api_key


def remove_model(model_id: str) -> None:
    with _LOCK:
        models = _load()
        if model_id in models:
            models.pop(model_id)
            _save(models)
        _EPHEMERAL_KEYS.pop(model_id, None)


def set_enabled(model_id: str, enabled: bool) -> None:
    with _LOCK:
        models = _load()
        if model_id in models:
            models[model_id]["enabled"] = bool(enabled)
            _save(models)


def set_api_key(model_id: str, api_key: str) -> None:
    with _LOCK:
        _EPHEMERAL_KEYS[model_id] = api_key


def get_api_key(model_id: str) -> Optional[str]:
    return _EPHEMERAL_KEYS.get(model_id)


