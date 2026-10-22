import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
loadEnvironment(join(projectRoot, '.env'));
process.env.NODE_ENV ||= 'production';

const env = process.env;
const distRoot = join(projectRoot, 'dist');
const port = Number(env.PORT || 3000);
const host = env.HOST || '127.0.0.1';

if (!existsSync(join(distRoot, 'index.html'))) {
  throw new Error('Build ausente. Execute `npm run build` antes de iniciar o servidor.');
}

const backend = await import('../vite.config.js');
backend.configureRuntimePersistence(env);

const mountedMiddlewares = [];
const middlewareServer = {
  middlewares: {
    use(prefix, handler) {
      mountedMiddlewares.push({ prefix, handler });
    },
  },
};

backend.dropGamesAuthApiPlugin(env).configureServer(middlewareServer);
backend.dropGamesAiApiPlugin(env).configureServer(middlewareServer);
backend.dropGamesEpicApiPlugin().configureServer(middlewareServer);

const proxyRoutes = [
  { prefix: '/cheapshark', target: 'https://www.cheapshark.com' },
  { prefix: '/steam-community', target: 'https://steamcommunity.com' },
  { prefix: '/steam-api', target: 'https://api.steampowered.com', injectSteamKey: true },
  { prefix: '/steam', target: 'https://store.steampowered.com' },
];
const proxyUsage = new Map();
setInterval(() => proxyUsage.clear(), 5 * 60 * 1000).unref();

const server = createServer(async (req, res) => {
  setSecurityHeaders(res);

  try {
    if (!isAllowedOrigin(req)) {
      sendJson(res, 403, { error: 'Origem nao autorizada.' });
      return;
    }

    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    if (pathname === '/api/health') {
      sendJson(res, 200, {
        status: 'ok',
        service: 'dropgames',
        environment: env.NODE_ENV,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const middlewareMatch = mountedMiddlewares.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    if (middlewareMatch) {
      await runMountedMiddleware(middlewareMatch, req, res);
      return;
    }

    const proxy = proxyRoutes.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    if (proxy) {
      if (!allowProxyRequest(req)) {
        sendJson(res, 429, { error: 'Muitas consultas externas. Aguarde alguns minutos.' });
        return;
      }
      await proxyRequest(proxy, req, res);
      return;
    }

    if (pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'Endpoint nao encontrado.' });
      return;
    }

    serveFrontend(pathname, req, res);
  } catch (error) {
    console.error(`[${new Date().toISOString()}]`, req.method, req.url, error);
    if (!res.headersSent) sendJson(res, 500, { error: 'Erro interno do servidor.' });
    else res.end();
  }
});

server.listen(port, host, () => {
  console.log(`DropGames online em http://${host}:${port} (${env.NODE_ENV})`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}

function loadEnvironment(filePath) {
  if (!existsSync(filePath)) return;
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const separator = trimmed.indexOf('=');
    if (separator < 1) return;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value.replace(/\\n/g, '\n');
  });
}

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

function isAllowedOrigin(req) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || 'GET')) return true;
  const origin = req.headers.origin;
  if (!origin) return true;
  const allowed = new Set(String(env.ALLOWED_ORIGINS || env.APP_URL || '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean));
  if (!allowed.size && env.NODE_ENV !== 'production') return true;
  return allowed.has(origin.replace(/\/$/, ''));
}

function allowProxyRequest(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const client = forwarded || req.socket.remoteAddress || 'unknown';
  const current = proxyUsage.get(client) || 0;
  if (current >= 180) return false;
  proxyUsage.set(client, current + 1);
  return true;
}

function runMountedMiddleware({ prefix, handler }, req, res) {
  return new Promise((resolvePromise, rejectPromise) => {
    const originalUrl = req.url;
    req.url = req.url.slice(prefix.length) || '/';
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      req.url = originalUrl;
      resolvePromise();
    };
    res.once('finish', finish);
    res.once('close', finish);

    try {
      const result = handler(req, res, () => {
        if (!res.writableEnded) sendJson(res, 404, { error: 'Endpoint nao encontrado.' });
        finish();
      });
      Promise.resolve(result).catch(rejectPromise);
    } catch (error) {
      rejectPromise(error);
    }
  });
}

async function proxyRequest(route, req, res) {
  const incoming = new URL(req.url || '/', 'http://localhost');
  let upstreamPath = `${incoming.pathname.slice(route.prefix.length) || '/'}${incoming.search}`;
  if (route.injectSteamKey && env.STEAM_WEB_API_KEY && !/[?&]key=/.test(upstreamPath)) {
    upstreamPath += `${upstreamPath.includes('?') ? '&' : '?'}key=${encodeURIComponent(env.STEAM_WEB_API_KEY)}`;
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || ['host', 'connection', 'content-length', 'accept-encoding'].includes(key.toLowerCase())) continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
  headers.set('User-Agent', 'DropGames/1.0');

  const body = ['GET', 'HEAD'].includes(req.method || 'GET') ? undefined : await readRequestBuffer(req, 1_000_000);
  const response = await fetch(`${route.target}${upstreamPath}`, {
    method: req.method,
    headers,
    body,
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
  });

  res.statusCode = response.status;
  for (const name of ['content-type', 'cache-control', 'last-modified', 'etag']) {
    const value = response.headers.get(name);
    if (value) res.setHeader(name, value);
  }
  res.end(Buffer.from(await response.arrayBuffer()));
}

function readRequestBuffer(req, limit) {
  return new Promise((resolvePromise, rejectPromise) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        rejectPromise(new Error('Requisicao excede o limite permitido.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolvePromise(Buffer.concat(chunks)));
    req.on('error', rejectPromise);
  });
}

function serveFrontend(pathname, req, res) {
  const decoded = decodeURIComponent(pathname);
  const relative = normalize(decoded).replace(/^([/\\])+/, '');
  const requestedPath = resolve(distRoot, relative || 'index.html');
  const isInsideDist = requestedPath === distRoot || requestedPath.startsWith(`${distRoot}/`);
  const filePath = isInsideDist && existsSync(requestedPath) && statSync(requestedPath).isFile()
    ? requestedPath
    : join(distRoot, 'index.html');

  const extension = extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
    '.woff': 'font/woff', '.woff2': 'font/woff2',
  };
  res.statusCode = 200;
  res.setHeader('Content-Type', mimeTypes[extension] || 'application/octet-stream');
  const isHashedAsset = pathname.startsWith('/assets/');
  res.setHeader('Cache-Control', extension === '.html'
    ? 'no-cache'
    : (isHashedAsset ? 'public, max-age=31536000, immutable' : 'public, max-age=86400'));
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}
