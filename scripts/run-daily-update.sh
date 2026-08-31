#!/bin/zsh
set -euo pipefail

script_dir=${0:A:h}
project_dir=${script_dir:h}
codex_bin='/Users/pankajahuja/.local/bin/codex'

cd "$project_dir"

if [[ -n "$(git status --porcelain)" ]]; then
  print -u2 'Daily update aborted: the automation checkout is not clean.'
  exit 1
fi

git pull --ff-only

exec "$codex_bin" --search exec \
  --ephemeral \
  --approve-for-me \
  --config 'model_reasoning_effort="medium"' \
  --cd "$project_dir" \
  - < "$project_dir/DAILY_TASK_PROMPT.md"
