import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

const POLYGON_WKT =
  'POLYGON((-74.020 40.700, -73.930 40.700, -73.930 40.780, -74.020 40.780, -74.020 40.700))';

export async function POST(request) {
  try {
    const body = await request.json();
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'lat and lng must be numbers' }, { status: 400 });
    }

    const rows = await prisma.$queryRaw`
      SELECT ST_Contains(
        ST_GeomFromText(${POLYGON_WKT}, 4326),
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      ) AS inside
    `;

    const inside = Boolean(rows[0]?.inside);
    return NextResponse.json({ inside, lat, lng });
  } catch (error) {
    return NextResponse.json(
      { error: 'geofence query failed', details: String(error.message || error) },
      { status: 500 }
    );
  }
}
