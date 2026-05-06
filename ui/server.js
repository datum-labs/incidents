import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = join(__dirname, 'dist');

// API server configuration
const API_HOST = process.env.API_HOST || 'incidents-apiserver.incidents-system.svc';
const API_PORT = process.env.API_PORT || 443;
const TOKEN_PATH = '/var/run/secrets/kubernetes.io/serviceaccount/token';

// Read auth token: prefer API_TOKEN env var, then fall back to service account file.
// The incidents-apiserver uses Milo OIDC/static token auth, not k8s service account JWTs,
// so API_TOKEN must be a valid Milo token (e.g. test-admin-token in demo).
function getServiceAccountToken() {
  if (process.env.API_TOKEN) {
    return process.env.API_TOKEN;
  }
  try {
    if (existsSync(TOKEN_PATH)) {
      return readFileSync(TOKEN_PATH, 'utf8').trim();
    }
  } catch (err) {
    console.error('Failed to read service account token:', err.message);
  }
  return null;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('healthy\n');
});

// Proxy API requests to the incidents API server
app.use('/apis/incidents.operations.miloapis.com', (req, res) => {
  const token = getServiceAccountToken();

  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: `/apis/incidents.operations.miloapis.com${req.url}`,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    rejectUnauthorized: false, // Allow self-signed certs
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);

    // Copy relevant headers
    const headersToForward = ['content-type', 'content-length'];
    headersToForward.forEach(header => {
      if (proxyRes.headers[header]) {
        res.setHeader(header, proxyRes.headers[header]);
      }
    });

    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(502).json({
      kind: 'Status',
      apiVersion: 'v1',
      status: 'Failure',
      message: `Failed to proxy request: ${err.message}`,
      reason: 'BadGateway',
      code: 502
    });
  });

  // Forward request body for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (body) {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
        proxyReq.write(body);
      }
      proxyReq.end();
    });
  } else {
    proxyReq.end();
  }
});

// Serve static files with caching for assets
app.use('/assets', express.static(join(DIST_DIR, 'assets'), {
  maxAge: '1y',
  immutable: true
}));

// Serve other static files
app.use(express.static(DIST_DIR));

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  const indexPath = join(DIST_DIR, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API proxy: https://${API_HOST}:${API_PORT}`);
});
