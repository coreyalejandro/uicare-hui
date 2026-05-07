"""
Format handlers for ingesting training data from multiple formats.

Supports: JSONL, JSON (single object or array), CSV
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Dict, Iterator, List, Optional, Tuple


def detect_format(filepath: str) -> str:
    """
    Detect file format based on extension and content.
    
    Args:
        filepath: Path to the file
    
    Returns:
        Format string: 'jsonl', 'json', 'csv', or 'unknown'
    """
    path = Path(filepath)
    ext = path.suffix.lower()
    
    if ext == ".jsonl":
        return "jsonl"
    elif ext == ".json":
        return "json"
    elif ext == ".csv":
        return "csv"
    else:
        # Try to detect by content
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                first_line = f.readline().strip()
                if first_line.startswith("{") or first_line.startswith("["):
                    # Could be JSON or JSONL
                    try:
                        json.loads(first_line)
                        return "jsonl"  # If first line is valid JSON, assume JSONL
                    except json.JSONDecodeError:
                        # Try reading whole file as JSON
                        f.seek(0)
                        content = f.read()
                        json.loads(content)
                        return "json"
                elif "," in first_line:
                    return "csv"
        except Exception:
            pass
        
        return "unknown"


def parse_jsonl(filepath: str) -> Iterator[Tuple[int, Optional[Dict], Optional[str]]]:
    """
    Parse JSONL file, yielding (line_num, record, error) tuples.
    
    Args:
        filepath: Path to JSONL file
    
    Yields:
        Tuple of (line_num, record_dict, error_message)
    """
    with open(filepath, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            
            try:
                record = json.loads(line)
                if not isinstance(record, dict):
                    yield line_num, None, f"Line {line_num}: Record is not a dictionary"
                    continue
                yield line_num, record, None
            except json.JSONDecodeError as e:
                yield line_num, None, f"Line {line_num}: Invalid JSON - {e}"


def parse_json(filepath: str) -> Iterator[Tuple[int, Optional[Dict], Optional[str]]]:
    """
    Parse JSON file (single object or array of objects).
    
    Args:
        filepath: Path to JSON file
    
    Yields:
        Tuple of (index, record_dict, error_message)
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = json.load(f)
            
            if isinstance(content, dict):
                # Single object
                yield 1, content, None
            elif isinstance(content, list):
                # Array of objects
                for idx, item in enumerate(content, start=1):
                    if not isinstance(item, dict):
                        yield idx, None, f"Item {idx}: Not a dictionary"
                        continue
                    yield idx, item, None
            else:
                yield 1, None, f"Root element must be an object or array, got {type(content).__name__}"
    except json.JSONDecodeError as e:
        yield 1, None, f"Invalid JSON file: {e}"
    except Exception as e:
        yield 1, None, f"Error reading JSON file: {e}"


def parse_csv(
    filepath: str,
    instruction_col: Optional[str] = None,
    input_col: Optional[str] = None,
    output_col: Optional[str] = None,
    auto_detect: bool = True,
) -> Iterator[Tuple[int, Optional[Dict], Optional[str]]]:
    """
    Parse CSV file and map columns to instruction/input/output format.
    
    Args:
        filepath: Path to CSV file
        instruction_col: Column name for instruction (or auto-detect if None)
        input_col: Column name for input (or auto-detect if None)
        output_col: Column name for output (or auto-detect if None)
        auto_detect: If True, try to auto-detect column mappings
    
    Yields:
        Tuple of (row_num, record_dict, error_message)
    """
    try:
        with open(filepath, "r", encoding="utf-8", newline="") as f:
            # Try to detect delimiter
            sample = f.read(1024)
            f.seek(0)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter
            
            reader = csv.DictReader(f, delimiter=delimiter)
            
            # Get column names
            if not reader.fieldnames:
                yield 1, None, "CSV file has no headers"
                return
            
            columns = list(reader.fieldnames)
            
            # Auto-detect column mappings if not provided
            if auto_detect:
                if not instruction_col:
                    # Try common names
                    for alias in ["instruction", "prompt", "query", "question", "task"]:
                        if alias.lower() in [c.lower() for c in columns]:
                            instruction_col = next(c for c in columns if c.lower() == alias.lower())
                            break
                
                if not input_col:
                    for alias in ["input", "context", "data", "text"]:
                        if alias.lower() in [c.lower() for c in columns]:
                            input_col = next(c for c in columns if c.lower() == alias.lower())
                            break
                
                if not output_col:
                    for alias in ["output", "response", "answer", "completion", "result", "target"]:
                        if alias.lower() in [c.lower() for c in columns]:
                            output_col = next(c for c in columns if c.lower() == alias.lower())
                            break
            
            # Validate required columns
            if not instruction_col or instruction_col not in columns:
                yield 1, None, f"Instruction column not found. Available columns: {', '.join(columns)}"
                return
            
            if not output_col or output_col not in columns:
                yield 1, None, f"Output column not found. Available columns: {', '.join(columns)}"
                return
            
            # Input column is optional
            if input_col and input_col not in columns:
                yield 1, None, f"Input column '{input_col}' not found. Available columns: {', '.join(columns)}"
                return
            
            # Parse rows
            for row_num, row in enumerate(reader, start=2):  # Start at 2 (row 1 is header)
                try:
                    record = {
                        "instruction": str(row[instruction_col]).strip() if row.get(instruction_col) else "",
                        "output": str(row[output_col]).strip() if row.get(output_col) else "",
                    }
                    
                    # Add input if column exists
                    if input_col and row.get(input_col):
                        record["input"] = str(row[input_col]).strip()
                    else:
                        record["input"] = ""
                    
                    # Add any other columns as metadata
                    metadata = {}
                    for col in columns:
                        if col not in [instruction_col, input_col, output_col]:
                            if row.get(col):
                                metadata[col] = str(row[col]).strip()
                    
                    if metadata:
                        record["metadata"] = metadata
                    
                    yield row_num, record, None
                    
                except Exception as e:
                    yield row_num, None, f"Row {row_num}: Error parsing row - {e}"
    
    except Exception as e:
        yield 1, None, f"Error reading CSV file: {e}"


def parse_file(
    filepath: str,
    format: Optional[str] = None,
    csv_instruction_col: Optional[str] = None,
    csv_input_col: Optional[str] = None,
    csv_output_col: Optional[str] = None,
    csv_auto_detect: bool = True,
) -> Iterator[Tuple[int, Optional[Dict], Optional[str]]]:
    """
    Parse a file in any supported format.
    
    Args:
        filepath: Path to the file
        format: Format override ('jsonl', 'json', 'csv', or None for auto-detect)
        csv_instruction_col: CSV column name for instruction
        csv_input_col: CSV column name for input
        csv_output_col: CSV column name for output
        csv_auto_detect: Auto-detect CSV column mappings
    
    Yields:
        Tuple of (line_num, record_dict, error_message)
    """
    detected_format = format or detect_format(filepath)
    
    if detected_format == "jsonl":
        yield from parse_jsonl(filepath)
    elif detected_format == "json":
        yield from parse_json(filepath)
    elif detected_format == "csv":
        yield from parse_csv(
            filepath,
            instruction_col=csv_instruction_col,
            input_col=csv_input_col,
            output_col=csv_output_col,
            auto_detect=csv_auto_detect,
        )
    else:
        yield 1, None, f"Unsupported format: {detected_format}. Supported: jsonl, json, csv"


def get_file_info(filepath: str) -> Dict[str, any]:
    """
    Get information about a file (format, columns if CSV, etc.).
    
    Args:
        filepath: Path to the file
    
    Returns:
        Dict with file information
    """
    info = {
        "path": filepath,
        "format": detect_format(filepath),
        "exists": Path(filepath).exists(),
    }
    
    if info["format"] == "csv" and info["exists"]:
        try:
            with open(filepath, "r", encoding="utf-8", newline="") as f:
                sample = f.read(1024)
                f.seek(0)
                sniffer = csv.Sniffer()
                delimiter = sniffer.sniff(sample).delimiter
                reader = csv.DictReader(f, delimiter=delimiter)
                info["columns"] = list(reader.fieldnames) if reader.fieldnames else []
        except Exception:
            info["columns"] = []
    
    return info
