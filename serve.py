import functools, http.server, socketserver
ROOT = r"C:\Users\caio mega\Documents\netuno tcc jv"
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
with S(("127.0.0.1", 5511), Handler) as srv:
    print("serving", ROOT, flush=True)
    srv.serve_forever()
