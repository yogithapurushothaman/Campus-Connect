import os
import sys

# Ensure .venv site-packages and project root are on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
possible_site_packages = [
    os.path.join(BASE_DIR, ".venv", "lib", "site-packages"),
    os.path.join(BASE_DIR, ".venv", "Lib", "site-packages"),
    os.path.join(BASE_DIR, ".venv", "lib", "python3.13", "site-packages"),
    os.path.join(BASE_DIR, ".venv", "lib", "python3.12", "site-packages"),
    os.path.join(BASE_DIR, ".venv", "lib", "python3.11", "site-packages"),
]
for site in possible_site_packages:
    if os.path.exists(site) and site not in sys.path:
        sys.path.insert(0, site)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Ensure UTF-8 output encoding for standard streams if supported
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from campus_connect.app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[STARTUP] CampusConnect Python Application starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)

