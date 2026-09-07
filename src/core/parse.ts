import { IncomingMessage } from 'http';

interface ParsedRequest {
  pathname: string | null;
  method: string;
  query: Record<string, any>;
}

function parseRequest(req: IncomingMessage): ParsedRequest {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const pathname = requestUrl.pathname;
  const query = Object.fromEntries(requestUrl.searchParams.entries());
  const method = req.method?.toUpperCase() || ''; // Normalize the HTTP method
  return { pathname, method, query };
}

function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString(); // Append data chunks
    });

    req.on('end', () => {
      try {
        const parsedBody = JSON.parse(body); // Parse JSON body
        resolve(parsedBody);
      } catch (err) {
        reject(new Error('Invalid JSON')); // Handle invalid JSON
      }
    });

    req.on('error', reject);
  });
}

export { parseRequestBody, parseRequest };
