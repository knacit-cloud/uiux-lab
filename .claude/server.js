const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '**/node_modules/**',
      'dist/**',
      'build/**',
      '**/*.d.ts',
    ],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
// uiux-lab の静的プレビューサーバー
//   node .claude/server.js  →  http://localhost:4322/snippets/
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 4322;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.md':   'text/plain; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.woff2':'font/woff2',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // ルートは書き換えではなくリダイレクトする。
  // 書き換えると base URL が "/" のままになり、
  // ページ内の相対パス（css/… js/…）が全部 404 になる。
  if (urlPath === '/') {
    res.writeHead(302, { Location: '/snippets/' });
    return res.end();
  }

  let filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (err2, data) => {
      if (err2) { res.writeHead(404); return res.end('Not found: ' + urlPath); }
      res.writeHead(200, {
        'Content-Type': types[path.extname(filePath)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
        // 他サイトの DevTools から audit.js を読み込めるようにする（開発用）
        'Access-Control-Allow-Origin': '*',
      });
      res.end(data);
    });
  });
}).listen(PORT, () => console.log('uiux-lab preview on http://localhost:' + PORT));
