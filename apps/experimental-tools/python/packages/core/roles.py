"""
Role Foundry: built-in roles plus CRUD for custom roles.

Storage (custom roles only): data/roles.json
"""

from __future__ import annotations

import json
import os
import threading
from typing import Dict


BUILT_IN_ROLES: Dict[str, str] = {
    'standard': "Provide expert analysis with clear reasoning and evidence.",
    'expert_advocate': "You are a PASSIONATE EXPERT advocating for your specialized position. Present compelling evidence with conviction.",
    'critical_analyst': "You are a RIGOROUS CRITIC. Identify flaws, risks, and weaknesses in arguments with analytical precision.",
    'strategic_advisor': "You are a STRATEGIC ADVISOR. Focus on practical implementation, real-world constraints, and actionable insights.",
    'research_specialist': "You are a RESEARCH EXPERT with deep domain knowledge. Provide authoritative analysis and evidence-based insights.",
    'innovation_catalyst': "You are an INNOVATION EXPERT. Challenge conventional thinking and propose breakthrough approaches.",
}


_LOCK = threading.Lock()


def _data_path() -> str:
    base = os.getenv("HUI_DATA_DIR", os.path.join(os.getcwd(), "data"))
    os.makedirs(base, exist_ok=True)
    return os.path.join(base, "roles.json")


def _load_custom() -> Dict[str, str]:
    path = _data_path()
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
        except Exception:
            return {}


def _save_custom(custom: Dict[str, str]) -> None:
    path = _data_path()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(custom, f, ensure_ascii=False, indent=2)


def list_roles() -> Dict[str, str]:
    with _LOCK:
        return {**BUILT_IN_ROLES, **_load_custom()}


def add_or_update_role(key: str, description: str) -> None:
    with _LOCK:
        custom = _load_custom()
        custom[key] = description
        _save_custom(custom)


def remove_role(key: str) -> None:
    with _LOCK:
        custom = _load_custom()
        if key in custom:
            custom.pop(key)
            _save_custom(custom)


# Role overrides (model_id -> role_key)
def _ovr_path() -> str:
    base = os.getenv("HUI_DATA_DIR", os.path.join(os.getcwd(), "data"))
    os.makedirs(base, exist_ok=True)
    return os.path.join(base, "role_overrides.json")


def _load_overrides() -> Dict[str, str]:
    path = _ovr_path()
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            return data if isinstance(data, dict) else {}
        except Exception:
            return {}


def _save_overrides(mapping: Dict[str, str]) -> None:
    path = _ovr_path()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)


def list_overrides() -> Dict[str, str]:
    with _LOCK:
        return _load_overrides()


def set_override(model_id: str, role_key: str) -> None:
    with _LOCK:
        mapping = _load_overrides()
        mapping[model_id] = role_key
        _save_overrides(mapping)


def clear_override(model_id: str) -> None:
    with _LOCK:
        mapping = _load_overrides()
        if model_id in mapping:
            mapping.pop(model_id)
            _save_overrides(mapping)


