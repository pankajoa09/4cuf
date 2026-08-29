#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_dir=${script_dir:h}
codex_bin='/Users/pankajahuja/.local/bin/codex'

cd "$project_dir"
exec "$codex_bin" --search exec \
  --ephemeral \
  --approve-for-me \
  --config 'model_reasoning_effort="medium"' \
  --cd "$project_dir" \
  - < "$project_dir/DAILY_TASK_PROMPT.md"
