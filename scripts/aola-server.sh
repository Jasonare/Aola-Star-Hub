#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="${AOLA_SERVER_PID_FILE:-"$ROOT_DIR/.aola-server.pid"}"
LOG_FILE="${AOLA_SERVER_LOG_FILE:-"$ROOT_DIR/server.log"}"
PORT_VALUE="${PORT:-3030}"

usage() {
  printf 'Usage: %s {start|stop|restart|status|logs}\n' "$0"
  printf 'Environment:\n'
  printf '  PORT                    Server port, default: 3030\n'
  printf '  AOLA_SERVER_PID_FILE    PID file path, default: .aola-server.pid\n'
  printf '  AOLA_SERVER_LOG_FILE    Log file path, default: server.log\n'
}

read_pid() {
  if [[ -f "$PID_FILE" ]]; then
    tr -d '[:space:]' < "$PID_FILE"
  fi
}

is_running() {
  local pid="${1:-}"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

kill_server_tree() {
  local pid="${1:-}"
  [[ -n "$pid" ]] || return 0

  if kill -0 "-$pid" 2>/dev/null; then
    kill "-$pid" 2>/dev/null || true
  else
    kill "$pid" 2>/dev/null || true
  fi
}

kill_server_tree_force() {
  local pid="${1:-}"
  [[ -n "$pid" ]] || return 0

  if kill -0 "-$pid" 2>/dev/null; then
    kill -9 "-$pid" 2>/dev/null || true
  else
    kill -9 "$pid" 2>/dev/null || true
  fi
}

cleanup_stale_pid() {
  local pid
  pid="$(read_pid || true)"
  if [[ -n "$pid" ]] && ! is_running "$pid"; then
    rm -f "$PID_FILE"
  fi
}

start_server() {
  cleanup_stale_pid

  local pid
  pid="$(read_pid || true)"
  if is_running "$pid"; then
    printf 'Aola server is already running. PID: %s\n' "$pid"
    return 0
  fi

  mkdir -p "$(dirname "$LOG_FILE")"
  cd "$ROOT_DIR"

  printf 'Starting Aola server on port %s...\n' "$PORT_VALUE"
  if command -v setsid >/dev/null 2>&1; then
    nohup setsid npm run server > "$LOG_FILE" 2>&1 &
  else
    nohup npm run server > "$LOG_FILE" 2>&1 &
  fi
  pid="$!"
  printf '%s\n' "$pid" > "$PID_FILE"

  sleep 1
  if is_running "$pid"; then
    printf 'Aola server started. PID: %s\n' "$pid"
    printf 'URL: http://localhost:%s/aola-star.html\n' "$PORT_VALUE"
    printf 'Log: %s\n' "$LOG_FILE"
    return 0
  fi

  rm -f "$PID_FILE"
  printf 'Aola server failed to start. Recent log:\n' >&2
  tail -n 40 "$LOG_FILE" >&2 || true
  return 1
}

stop_server() {
  cleanup_stale_pid

  local pid
  pid="$(read_pid || true)"
  if ! is_running "$pid"; then
    printf 'Aola server is not running.\n'
    rm -f "$PID_FILE"
    return 0
  fi

  printf 'Stopping Aola server. PID: %s\n' "$pid"
  kill_server_tree "$pid"

  for _ in {1..20}; do
    if ! is_running "$pid"; then
      rm -f "$PID_FILE"
      printf 'Aola server stopped.\n'
      return 0
    fi
    sleep 0.5
  done

  printf 'Server did not stop after SIGTERM, sending SIGKILL. PID: %s\n' "$pid" >&2
  kill_server_tree_force "$pid"
  rm -f "$PID_FILE"
  printf 'Aola server stopped.\n'
}

status_server() {
  cleanup_stale_pid

  local pid
  pid="$(read_pid || true)"
  if is_running "$pid"; then
    printf 'Aola server is running. PID: %s\n' "$pid"
    printf 'URL: http://localhost:%s/aola-star.html\n' "$PORT_VALUE"
    printf 'Log: %s\n' "$LOG_FILE"
  else
    printf 'Aola server is not running.\n'
  fi
}

show_logs() {
  if [[ ! -f "$LOG_FILE" ]]; then
    printf 'Log file does not exist: %s\n' "$LOG_FILE" >&2
    return 1
  fi
  tail -f "$LOG_FILE"
}

case "${1:-}" in
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  restart)
    stop_server
    start_server
    ;;
  status)
    status_server
    ;;
  logs)
    show_logs
    ;;
  -h|--help|help)
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
