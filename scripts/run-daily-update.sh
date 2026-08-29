#!/bin/zsh
set -euo pipefail

project_dir='/Users/pankajahuja/Documents/Projects/4cuf'
codex_bin='/Users/pankajahuja/.local/bin/codex'

cd "$project_dir"
exec "$codex_bin" exec \
  --search \
  --ephemeral \
  --approve-for-me \
  --sandbox workspace-write \
  --cd "$project_dir" \
  - < "$project_dir/DAILY_TASK_PROMPT.md"
