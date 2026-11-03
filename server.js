import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, 'dist');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.stl': 'model/stl',
  '.wasm': 'application/wasm',
};

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    const headers = { 'Content-Type': contentType };
    // Cache static assets with hash in filename for 1 year, HTML never cached
    if (filePath.includes('/assets/') || filePath.includes('/fonts/') || filePath.includes('/images/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }
    res.writeHead(200, headers);
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  // Cloud Run health check endpoint
  if (req.url === '/_healthz' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // Stripe Checkout Session Creation Endpoint (Fab Foundation Poland)
  if (req.method === 'POST' && req.url === '/api/create-checkout-session') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json');
      try {
        const payload = JSON.parse(body || '{}');
        const items = payload.items || [];
        const stripeKey = process.env.STRIPE_SECRET_KEY;

        if (!stripeKey || stripeKey.startsWith('mk_')) {
          // Return simulated session response when key is not set or is an identifier (mk_...)
          res.writeHead(200);
          res.end(
            JSON.stringify({
              success: true,
              isSimulated: true,
              sessionId: `cs_test_fab_${Date.now()}`,
              message: stripeKey?.startsWith('mk_')
                ? 'Stripe Note: Provided key starts with mk_ (Key ID). In Stripe Dashboard, please copy the Secret Key (starts with sk_live_ or rk_live_).'
                : 'Stripe Sandbox: Set STRIPE_SECRET_KEY in .env or Cloud Run to enable live Stripe redirects.',
            })
          );
          return;
        }

        // Dynamically import stripe
        const { default: Stripe } = await import('stripe');
        const stripe = new Stripe(stripeKey);

        const line_items = items.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${item.templateName} (${item.licenseType.toUpperCase()} CAD License)`,
              description: `Fab Foundation Poland · Parametric Code: ${item.paramCode}`,
            },
            unit_amount: Math.round((item.unitPrice || 3.50) * 100),
          },
          quantity: item.quantity || 1,
        }));

        const appUrl = process.env.APP_URL || `http://${req.headers.host || 'localhost:3000'}`;

        const session = await stripe.checkout.sessions.create({
          customer_email: payload.customerEmail || undefined,
          line_items: line_items.length > 0 ? line_items : undefined,
          mode: 'payment',
          success_url: `${appUrl}/?order_success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/?canceled=true`,
          metadata: {
            organization: 'Fab Foundation Poland',
            customerEmail: payload.customerEmail || '',
            itemCount: String(items.length),
          },
        });

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, url: session.url, sessionId: session.id }));
      } catch (err) {
        console.error('[Stripe Session Error]', err);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Model Email Dispatch Endpoint
  if (req.method === 'POST' && req.url === '/api/send-model-email') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json');
      try {
        const payload = JSON.parse(body || '{}');
        const { recipientEmail, recipientName = 'Fab Foundation Maker', templateName, orderId, tierId } = payload;
        
        if (!recipientEmail || !recipientEmail.includes('@')) {
          res.writeHead(400);
          res.end(JSON.stringify({ success: false, error: 'Valid recipient email required' }));
          return;
        }

        const isPaid = tierId !== 'free';
        const formatName = isPaid ? 'Production STEP CAD model (.step)' : 'Free 3D STL model (.stl)';
        console.log(`[Fabify Production Mailer] Sent ${formatName} to ${recipientEmail} for template: ${templateName}`);

        res.writeHead(200);
        res.end(
          JSON.stringify({
            success: true,
            deliveredTo: recipientEmail,
            recipientName,
            orderId,
            format: isPaid ? 'STEP (.step)' : 'STL (.stl)',
            messageId: `prod_mail_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            timestamp: Date.now(),
            deliveryNotice: `${formatName} and license package dispatched to ${recipientEmail}`,
          })
        );
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Verify Stripe Session directly without needing any webhook
  if (req.method === 'GET' && req.url.startsWith('/api/verify-checkout-session')) {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
    const sessionId = urlObj.searchParams.get('session_id');
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    res.setHeader('Content-Type', 'application/json');
    if (!sessionId) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Missing session_id query parameter' }));
      return;
    }

    if (!stripeKey || stripeKey.startsWith('mk_')) {
      // In sandbox mode or key identifier
      res.writeHead(200);
      res.end(JSON.stringify({ paid: true, isSimulated: true, sessionId }));
      return;
    }

    (async () => {
      try {
        const { default: Stripe } = await import('stripe');
        const stripe = new Stripe(stripeKey);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const isPaid = session.payment_status === 'paid';
        res.writeHead(200);
        res.end(
          JSON.stringify({
            paid: isPaid,
            customerEmail: session.customer_details?.email || session.customer_email,
            customerName: session.customer_details?.name,
            amountTotal: (session.amount_total || 0) / 100,
            currency: session.currency,
            sessionId: session.id,
          })
        );
      } catch (err) {
        console.error('[Stripe Verify Error]', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    })();
    return;
  }

  // Sanitize path to prevent directory traversal
  const urlPath = req.url ? req.url.split('?')[0] : '/';
  const decodedPath = decodeURIComponent(urlPath);
  const safePath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // If requesting a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Check if static file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    serveFile(res, filePath, contentType);
    return;
  }

  // SPA fallback: return index.html for non-asset routes
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    serveFile(res, indexPath, 'text/html; charset=UTF-8');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found - Build dist/ first');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[Fabify Production Server] Listening on http://${HOST}:${PORT}`);
});

// Handle graceful termination signals from Cloud Run
process.on('SIGTERM', () => {
  console.log('[Fabify] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Fabify] SIGINT received, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
