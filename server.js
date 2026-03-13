const http = require("http");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const PORT = process.env.PORT || 3000;
const POSTS_DIR = path.join(__dirname, "posts");

const CSS = `
  body { font-family: Georgia, serif; max-width: 720px; margin: 40px auto; padding: 0 20px; color: #222; line-height: 1.7; }
  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }
  h1 { border-bottom: 1px solid #ddd; padding-bottom: 8px; }
  pre { background: #f4f4f4; padding: 12px; overflow-x: auto; border-radius: 4px; }
  code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #555; }
  .back { margin-bottom: 24px; display: inline-block; }
`;

function html(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>${CSS}</style></head>
<body>${body}</body>
</html>`;
}

function slugToTitle(slug) {
  return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function safeName(name) {
  return /^[a-zA-Z0-9_\-]+$/.test(name);
}

http
  .createServer((req, res) => {
    let url;
    try {
      url = new URL(req.url, `http://localhost:${PORT}`);
    } catch {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Bad request.");
      return;
    }

    if (url.pathname === "/") {
      // Index: list all .md files
      let files;
      try {
        files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
      } catch {
        files = [];
      }
      files.sort().reverse();

      const items = files.length
        ? files
            .map((f) => {
              const slug = f.replace(/\.md$/, "");
              const title = slugToTitle(slug);
              return `<li><a href="/post/${encodeURIComponent(slug)}">${title}</a></li>`;
            })
            .join("\n")
        : "<li>No posts yet — drop a <code>.md</code> file in <code>posts/</code>.</li>";

      const body = `<h1>tiago-ai</h1>
<p>A blog/dump of AI conversations in the life of a dev/RSE interested in bioimaging, wiki, linked data, iNaturalist and plants.</p>
<ul>${items}</ul>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html("tiago-ai", body));
      return;
    }

    const match = url.pathname.match(/^\/post\/([^/]+)$/);
    if (match) {
      const slug = decodeURIComponent(match[1]);
      if (!safeName(slug)) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Invalid post name.");
        return;
      }
      const filePath = path.join(POSTS_DIR, slug + ".md");
      let content;
      try {
        content = fs.readFileSync(filePath, "utf8");
      } catch {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html("Not Found", `<a class="back" href="/">← Back</a><p>Post not found.</p>`));
        return;
      }
      const rendered = marked(content);
      const title = slugToTitle(slug);
      const body = `<a class="back" href="/">← Back</a>\n${rendered}`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html(title, body));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found.");
  })
  .listen(PORT, () => {
    console.log(`Blog running at http://localhost:${PORT}`);
  });
