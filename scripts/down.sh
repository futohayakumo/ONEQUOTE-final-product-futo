#!/usr/bin/env bash
# Stop the site and the API. PostgreSQL is left running; it costs nothing
# idle and holds the quotations issued.
for port in 3000 4000; do
  pids=$(lsof -ti ":$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill 2>/dev/null || true
    echo "stopped :$port"
  else
    echo "nothing on :$port"
  fi
done
