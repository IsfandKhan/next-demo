import { NextResponse } from 'next/server';
import { getTenantBySubdomain } from './lib/mock-redis';

function extractSubdomain(host = '') {
  const normalized = host.split(':')[0].toLowerCase();
  const parts = normalized.split('.');

  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return parts[0] || null;
  }

  if (parts.length >= 3) {
    return parts[0] || null;
  }

  return null;
}

export async function middleware(request) {
  const host = request.headers.get('host') || '';
  const subdomain = extractSubdomain(host);

  if (!subdomain) {
    return new Response('Subdomain required', { status: 404 });
  }

  const tenant = await getTenantBySubdomain(subdomain);
  if (!tenant) {
    return new Response('Unknown tenant', { status: 404 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant.id);
  requestHeaders.set('x-tenant-subdomain', subdomain);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
