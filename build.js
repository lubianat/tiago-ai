#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const POSTS_DIR = path.join(__dirname, "posts");
const OUT_DIR = path.join(__dirname, "_site");

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

// Prepare output directory
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.join(OUT_DIR, "post"), { recursive: true });

// Read posts
let files;
try {
  files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
} catch {
  files = [];
}
files.sort().reverse();

// Build individual post pages
for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const content = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const rendered = marked(content);
  const title = slugToTitle(slug);
  const body = `<a class="back" href="../">← Back</a>\n${rendered}`;
  const postDir = path.join(OUT_DIR, "post", slug);
  fs.mkdirSync(postDir, { recursive: true });
  fs.writeFileSync(path.join(postDir, "index.html"), html(title, body));
}

// Build index page
const items = files.length
  ? files
      .map((f) => {
        const slug = f.replace(/\.md$/, "");
        const title = slugToTitle(slug);
        return `<li><a href="post/${slug}/">${title}</a></li>`;
      })
      .join("\n")
  : "<li>No posts yet — drop a <code>.md</code> file in <code>posts/</code>.</li>";

const indexBody = `<h1>tiago-ai</h1>
<p>A blog/dump of AI conversations in the life of a dev/RSE interested in bioimaging, wiki, linked data, iNaturalist and plants.</p>
<ul>${items}</ul>`;
fs.writeFileSync(path.join(OUT_DIR, "index.html"), html("tiago-ai", indexBody));

console.log(`Built ${files.length} post(s) → _site/`);
