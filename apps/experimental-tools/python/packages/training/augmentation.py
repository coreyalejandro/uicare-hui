"""
Data augmentation utilities for fine-tuning pipeline.

Provides multiple augmentation strategies to increase training data diversity.
"""

from __future__ import annotations

import random
import re
from typing import Dict, List, Optional, Tuple

try:
    from packages.core import roles as role_store
    from packages.core.report_templates import get_report_template
except ImportError:
    role_store = None
    get_report_template = None


# Template variations for instructions
INSTRUCTION_TEMPLATES = {
    "direct": [
        "You must produce a structured report following this exact Markdown template.",
        "Generate a structured report using this Markdown template.",
        "Create a report following the template below.",
        "Produce a report that adheres to this template structure.",
    ],
    "with_context": [
        "Based on the provided context, produce a structured report following this exact Markdown template.",
        "Using the information provided, generate a structured report using this template.",
        "Given the context below, create a report following the template structure.",
    ],
    "with_emphasis": [
        "You must produce a comprehensive structured report following this exact Markdown template. Fill all sections completely.",
        "Generate a detailed structured report using this Markdown template. Ensure all sections are thoroughly completed.",
        "Create a complete report following the template below. All sections must be filled with substantive content.",
    ],
}

# Role variations (common roles for analysis/reporting)
ROLE_VARIATIONS = {
    "standard": [
        "You are an expert analyst.",
        "You are a technical expert.",
        "You are a senior consultant.",
    ],
    "critical": [
        "You are a critical analyst focused on identifying issues and improvements.",
        "You are a technical expert specializing in critical analysis.",
        "You are a senior consultant with expertise in critical evaluation.",
    ],
    "strategic": [
        "You are a strategic analyst focused on high-level planning.",
        "You are a technical expert specializing in strategic thinking.",
        "You are a senior consultant with expertise in strategic planning.",
    ],
    "detailed": [
        "You are a detailed analyst focused on comprehensive analysis.",
        "You are a technical expert specializing in thorough examination.",
        "You are a senior consultant with expertise in detailed assessment.",
    ],
}

# Research depth variations
RESEARCH_DEPTH_VARIATIONS = {
    "standard": ["standard", "comprehensive", "thorough"],
    "deep": ["deep", "extensive", "in-depth", "comprehensive"],
}


def augment_template_variation(record: Dict) -> List[Dict]:
    """
    Generate variations by changing instruction template phrasing.
    
    Args:
        record: Original training record
    
    Returns:
        List of augmented records (including original)
    """
    if "instruction" not in record:
        return [record]
    
    instruction = record["instruction"]
    augmented = [record]  # Include original
    
    # Extract template part if present
    template_match = re.search(r"Markdown template[^\n]*\n\n(.*)", instruction, re.DOTALL)
    if not template_match:
        # Try to find template in different formats
        template_match = re.search(r"template[^\n]*\n\n(.*)", instruction, re.DOTALL)
    
    if template_match:
        template_content = template_match.group(1)
        
        # Generate variations
        for template_type, templates in INSTRUCTION_TEMPLATES.items():
            for template_phrase in templates[:2]:  # Limit to 2 per type
                new_instruction = f"{template_phrase} Fill all sections. Keep headings.\n\n{template_content}"
                new_record = record.copy()
                new_record["instruction"] = new_instruction
                new_record["metadata"] = new_record.get("metadata", {}).copy()
                new_record["metadata"]["augmentation"] = f"template_{template_type}"
                augmented.append(new_record)
    
    return augmented


def augment_role_variation(record: Dict) -> List[Dict]:
    """
    Generate variations by changing role descriptions in instructions.
    
    Args:
        record: Original training record
    
    Returns:
        List of augmented records (including original)
    """
    if "instruction" not in record:
        return [record]
    
    instruction = record["instruction"]
    augmented = [record]  # Include original
    
    # Check if role is mentioned
    role_pattern = r"Your role:?\s*([^\n]+)"
    role_match = re.search(role_pattern, instruction, re.IGNORECASE)
    
    if role_match:
        # Replace with variations
        for role_type, roles in ROLE_VARIATIONS.items():
            for role_desc in roles[:1]:  # One per type
                new_instruction = re.sub(
                    role_pattern,
                    f"Your role: {role_desc}",
                    instruction,
                    flags=re.IGNORECASE
                )
                new_record = record.copy()
                new_record["instruction"] = new_instruction
                new_record["metadata"] = new_record.get("metadata", {}).copy()
                new_record["metadata"]["augmentation"] = f"role_{role_type}"
                augmented.append(new_record)
    else:
        # Add role if not present
        for role_type, roles in ROLE_VARIATIONS.items():
            role_desc = roles[0]
            # Insert after template if present, otherwise at start
            if "Markdown template" in instruction:
                parts = instruction.split("Markdown template", 1)
                new_instruction = f"{parts[0]}Markdown template{parts[1]}\n\nYour role: {role_desc}"
            else:
                new_instruction = f"Your role: {role_desc}\n\n{instruction}"
            
            new_record = record.copy()
            new_record["instruction"] = new_instruction
            new_record["metadata"] = new_record.get("metadata", {}).copy()
            new_record["metadata"]["augmentation"] = f"role_{role_type}_added"
            augmented.append(new_record)
    
    return augmented


def augment_research_depth_variation(record: Dict) -> List[Dict]:
    """
    Generate variations by changing research depth indicators.
    
    Args:
        record: Original training record
    
    Returns:
        List of augmented records (including original)
    """
    if "input" not in record:
        return [record]
    
    input_text = record["input"]
    augmented = [record]  # Include original
    
    # Find research depth indicators
    depth_patterns = [
        r"Research\s*\(([^)]+)\):",
        r"Research\s*Depth:\s*(\w+)",
        r"\(([^)]+)\s*research\)",
    ]
    
    for pattern in depth_patterns:
        matches = list(re.finditer(pattern, input_text, re.IGNORECASE))
        if matches:
            for match in matches:
                current_depth = match.group(1).lower()
                
                # Get variations for this depth
                if "deep" in current_depth or "extensive" in current_depth:
                    variations = RESEARCH_DEPTH_VARIATIONS["deep"]
                else:
                    variations = RESEARCH_DEPTH_VARIATIONS["standard"]
                
                for depth_var in variations[:2]:  # Limit variations
                    new_input = input_text[:match.start()] + match.group(0).replace(
                        match.group(1), depth_var
                    ) + input_text[match.end():]
                    
                    new_record = record.copy()
                    new_record["input"] = new_input
                    new_record["metadata"] = new_record.get("metadata", {}).copy()
                    new_record["metadata"]["augmentation"] = f"research_depth_{depth_var}"
                    augmented.append(new_record)
            break  # Only process first match
    
    return augmented


def augment_instruction_paraphrase(record: Dict, simple: bool = True) -> List[Dict]:
    """
    Generate variations by paraphrasing instruction text (simple word-level).
    
    Args:
        record: Original training record
        simple: If True, use simple synonym replacement; if False, use LLM
    
    Returns:
        List of augmented records (including original)
    """
    if "instruction" not in record:
        return [record]
    
    instruction = record["instruction"]
    augmented = [record]  # Include original
    
    if simple:
        # Simple word-level paraphrasing
        paraphrases = {
            "must": ["should", "need to", "are required to"],
            "produce": ["generate", "create", "develop"],
            "structured": ["organized", "formatted", "systematic"],
            "report": ["analysis", "document", "assessment"],
            "following": ["using", "adhering to", "based on"],
            "exact": ["precise", "specific", "detailed"],
            "template": ["format", "structure", "outline"],
            "fill": ["complete", "populate", "provide content for"],
            "sections": ["parts", "components", "segments"],
        }
        
        # Simple replacement (limited to avoid breaking meaning)
        for word, synonyms in list(paraphrases.items())[:3]:  # Limit to 3 words
            if word in instruction.lower():
                for synonym in synonyms[:1]:  # One synonym per word
                    new_instruction = re.sub(
                        r"\b" + re.escape(word) + r"\b",
                        synonym,
                        instruction,
                        flags=re.IGNORECASE,
                        count=1
                    )
                    if new_instruction != instruction:
                        new_record = record.copy()
                        new_record["instruction"] = new_instruction
                        new_record["metadata"] = new_record.get("metadata", {}).copy()
                        new_record["metadata"]["augmentation"] = f"paraphrase_simple_{word}"
                        augmented.append(new_record)
    
    return augmented


def augment_cot_self_instruct(record: Dict, seed_records: Optional[List[Dict]] = None) -> List[Dict]:
    """
    Generate variations using CoT-Self-Instruct methodology.
    
    This is a simplified version - full implementation would require:
    1. Pattern extraction from seed data
    2. CoT reasoning chain
    3. Quality validation
    
    Args:
        record: Original training record
        seed_records: Optional seed records for pattern extraction
    
    Returns:
        List of augmented records
    """
    augmented = []
    
    # Extract patterns from record
    instruction = record.get("instruction", "")
    input_text = record.get("input", "")
    
    # Simple pattern-based variations
    # In full implementation, this would use CoT reasoning
    
    # Variation 1: Emphasize different aspects
    if "template" in instruction.lower():
        emphasis_variations = [
            "Focus on completeness and detail.",
            "Emphasize clarity and precision.",
            "Prioritize actionable insights.",
        ]
        
        for emphasis in emphasis_variations:
            new_instruction = instruction + "\n\n" + emphasis
            new_record = record.copy()
            new_record["instruction"] = new_instruction
            new_record["metadata"] = new_record.get("metadata", {}).copy()
            new_record["metadata"]["augmentation"] = "cot_emphasis"
            augmented.append(new_record)
    
    # Variation 2: Add reasoning steps
    if input_text:
        reasoning_prompts = [
            "\n\nThink step by step:",
            "\n\nConsider the following:",
            "\n\nAnalyze systematically:",
        ]
        
        for prompt in reasoning_prompts[:1]:  # Limit
            new_input = input_text + prompt
            new_record = record.copy()
            new_record["input"] = new_input
            new_record["metadata"] = new_record.get("metadata", {}).copy()
            new_record["metadata"]["augmentation"] = "cot_reasoning"
            augmented.append(new_record)
    
    return augmented if augmented else [record]


def augment_training_data(
    records: List[Dict],
    methods: List[str] = ["template", "role", "research_depth"],
    augmentation_factor: float = 1.5,
    max_per_record: int = 3,
) -> Tuple[List[Dict], Dict]:
    """
    Augment training data using specified methods.
    
    Args:
        records: List of training records
        methods: List of augmentation methods to use
            Options: "template", "role", "research_depth", "paraphrase", "cot"
        augmentation_factor: Target multiplier (1.5 = 50% increase)
        max_per_record: Maximum augmentations per original record
    
    Returns:
        Tuple of (augmented_records, statistics_dict)
    """
    augmented_records = []
    stats = {
        "original_count": len(records),
        "augmented_count": 0,
        "methods_used": methods,
        "by_method": {},
    }
    
    # Method mapping
    method_functions = {
        "template": augment_template_variation,
        "role": augment_role_variation,
        "research_depth": augment_research_depth_variation,
        "paraphrase": lambda r: augment_instruction_paraphrase(r, simple=True),
        "cot": augment_cot_self_instruct,
    }
    
    # Calculate target count
    target_count = int(len(records) * augmentation_factor)
    
    # Augment each record
    for record in records:
        # Always include original
        augmented_records.append(record)
        
        # Generate variations
        variations = []
        for method in methods:
            if method in method_functions:
                func = method_functions[method]
                try:
                    new_variations = func(record)
                    # Exclude original from variations
                    new_variations = [v for v in new_variations if v != record]
                    variations.extend(new_variations)
                    
                    # Track stats
                    if method not in stats["by_method"]:
                        stats["by_method"][method] = 0
                    stats["by_method"][method] += len(new_variations)
                except Exception:
                    # Skip if augmentation fails
                    continue
        
        # Limit variations per record
        if variations:
            random.shuffle(variations)
            variations = variations[:max_per_record]
            augmented_records.extend(variations)
            stats["augmented_count"] += len(variations)
    
    # If we haven't reached target, randomly duplicate some augmented records
    if len(augmented_records) < target_count and augmented_records:
        needed = target_count - len(augmented_records)
        # Sample from augmented (non-original) records
        augmented_only = [r for r in augmented_records if r.get("metadata", {}).get("augmentation")]
        if augmented_only:
            samples = random.sample(augmented_only * (needed // len(augmented_only) + 1), needed)
            augmented_records.extend(samples)
            stats["augmented_count"] += len(samples)
    
    stats["final_count"] = len(augmented_records)
    stats["augmentation_rate"] = stats["final_count"] / stats["original_count"] if stats["original_count"] > 0 else 0
    
    return augmented_records, stats
