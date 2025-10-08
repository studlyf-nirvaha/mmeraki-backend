import { buildServer } from '../src/server';
import type { IncomingMessage, ServerResponse } from 'http';

let builtServerPromise: ReturnType<typeof buildServer> | null = null;

async function getServer() {
  if (!builtServerPromise) {
    builtServerPromise = buildServer();
  }
  const server = await builtServerPromise;
  await server.ready();
  return server;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const server = await getServer();
    // Forward the raw Node request/response to Fastify's underlying server
    server.server.emit('request', req, res);
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
  }
}
