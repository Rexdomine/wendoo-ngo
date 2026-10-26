"""Small local preview server with Vercel-style clean HTML routes."""

from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


class CleanRouteHandler(SimpleHTTPRequestHandler):
    """Serve /about from about.html while keeping normal static-file behavior."""

    def translate_path(self, path: str) -> str:
        parts = urlsplit(path)
        route = parts.path

        if route == "/":
            route = "/index.html"
        elif not Path(route).suffix and route != "/":
            candidate = Path(self.directory or Path.cwd()) / f"{route.lstrip('/')}.html"
            if candidate.is_file():
                route = f"{route}.html"

        mapped = urlunsplit((parts.scheme, parts.netloc, route, parts.query, parts.fragment))
        return super().translate_path(mapped)


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve Wendoo with clean local routes.")
    parser.add_argument("port", nargs="?", type=int, default=4173)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.bind, args.port), CleanRouteHandler)
    print(f"Wendoo preview running at http://{args.bind}:{args.port}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
