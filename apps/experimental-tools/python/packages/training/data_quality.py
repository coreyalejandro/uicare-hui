"""
Data quality utilities for fine-tuning pipeline.

Provides validation, normalization, cleaning, and quality metrics for training data.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from typing import Any, Callable, Dict, List, Optional, Set, Tuple, Union


# Required fields for training data
REQUIRED_FIELDS = {"instruction", "input", "output"}

# Alternative field names that can be normalized
FIELD_ALIASES = {
    "prompt": "instruction",
    "query": "instruction",
    "question": "instruction",
    "context": "input",
    "text": "output",
    "response": "output",
    "answer": "output",
    "final": "output",
    "completion": "output",
}

# Default schema definition for training data
DEFAULT_SCHEMA = {
    "instruction": {
        "type": str,
        "required": True,
        "min_length": 1,
        "max_length": 10000,
        "description": "The instruction or prompt for the model",
    },
    "input": {
        "type": str,
        "required": True,
        "min_length": 0,  # Can be empty
        "max_length": 50000,
        "description": "The input context (can be empty)",
    },
    "output": {
        "type": str,
        "required": True,
        "min_length": 1,
        "max_length": 50000,
        "description": "The expected output or response",
    },
}


def validate_jsonl_line(line: str, line_num: int) -> Tuple[bool, Optional[Dict], Optional[str]]:
    """
    Validate a single JSONL line.
    
    Args:
        line: The JSONL line to validate
        line_num: Line number for error reporting
    
    Returns:
        Tuple of (is_valid, parsed_record, error_message)
    """
    line = line.strip()
    if not line:
        return False, None, "Empty line"
    
    try:
        record = json.loads(line)
    except json.JSONDecodeError as e:
        return False, None, f"Invalid JSON at line {line_num}: {e}"
    
    if not isinstance(record, dict):
        return False, None, f"Record is not a dictionary at line {line_num}"
    
    return True, record, None


def normalize_field_names(record: Dict) -> Dict:
    """
    Normalize field names to standard format (instruction, input, output).
    
    Args:
        record: Input record with potentially non-standard field names
    
    Returns:
        Record with normalized field names
    """
    normalized = {}
    
    # Normalize known aliases
    for key, value in record.items():
        normalized_key = FIELD_ALIASES.get(key.lower(), key)
        # Preserve original if already standard, otherwise use normalized
        if normalized_key not in normalized:
            normalized[normalized_key] = value
        else:
            # If both exist, prefer the more standard name
            if key.lower() in FIELD_ALIASES:
                normalized[normalized_key] = value
    
    # Copy any remaining fields (metadata, etc.)
    for key, value in record.items():
        if key not in normalized:
            normalized[key] = value
    
    return normalized


def normalize_field_value(value: Any, field_name: str) -> Any:
    """
    Normalize a field value to ensure consistent format and type.
    
    Args:
        value: Value to normalize
        field_name: Name of the field (for context-specific normalization)
    
    Returns:
        Normalized value
    """
    # Handle None/null values
    if value is None:
        return ""
    
    # Convert to string for text fields
    if field_name in REQUIRED_FIELDS:
        if not isinstance(value, str):
            # Convert non-string to string representation
            value = str(value)
        
        # Ensure it's not empty after conversion
        if not value.strip():
            return ""
        
        return value
    
    # For non-text fields, preserve type but normalize strings
    if isinstance(value, str):
        return value.strip()
    
    return value


def normalize_record(record: Dict, normalize_values: bool = True, preserve_metadata: bool = True) -> Dict:
    """
    Comprehensive record normalization: field names, values, formats, and types.
    
    This function performs:
    1. Field name normalization (aliases -> standard names)
    2. Value normalization (type consistency, format standardization)
    3. Format standardization (whitespace, encoding)
    4. Type consistency (ensure required fields are strings)
    
    Args:
        record: Input record to normalize
        normalize_values: Whether to normalize field values (default: True)
        preserve_metadata: Whether to preserve metadata fields (default: True)
    
    Returns:
        Fully normalized record
    """
    if not isinstance(record, dict):
        return {}
    
    # Step 1: Normalize field names
    normalized = normalize_field_names(record)
    
    # Step 2: Normalize values
    result = {}
    metadata = {}
    
    for key, value in normalized.items():
        # Separate metadata from core fields
        if preserve_metadata and key == "metadata" and isinstance(value, dict):
            metadata[key] = value
            continue
        
        # Normalize core field values
        if normalize_values:
            normalized_value = normalize_field_value(value, key)
        else:
            normalized_value = value
        
        # Ensure required fields are strings and non-empty
        if key in REQUIRED_FIELDS:
            if not isinstance(normalized_value, str):
                normalized_value = str(normalized_value) if normalized_value is not None else ""
            # Remove empty required fields (will be caught by validation)
            if not normalized_value.strip():
                normalized_value = ""
        
        result[key] = normalized_value
    
    # Step 3: Ensure required fields exist (even if empty)
    for field in REQUIRED_FIELDS:
        if field not in result:
            result[field] = ""
    
    # Step 4: Restore metadata if preserved
    if preserve_metadata and metadata:
        result.update(metadata)
    
    return result


def validate_schema(
    record: Dict,
    line_num: int,
    schema: Optional[Dict[str, Dict[str, Any]]] = None,
    strict: bool = False,
) -> Tuple[bool, Optional[str], Optional[List[str]]]:
    """
    Comprehensive schema validation with type checking, value constraints, and custom rules.
    
    Validates:
    - Required fields presence
    - Field types (str, int, float, bool, dict, list)
    - Value constraints (min_length, max_length, min_value, max_value)
    - Pattern matching (regex)
    - Custom validation functions
    
    Args:
        record: Record to validate
        line_num: Line number for error reporting
        schema: Custom schema definition (defaults to DEFAULT_SCHEMA)
        strict: If True, reject records with extra fields not in schema
    
    Returns:
        Tuple of (is_valid, error_message, detailed_errors)
        - is_valid: True if record passes all validations
        - error_message: Summary error message (None if valid)
        - detailed_errors: List of specific validation errors (None if valid)
    
    Example:
        >>> record = {"instruction": "Test", "input": "", "output": "Result"}
        >>> is_valid, error, details = validate_schema(record, line_num=1)
        >>> print(is_valid)
        True
        
        >>> # Custom schema with constraints
        >>> custom_schema = {
        ...     "instruction": {
        ...         "type": str,
        ...         "required": True,
        ...         "min_length": 10,
        ...         "max_length": 1000,
        ...         "pattern": r"^[A-Z]",  # Must start with capital
        ...     },
        ...     "output": {
        ...         "type": str,
        ...         "required": True,
        ...         "min_length": 5,
        ...         "validator": lambda x: (len(x.split()) > 3, "Must have more than 3 words"),
        ...     }
        ... }
        >>> record = {"instruction": "test", "output": "hi"}
        >>> is_valid, error, details = validate_schema(record, line_num=1, schema=custom_schema)
        >>> print(is_valid)
        False
        >>> print(details)
        ["Field 'instruction' too short: 4 chars (minimum 10)", ...]
    """
    if schema is None:
        schema = DEFAULT_SCHEMA
    
    errors = []
    
    # Check for extra fields in strict mode
    if strict:
        schema_fields = set(schema.keys())
        record_fields = set(record.keys())
        extra_fields = record_fields - schema_fields
        if extra_fields:
            errors.append(f"Unexpected fields: {', '.join(sorted(extra_fields))}")
    
    # Validate each field in schema
    for field_name, field_schema in schema.items():
        field_value = record.get(field_name)
        is_required = field_schema.get("required", False)
        
        # Check required fields
        if is_required:
            if field_name not in record:
                errors.append(f"Missing required field '{field_name}'")
                continue
            if field_value is None:
                errors.append(f"Required field '{field_name}' is None")
                continue
        
        # Skip validation if field is not present and not required
        if field_name not in record or field_value is None:
            continue
        
        # Type validation
        expected_type = field_schema.get("type")
        if expected_type:
            if not isinstance(field_value, expected_type):
                errors.append(
                    f"Field '{field_name}' has wrong type: expected {expected_type.__name__}, "
                    f"got {type(field_value).__name__}"
                )
                continue
        
        # String-specific validations
        if isinstance(field_value, str):
            # Length constraints
            min_length = field_schema.get("min_length")
            max_length = field_schema.get("max_length")
            
            if min_length is not None and len(field_value) < min_length:
                errors.append(
                    f"Field '{field_name}' too short: {len(field_value)} chars "
                    f"(minimum {min_length})"
                )
            
            if max_length is not None and len(field_value) > max_length:
                errors.append(
                    f"Field '{field_name}' too long: {len(field_value)} chars "
                    f"(maximum {max_length})"
                )
            
            # Pattern matching (regex)
            pattern = field_schema.get("pattern")
            if pattern:
                if not re.search(pattern, field_value):
                    errors.append(f"Field '{field_name}' does not match required pattern")
            
            # Empty string check (if not allowed)
            if not field_schema.get("allow_empty", True) and not field_value.strip():
                errors.append(f"Field '{field_name}' cannot be empty")
        
        # Numeric validations
        elif isinstance(field_value, (int, float)):
            min_value = field_schema.get("min_value")
            max_value = field_schema.get("max_value")
            
            if min_value is not None and field_value < min_value:
                errors.append(
                    f"Field '{field_name}' value {field_value} below minimum {min_value}"
                )
            
            if max_value is not None and field_value > max_value:
                errors.append(
                    f"Field '{field_name}' value {field_value} above maximum {max_value}"
                )
        
        # Custom validation function
        validator = field_schema.get("validator")
        if validator and callable(validator):
            try:
                result = validator(field_value)
                if isinstance(result, tuple) and len(result) == 2:
                    is_valid, error_msg = result
                    if not is_valid:
                        errors.append(f"Field '{field_name}': {error_msg}")
                elif not result:
                    errors.append(f"Field '{field_name}' failed custom validation")
            except Exception as e:
                errors.append(f"Field '{field_name}' validation error: {e}")
    
    # Check required fields from REQUIRED_FIELDS (backward compatibility)
    for field in REQUIRED_FIELDS:
        if field not in schema and field not in record:
            errors.append(f"Missing required field '{field}'")
        elif field not in schema and field in record:
            value = record[field]
            if not value or (isinstance(value, str) and not value.strip()):
                errors.append(f"Required field '{field}' is empty")
    
    # Return results
    if errors:
        error_summary = f"Schema validation failed at line {line_num}: {errors[0]}"
        if len(errors) > 1:
            error_summary += f" (+ {len(errors) - 1} more)"
        return False, error_summary, errors
    
    return True, None, None


def validate_schema_simple(record: Dict, line_num: int) -> Tuple[bool, Optional[str]]:
    """
    Simple schema validation (backward compatibility wrapper).
    
    Validates that record has required fields with non-empty values.
    
    Args:
        record: Record to validate
        line_num: Line number for error reporting
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    is_valid, error_msg, _ = validate_schema(record, line_num)
    return is_valid, error_msg


def create_custom_schema(
    required_fields: Optional[List[str]] = None,
    optional_fields: Optional[Dict[str, Dict[str, Any]]] = None,
    field_constraints: Optional[Dict[str, Dict[str, Any]]] = None,
) -> Dict[str, Dict[str, Any]]:
    """
    Create a custom schema definition for validation.
    
    Args:
        required_fields: List of required field names (defaults to REQUIRED_FIELDS)
        optional_fields: Dict of optional field definitions
        field_constraints: Dict of field-specific constraints to merge with defaults
    
    Returns:
        Custom schema definition dict
    
    Example:
        schema = create_custom_schema(
            required_fields=["instruction", "output"],
            field_constraints={
                "instruction": {"min_length": 10, "max_length": 1000},
                "output": {"pattern": r"^[A-Z]"}  # Must start with capital
            }
        )
    """
    schema = {}
    
    # Use provided required fields or defaults
    fields_to_validate = set(required_fields) if required_fields else REQUIRED_FIELDS
    
    # Build schema from defaults and custom constraints
    for field in fields_to_validate:
        schema[field] = DEFAULT_SCHEMA.get(field, {}).copy()
        schema[field]["required"] = True
        
        # Merge custom constraints
        if field_constraints and field in field_constraints:
            schema[field].update(field_constraints[field])
    
    # Add optional fields
    if optional_fields:
        for field_name, field_def in optional_fields.items():
            if field_name not in schema:
                schema[field_name] = field_def.copy()
                schema[field_name]["required"] = False
    
    return schema


def clean_text(text: str) -> str:
    """
    Clean text by normalizing whitespace and fixing encoding issues.
    
    Args:
        text: Text to clean
    
    Returns:
        Cleaned text
    """
    if not isinstance(text, str):
        text = str(text)
    
    # Normalize unicode (NFKC: compatibility decomposition + composition)
    text = unicodedata.normalize("NFKC", text)
    
    # Fix common encoding issues
    text = text.replace("\ufeff", "")  # Remove BOM
    text = text.replace("\u200b", "")  # Remove zero-width space
    text = text.replace("\u200c", "")  # Remove zero-width non-joiner
    text = text.replace("\u200d", "")  # Remove zero-width joiner
    
    # Normalize whitespace (multiple spaces -> single space)
    text = re.sub(r"\s+", " ", text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    return text


def clean_record(record: Dict) -> Dict:
    """
    Clean all text fields in a record.
    
    Args:
        record: Record to clean
    
    Returns:
        Cleaned record
    """
    cleaned = {}
    for key, value in record.items():
        if isinstance(value, str):
            cleaned[key] = clean_text(value)
        elif isinstance(value, dict):
            cleaned[key] = clean_record(value)
        elif isinstance(value, list):
            cleaned[key] = [
                clean_record(item) if isinstance(item, dict) else (clean_text(item) if isinstance(item, str) else item)
                for item in value
            ]
        else:
            cleaned[key] = value
    
    return cleaned


def calculate_quality_metrics(record: Dict) -> Dict[str, float]:
    """
    Calculate quality metrics for a record.
    
    Args:
        record: Record to evaluate
    
    Returns:
        Dict with quality metrics (length_score, completeness_score, format_score, overall_score)
    """
    metrics = {}
    
    # Length score (penalize very short or very long)
    instruction_len = len(record.get("instruction", ""))
    input_len = len(record.get("input", ""))
    output_len = len(record.get("output", ""))
    total_len = instruction_len + input_len + output_len
    
    # Reasonable length ranges (adjustable)
    min_reasonable = 50
    max_reasonable = 10000
    
    if total_len < min_reasonable:
        length_score = total_len / min_reasonable  # 0 to 1
    elif total_len > max_reasonable:
        length_score = max(0, 1 - (total_len - max_reasonable) / max_reasonable)
    else:
        length_score = 1.0
    
    metrics["length_score"] = length_score
    
    # Completeness score (all fields present and non-empty)
    completeness = 0.0
    for field in REQUIRED_FIELDS:
        if field in record and record[field] and isinstance(record[field], str) and record[field].strip():
            completeness += 1.0 / len(REQUIRED_FIELDS)
    
    metrics["completeness_score"] = completeness
    
    # Format score (check for basic formatting issues)
    format_score = 1.0
    for field in REQUIRED_FIELDS:
        if field in record:
            text = record[field]
            # Check for excessive whitespace
            if isinstance(text, str):
                if re.search(r"\s{3,}", text):  # 3+ consecutive spaces
                    format_score -= 0.1
                if text.count("\n") > 100:  # Excessive newlines
                    format_score -= 0.1
                if not text.strip():  # Only whitespace
                    format_score -= 0.2
    
    format_score = max(0.0, format_score)
    metrics["format_score"] = format_score
    
    # Overall score (weighted average)
    metrics["overall_score"] = (
        0.4 * length_score + 0.4 * completeness_score + 0.2 * format_score
    )
    
    return metrics


def semantic_deduplication_key(record: Dict) -> str:
    """
    Generate a semantic deduplication key from record content.
    
    This creates a normalized key based on the actual content, not just exact string match.
    
    Args:
        record: Record to generate key for
    
    Returns:
        Normalized semantic key
    """
    # Combine instruction + input + output, normalize, and create hash-like key
    parts = []
    for field in ["instruction", "input", "output"]:
        if field in record:
            text = str(record[field]).lower().strip()
            # Normalize whitespace
            text = re.sub(r"\s+", " ", text)
            parts.append(text)
    
    combined = " ||| ".join(parts)
    # Remove punctuation for better matching
    combined = re.sub(r"[^\w\s]", "", combined)
    return combined


def split_dataset(
    records: List[Dict],
    train_ratio: float = 0.8,
    val_ratio: float = 0.1,
    test_ratio: float = 0.1,
    shuffle: bool = True,
    seed: Optional[int] = None,
) -> Tuple[List[Dict], List[Dict], List[Dict]]:
    """
    Split dataset into train/val/test sets.
    
    Args:
        records: List of records to split
        train_ratio: Ratio for training set
        val_ratio: Ratio for validation set
        test_ratio: Ratio for test set
        shuffle: Whether to shuffle before splitting
        seed: Random seed for reproducibility
    
    Returns:
        Tuple of (train_records, val_records, test_records)
    
    Raises:
        ValueError: If ratios don't sum to 1.0
    """
    if abs(train_ratio + val_ratio + test_ratio - 1.0) > 0.001:
        raise ValueError(f"Ratios must sum to 1.0, got {train_ratio + val_ratio + test_ratio}")
    
    if shuffle:
        import random
        if seed is not None:
            random.seed(seed)
        records = records.copy()
        random.shuffle(records)
    
    total = len(records)
    train_end = int(total * train_ratio)
    val_end = train_end + int(total * val_ratio)
    
    train_records = records[:train_end]
    val_records = records[train_end:val_end]
    test_records = records[val_end:]
    
    return train_records, val_records, test_records


def collect_statistics(records: List[Dict], errors: List[str]) -> Dict:
    """
    Collect statistics about processed records.
    
    Args:
        records: List of valid records
        errors: List of error messages
    
    Returns:
        Dict with statistics
    """
    stats = {
        "total_processed": len(records) + len(errors),
        "valid": len(records),
        "invalid": len(errors),
        "validity_rate": len(records) / (len(records) + len(errors)) if (len(records) + len(errors)) > 0 else 0.0,
    }
    
    if records:
        # Quality metrics
        quality_scores = [calculate_quality_metrics(r)["overall_score"] for r in records]
        stats["avg_quality_score"] = sum(quality_scores) / len(quality_scores)
        stats["min_quality_score"] = min(quality_scores)
        stats["max_quality_score"] = max(quality_scores)
        
        # Length statistics
        lengths = [len(r.get("instruction", "")) + len(r.get("input", "")) + len(r.get("output", "")) for r in records]
        stats["avg_length"] = sum(lengths) / len(lengths)
        stats["min_length"] = min(lengths)
        stats["max_length"] = max(lengths)
        
        # Field presence
        field_presence = defaultdict(int)
        for record in records:
            for field in REQUIRED_FIELDS:
                if field in record and record[field]:
                    field_presence[field] += 1
        
        stats["field_presence"] = {field: field_presence[field] / len(records) for field in REQUIRED_FIELDS}
    else:
        stats["avg_quality_score"] = 0.0
        stats["min_quality_score"] = 0.0
        stats["max_quality_score"] = 0.0
        stats["avg_length"] = 0
        stats["min_length"] = 0
        stats["max_length"] = 0
        stats["field_presence"] = {field: 0.0 for field in REQUIRED_FIELDS}
    
    return stats
