#!/usr/bin/env python3
"""Static admin server, Ollama proxy, time API and shared Idiomas store."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from datetime import datetime, timezone
from threading import Lock
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "8090"))
HOST = os.environ.get("HOST", "0.0.0.0")
OLLAMA = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
IDIOMAS_PATH = os.path.join(ROOT, "data", "idiomas-publicados.json")
IDIOMAS_LOCK = Lock()


def ensure_idiomas_file():
    folder = os.path.dirname(IDIOMAS_PATH)
    if not os.path.isdir(folder):
        os.makedirs(folder, exist_ok=True)
    if not os.path.isfile(IDIOMAS_PATH):
        with open(IDIOMAS_PATH, "w", encoding="utf-8") as handle:
            handle.write("[]\n")


def read_idiomas():
    ensure_idiomas_file()
    with IDIOMAS_LOCK:
        try:
            with open(IDIOMAS_PATH, "r", encoding="utf-8") as handle:
                data = json.load(handle)
            return data if isinstance(data, list) else []
        except Exception:
            return []


def write_idiomas(items):
    ensure_idiomas_file()
    with IDIOMAS_LOCK:
        with open(IDIOMAS_PATH, "w", encoding="utf-8") as handle:
            json.dump(items, handle, ensure_ascii=False, indent=2)
            handle.write("\n")


def normalize_lang(item):
    if not isinstance(item, dict):
        return None
    name = str(item.get("name") or "").strip()
    if len(name) < 2:
        return None
    entries = item.get("entries")
    if not isinstance(entries, list) or not entries:
        return None
    lang_id = str(item.get("id") or ("lang-" + str(int(time.time() * 1000))))
    return {
        "id": lang_id,
        "name": name,
        "sourceLang": str(item.get("sourceLang") or "es"),
        "raw": str(item.get("raw") or ""),
        "entries": entries,
        "createdAt": int(item.get("createdAt") or time.time() * 1000),
        "published": True,
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        path = self.path.split("?", 1)[0].lower()
        if (
            self.path.startswith("/ollama")
            or path == "/time"
            or path == "/api/idiomas"
        ):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Cache-Control", "no-store")
        elif path.endswith((".html", ".js", ".css", ".json")):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        path = self.path.split("?", 1)[0]
        if self.path.startswith("/ollama") or path in ("/time", "/api/idiomas"):
            self.send_response(204)
            self.end_headers()
            return
        self.send_error(404)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/time":
            self.send_time()
            return
        if path == "/api/idiomas":
            self.send_json(200, read_idiomas())
            return
        if self.path.startswith("/ollama"):
            self.proxy()
            return
        super().do_GET()

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/idiomas":
            self.publish_idioma()
            return
        if self.path.startswith("/ollama"):
            self.proxy()
            return
        self.send_error(405)

    def do_DELETE(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/idiomas":
            self.delete_idioma()
            return
        self.send_error(405)

    def read_json_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            return json.loads(raw.decode("utf-8") or "{}")
        except Exception:
            return None

    def send_json(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(body)

    def publish_idioma(self):
        payload = self.read_json_body()
        if payload is None:
            self.send_json(400, {"error": "JSON inválido"})
            return
        lang = normalize_lang(payload.get("lang") if isinstance(payload, dict) and "lang" in payload else payload)
        if not lang:
            self.send_json(400, {"error": "Idioma inválido"})
            return
        items = read_idiomas()
        items = [item for item in items if str(item.get("id")) != lang["id"]]
        # Unique name (case-insensitive)
        for item in items:
            if str(item.get("name") or "").strip().lower() == lang["name"].lower():
                self.send_json(409, {"error": "Ya existe un idioma con ese nombre", "items": items})
                return
        items.insert(0, lang)
        write_idiomas(items)
        self.send_json(200, {"ok": True, "lang": lang, "items": items})

    def delete_idioma(self):
        payload = self.read_json_body() or {}
        lang_id = str(payload.get("id") or "").strip()
        if not lang_id:
            self.send_json(400, {"error": "Falta id"})
            return
        items = [item for item in read_idiomas() if str(item.get("id")) != lang_id]
        write_idiomas(items)
        self.send_json(200, {"ok": True, "items": items})

    def send_time(self):
        now = time.time()
        unix_ms = int(now * 1000)
        payload = {
            "unix": int(now),
            "unixMs": unix_ms,
            "iso": datetime.fromtimestamp(now, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
            "source": "serve.py",
        }
        self.send_json(200, payload)

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
    ensure_idiomas_file()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print("Administrador en http://localhost:%s" % PORT)
    print("Red local: http://0.0.0.0:%s (HOST=%s)" % (PORT, HOST))
    print("Idiomas compartidos: /api/idiomas -> data/idiomas-publicados.json")
    print("Hora confiable: /time")
    print("Proxy Ollama: /ollama -> %s" % OLLAMA)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("")
        sys.exit(0)
