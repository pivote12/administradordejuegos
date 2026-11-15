#!/usr/bin/env python3
"""Static admin server and same-origin Ollama proxy."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from datetime import datetime, timezone
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "8090"))
OLLAMA = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        path = self.path.split("?", 1)[0].lower()
        if self.path.startswith("/ollama") or path == "/time":
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Cache-Control", "no-store")
        elif path.endswith((".html", ".js", ".css")):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        path = self.path.split("?", 1)[0]
        if self.path.startswith("/ollama") or path == "/time":
            self.send_response(204)
            self.end_headers()
            return
        self.send_error(404)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/time":
            self.send_time()
            return
        if self.path.startswith("/ollama"):
            self.proxy()
            return
        super().do_GET()

    def send_time(self):
        now = time.time()
        unix_ms = int(now * 1000)
        payload = {
            "unix": int(now),
            "unixMs": unix_ms,
            "iso": datetime.fromtimestamp(now, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
            "source": "serve.py",
        }
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path.startswith("/ollama"):
            self.proxy()
            return
        self.send_error(405)

    def proxy(self):
        suffix = self.path[len("/ollama"):] or "/"
        if not suffix.startswith("/"):
            suffix = "/" + suffix
        target = OLLAMA + suffix
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None
        headers = {}
        content_type = self.headers.get("Content-Type")
        if content_type:
            headers["Content-Type"] = content_type
        req = Request(target, data=body, headers=headers, method=self.command)
        try:
            with urlopen(req, timeout=600) as resp:
                self.send_response(resp.status)
                self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                self.end_headers()
                while True:
                    chunk = resp.read(8192)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    self.wfile.flush()
        except HTTPError as err:
            payload = err.read() if err.fp else b""
            self.send_response(err.code)
            self.send_header("Content-Type", err.headers.get("Content-Type", "application/json"))
            self.end_headers()
            if payload:
                self.wfile.write(payload)
        except URLError:
            message = (
                "Ollama no esta abierto en %s. Abri la app Ollama en esta PC." % OLLAMA
            ).encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(message)
        except BrokenPipeError:
            return
        except Exception as err:
            self.send_error(502, str(err))


if __name__ == "__main__":
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("Administrador en http://localhost:%s" % PORT)
    print("Hora confiable: /time")
    print("Proxy Ollama: /ollama -> %s" % OLLAMA)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("")
        sys.exit(0)
