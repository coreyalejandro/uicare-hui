from __future__ import annotations

import os
from typing import Dict


def suggest_unsloth_command(
    *,
    input_jsonl: str,
    output_dir: str,
    base_model: str = "meta-llama/Meta-Llama-3.1-8B-Instruct",
    lora_rank: int = 16,
    learning_rate: float = 2e-4,
    epochs: int = 3,
    batch_size: int = 2,
    use_8bit: bool = True,
) -> str:
    os.makedirs(output_dir, exist_ok=True)
    cmd = (
        "unsloth train "
        f"--base {base_model} "
        f"--dataset {input_jsonl} "
        f"--output_dir {output_dir} "
        f"--lora_r {lora_rank} "
        f"--learning_rate {learning_rate} "
        f"--num_epochs {epochs} "
        f"--batch_size {batch_size} "
        + ("--load_in_8bit " if use_8bit else "")
    ).strip()
    return cmd


