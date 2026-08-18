import os
import sys

# Ensure UTF-8 output encoding for standard streams if supported
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from campus_connect.app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[STARTUP] CampusConnect Python Application starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
