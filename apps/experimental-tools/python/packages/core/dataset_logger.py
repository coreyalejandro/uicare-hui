"""
Robust dataset logger for Hui Council sessions.

Thread-safe, fault-tolerant JSONL logging that never breaks the main application.
"""

from __future__ import annotations

import json
import os
import sys
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Import at module level for performance
# Use global variables that can be reassigned if imports fail initially
_get_report_template_func = None
_role_store_module = None

try:
    from packages.core.report_templates import get_report_template as _get_report_template_func
    from packages.core import roles as _role_store_module
except ImportError:
    # Will try to import later if needed
    pass


# Thread-safe file writing
_file_locks: Dict[str, threading.Lock] = {}
_global_lock = threading.Lock()


def _get_data_dir() -> Path:
    """Get or create data directory for logs."""
    base = os.getenv("HUI_DATA_DIR", os.path.join(os.getcwd(), "data"))
    data_dir = Path(base) / "sessions"
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


def _get_log_file_path() -> Path:
    """Get log file path with date-based naming."""
    data_dir = _get_data_dir()
    today = datetime.now().strftime("%Y-%m-%d")
    return data_dir / f"sessions_{today}.jsonl"


def _get_file_lock(filepath: str) -> threading.Lock:
    """Get or create thread lock for a file."""
    with _global_lock:
        if filepath not in _file_locks:
            _file_locks[filepath] = threading.Lock()
        return _file_locks[filepath]


def log_council_session(
    prompt: str,
    research_context: str,
    model_responses: List[Dict[str, str]],
    report_type: Optional[str] = None,
    role_assignments: Optional[Dict[str, str]] = None,
    research_depth: str = "standard",
) -> bool:
    """
    Log a council session to JSONL file.
    
    Args:
        prompt: The user's question/prompt
        research_context: Research results gathered
        model_responses: List of dicts with keys: model_id, model_name, role, response
        report_type: Optional report template type (e.g., "enhancement_plan_v1")
        role_assignments: Optional dict mapping model_id -> role_key
        research_depth: Research depth used ("standard" or "deep")
    
    Returns:
        True if logging succeeded, False otherwise (never raises)
    
    Thread-safe and fault-tolerant. Never raises exceptions.
    """
    try:
        log_file = _get_log_file_path()
        filepath_str = str(log_file)
        lock = _get_file_lock(filepath_str)
        
        # Build instruction/input for training format
        instruction_parts = []
        if report_type:
            try:
                # Use cached import or try to import
                global _get_report_template_func
                get_template_func = _get_report_template_func
                if get_template_func is None:
                    repo_root = Path(__file__).resolve().parents[2]
                    if str(repo_root) not in sys.path:
                        sys.path.insert(0, str(repo_root))
                    from packages.core.report_templates import get_report_template as get_template_func
                    # Cache for next time
                    _get_report_template_func = get_template_func
                
                template = get_template_func(report_type)
                instruction_parts.append(
                    f"You must produce a structured report following this exact Markdown template. "
                    f"Fill all sections. Keep headings.\n\n{template}"
                )
            except Exception as e:
                # Continue without template if it fails
                print(f"[DatasetLogger] Could not load template {report_type}: {e}", flush=True)
        
        if role_assignments:
            role_desc_parts = []
            try:
                # Use cached import or try to import
                global _role_store_module
                role_mod = _role_store_module
                if role_mod is None:
                    repo_root = Path(__file__).resolve().parents[2]
                    if str(repo_root) not in sys.path:
                        sys.path.insert(0, str(repo_root))
                    from packages.core import roles as role_mod
                    # Cache for next time
                    _role_store_module = role_mod
                
                roles_map = role_mod.list_roles()
                for model_id, role_key in role_assignments.items():
                    role_desc = roles_map.get(role_key, "")
                    if role_desc:
                        role_desc_parts.append(f"{model_id}: {role_desc}")
            except Exception as e:
                # Continue without roles if lookup fails
                print(f"[DatasetLogger] Could not load roles: {e}", flush=True)
            
            if role_desc_parts:
                instruction_parts.append("Your role: " + " | ".join(role_desc_parts))
        
        instruction = "\n\n".join(instruction_parts) if instruction_parts else "Provide expert analysis with clear reasoning and evidence."
        
        # Build input context
        input_context = f"Prompt:\n{prompt}\n\nResearch ({research_depth}):\n{research_context}"
        
        # Log each model's response as a separate training example
        with lock:
            with open(log_file, "a", encoding="utf-8", newline="\n") as f:
                for model_resp in model_responses:
                    if not model_resp.get("response"):
                        continue  # Skip failed responses
                    
                    # Format for training: instruction + input -> output
                    # Ensure response is a string and not empty
                    response_text = str(model_resp["response"]).strip()
                    if not response_text:
                        continue  # Skip empty responses
                    
                    record = {
                        "instruction": instruction,
                        "input": input_context,
                        "output": response_text,
                        # Also include in format expected by eval.py
                        "response": response_text,
                        "text": response_text,
                        "final": response_text,
                        # Metadata
                        "metadata": {
                            "timestamp": datetime.now().isoformat(),
                            "model_id": str(model_resp.get("model_id", "unknown")),
                            "model_name": str(model_resp.get("model_name", "unknown")),
                            "role": str(model_resp.get("role", "standard")),
                            "report_type": str(report_type) if report_type else None,
                            "research_depth": str(research_depth),
                            "prompt": str(prompt)[:200],  # Truncated for reference
                        },
                    }
                    
                    # Ensure JSON serialization works
                    try:
                        json_line = json.dumps(record, ensure_ascii=False)
                    except (TypeError, ValueError) as json_err:
                        # Skip records that can't be serialized
                        print(f"[DatasetLogger] Skipping record due to JSON error: {json_err}", flush=True)
                        continue
                    
                    f.write(json_line + "\n")
                    f.flush()  # Ensure immediate write
                    os.fsync(f.fileno())  # Force write to disk
        
        return True
        
    except Exception as e:
        # Silent failure - never break the main app
        # In production, you might want to log to a separate error log
        print(f"[DatasetLogger] Failed to log session (non-fatal): {e}", flush=True)
        return False


def get_log_stats() -> Dict[str, int]:
    """
    Get statistics about logged sessions.
    
    Returns:
        Dict with keys: total_files, total_lines, today_lines
    """
    try:
        data_dir = _get_data_dir()
        log_files = list(data_dir.glob("sessions_*.jsonl"))
        
        total_lines = 0
        today_lines = 0
        today_file = _get_log_file_path()
        
        for log_file in log_files:
            try:
                with open(log_file, "r", encoding="utf-8") as f:
                    lines = sum(1 for line in f if line.strip())
                    total_lines += lines
                    if log_file == today_file:
                        today_lines = lines
            except Exception:
                continue
        
        return {
            "total_files": len(log_files),
            "total_lines": total_lines,
            "today_lines": today_lines,
        }
    except Exception:
        return {"total_files": 0, "total_lines": 0, "today_lines": 0}
