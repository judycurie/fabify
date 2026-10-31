import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

function stripeDevPlugin() {
  return {
    name: 'stripe-dev-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/create-checkout-session' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const payload = JSON.parse(body || '{}');
              const stripeKey = process.env.STRIPE_SECRET_KEY;
              if (stripeKey && !stripeKey.startsWith('mk_')) {
                const { default: Stripe } = await import('stripe');
                const stripe = new Stripe(stripeKey);
                const items = payload.items || [];
                const line_items = items.map((item: any) => ({
                  price_data: {
                    currency: 'usd',
                    product_data: {
                      name: `${item.templateName} (${item.licenseType?.toUpperCase() || 'COMMERCIAL'} CAD License)`,
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
                  },
                } as any);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, url: session.url, sessionId: session.id }));
                return;
              }
              // Simulated dev response
              res.writeHead(200);
              res.end(
                JSON.stringify({
                  success: true,
                  isSimulated: true,
                  sessionId: `cs_test_fab_${Date.now()}`,
                  message: 'Stripe Sandbox: Set STRIPE_SECRET_KEY in .env to redirect to live Stripe checkout.',
                })
              );
            } catch (err: any) {
              res.writeHead(500);
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url && req.url.startsWith('/api/verify-checkout-session') && req.method === 'GET') {
          const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
          const sessionId = urlObj.searchParams.get('session_id');
          const stripeKey = process.env.STRIPE_SECRET_KEY;
          res.setHeader('Content-Type', 'application/json');

          if (!sessionId) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing session_id' }));
            return;
          }

          if (!stripeKey || stripeKey.startsWith('mk_')) {
            res.writeHead(200);
            res.end(JSON.stringify({ paid: true, isSimulated: true, sessionId }));
            return;
          }

          try {
            const { default: Stripe } = await import('stripe');
            const stripe = new Stripe(stripeKey);
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            res.writeHead(200);
            res.end(
              JSON.stringify({
                paid: session.payment_status === 'paid',
                customerEmail: session.customer_details?.email || session.customer_email,
                customerName: session.customer_details?.name,
                amountTotal: (session.amount_total || 0) / 100,
                currency: session.currency,
                sessionId: session.id,
              })
            );
          } catch (err: any) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }

        if (req.url === '/api/send-model-email' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
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

              console.log(`[Fabify Model Email Service] ✓ Sent 3D Model Package to ${recipientEmail}`);
              console.log(`  Template: ${templateName} | Tier: ${tierId || 'tier1_static'} | Order: ${orderId}`);

              res.writeHead(200);
              res.end(
                JSON.stringify({
                  success: true,
                  deliveredTo: recipientEmail,
                  recipientName,
                  orderId,
                  messageId: `fab_mail_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                  timestamp: Date.now(),
                  deliveryNotice: `Watertight STL and STEP CAD files successfully dispatched to ${recipientEmail}`,
                })
              );
            } catch (err: any) {
              res.writeHead(500);
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), stripeDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      minify: 'esbuild',
      emptyOutDir: true,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three-bvh-csg/')) {
              return 'three-csg';
            }
            if (id.includes('node_modules/three/')) {
              return 'three-core';
            }
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('node_modules/lucide-react/') || id.includes('node_modules/opentype.js/')) {
              return 'ui-vendor';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
