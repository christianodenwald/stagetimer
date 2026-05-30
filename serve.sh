#!/usr/bin/env bash
# Simple helper to serve the current directory and show the local IP to open from another device (iPad)
set -e
PORT=8000
# Try common Wi-Fi interfaces
IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")"
if [ -z "$IP" ]; then
  IP=localhost
fi
echo "Serving on http://$IP:$PORT"
# Use Python's http.server bound to 0.0.0.0 so other devices can connect
python3 -m http.server "$PORT" --bind 0.0.0.0
