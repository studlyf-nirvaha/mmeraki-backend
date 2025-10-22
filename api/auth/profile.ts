import { buildServer } from '../../src/server';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let builtServerPromise: ReturnType<typeof buildServer> | null = null;

async function getServer() {
  if (!builtServerPromise) {
    builtServerPromise = buildServer();
  }
  const server = await builtServerPromise;
  await server.ready();
  return server;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const server = await getServer();
    
    // Build the full URL for the request
    const url = new URL('/api/auth/profile', `https://${req.headers.host}`);
    
    // Add query parameters
    if (req.query) {
      Object.entries(req.query).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    // Prepare headers
    const headers: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    });

    // Handle the request with Fastify
    const response = await server.inject({
      // Ensure method is of correct type
      method: req.method as any || 'GET',
      url: url.pathname + url.search,
      headers,
      payload: req.body ? JSON.stringify(req.body) : undefined,
    });

    // Set response status and headers
    res.statusCode = response.statusCode;
    Object.entries(response.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        res.setHeader(key, String(value));
      }
    });

    // Send response body
    res.end(response.payload);

  } catch (error) {
    console.error('Handler error:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ 
      success: false, 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}
