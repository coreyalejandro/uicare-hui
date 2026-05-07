from __future__ import annotations

import json
from typing import Dict, List, Tuple

from packages.core.report_templates import get_report_template


def _template_headings(report_type: str) -> List[str]:
    tpl = get_report_template(report_type)
    heads: List[str] = []
    for line in tpl.splitlines():
        line = line.strip()
        if line.startswith("# ") or line.startswith("## ") or line.startswith("### "):
            heads.append(line)
    return heads


def _extract_output(record: Dict) -> str:
    for key in ("final", "output", "text", "response"):
        if key in record and isinstance(record[key], str):
            return record[key]
    return ""


def evaluate_structured_reports(
    input_jsonl: str,
    report_type: str = "enhancement_plan_v1",
    pass_threshold: float = 0.7,
) -> Dict:
    required = _template_headings(report_type)
    total = 0
    passes = 0
    coverages: List[float] = []
    missing_counts: Dict[str, int] = {h: 0 for h in required}

    with open(input_jsonl, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except Exception:
                continue
            total += 1
            out = _extract_output(obj)
            present = [h for h in required if h in out]
            coverage = len(present) / max(1, len(required))
            coverages.append(coverage)
            if coverage >= pass_threshold:
                passes += 1
            for h in required:
                if h not in present:
                    missing_counts[h] += 1

    avg_cov = sum(coverages) / len(coverages) if coverages else 0.0
    result = {
        "total": total,
        "passes": passes,
        "pass_rate": (passes / total) if total else 0.0,
        "avg_coverage": avg_cov,
        "report_type": report_type,
        "pass_threshold": pass_threshold,
        "required_headings": required,
        "missing_counts": missing_counts,
    }
    return result


def save_report(report: Dict, output_path: str) -> None:
    with open(output_path, "w", encoding="utf-8") as w:
        json.dump(report, w, ensure_ascii=False, indent=2)


