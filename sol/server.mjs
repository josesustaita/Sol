import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { forecast } from "./weather.mjs";
const root = resolve("dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET" });
      return res.end();
    }
    if (url.pathname === "/healthz") {
      res.writeHead(200);
      return res.end("ok");
    }
    if (url.pathname === "/api/weather") {
      const { status, body } = await forecast(
        url.searchParams.get("city"),
        url.searchParams.get("units") || "imperial",
      );
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      return res.end(JSON.stringify(body));
    }
    const file = resolve(
      root,
      "." +
        decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
    );
    if (!file.startsWith(root + sep)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
  console.log("Sol is listening on port " + (process.env.PORT || 3000)),
);
