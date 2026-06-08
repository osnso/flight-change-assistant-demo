const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 5173);
const ROOT = __dirname;

const mimeMap = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
  const targetPath = path.join(ROOT, safePath || 'index.html');

  if (!targetPath.startsWith(ROOT)) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(targetPath, (statErr, stat) => {
    const filePath = !statErr && stat.isDirectory() ? path.join(targetPath, 'index.html') : targetPath;
    fs.readFile(filePath, (err, data) => {
      if (err) return send(res, 404, 'Not Found');
      send(res, 200, data, mimeMap[path.extname(filePath)] || 'application/octet-stream');
    });
  });
});

server.listen(PORT, () => {
  console.log(`航变客服辅助 AI Demo 已启动: http://localhost:${PORT}`);
});
