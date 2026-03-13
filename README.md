# tiago-ai

A super lightweight blog — drop `.md` files in `posts/` and they appear.

## Usage

```bash
npm install
npm start
# → http://localhost:3000
```

To add a post: paste any `.md` file into `posts/` and it will show up on the index.

## Stack

Single-file Node.js server (`server.js`) + [`marked`](https://marked.js.org/) for markdown rendering. No framework, no build step, no database. 
