import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  const headerStore = headers();

  return NextResponse.json({
    tenantId: headerStore.get('x-tenant-id'),
    subdomain: headerStore.get('x-tenant-subdomain')
  });
}
