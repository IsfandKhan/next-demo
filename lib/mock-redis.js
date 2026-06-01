const tenantMap = new Map([
  ['acme', { id: 'tenant_acme', name: 'Acme Inc.' }],
  ['globex', { id: 'tenant_globex', name: 'Globex Corp.' }]
]);

export async function getTenantBySubdomain(subdomain) {
  return tenantMap.get(subdomain) ?? null;
}
