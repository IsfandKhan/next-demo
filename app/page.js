'use client';

import { useEffect, useState } from 'react';
import { socket } from '../lib/socket';

export default function HomePage() {
  const [counter, setCounter] = useState(0);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [lat, setLat] = useState('40.72');
  const [lng, setLng] = useState('-74.0');
  const [geofenceResult, setGeofenceResult] = useState(null);
  const [geofenceError, setGeofenceError] = useState(null);
  const [geofenceLoading, setGeofenceLoading] = useState(false);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onCounterUpdate = (value) => {
      setCounter(value);
    };

    socket.on('counter:update', onCounterUpdate);

    fetch('/api/tenant')
      .then((res) => res.json())
      .then((data) => setTenantInfo(data))
      .catch(() => setTenantInfo({ error: 'Could not load tenant info' }));

    return () => {
      socket.off('counter:update', onCounterUpdate);
    };
  }, []);

  async function testGeofence() {
    setGeofenceLoading(true);
    setGeofenceError(null);
    setGeofenceResult(null);

    try {
      const response = await fetch('/api/geofence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lat: Number(lat),
          lng: Number(lng)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setGeofenceError(data);
      } else {
        setGeofenceResult(data);
      }
    } catch (error) {
      setGeofenceError({ error: String(error) });
    } finally {
      setGeofenceLoading(false);
    }
  }

  return (
    <main>
      <h1>Demo: Multi-tenant + PostGIS + Realtime</h1>
      <p>
        Open this URL in two tabs with a known subdomain (for example{' '}
        <code>http://acme.localhost:3000</code>) then click increment in one tab.
      </p>

      <h2>Tenant Context from Middleware</h2>
      <pre>{JSON.stringify(tenantInfo, null, 2)}</pre>

      <h2>Realtime Counter</h2>
      <p>Shared Count: {counter}</p>
      <button onClick={() => socket.emit('counter:increment')}>Increment Counter</button>

      <h2>Geofence API</h2>
      <p>POST <code>/api/geofence</code> with JSON payload.</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          Lat:{' '}
          <input value={lat} onChange={(e) => setLat(e.target.value)} />
        </label>
        <label>
          Lng:{' '}
          <input value={lng} onChange={(e) => setLng(e.target.value)} />
        </label>
        <button onClick={testGeofence} disabled={geofenceLoading}>
          {geofenceLoading ? 'Testing...' : 'Test Geofence'}
        </button>
      </div>
      {geofenceResult && (
        <>
          <h3>Geofence Result</h3>
          <pre>{JSON.stringify(geofenceResult, null, 2)}</pre>
        </>
      )}
      {geofenceError && (
        <>
          <h3>Geofence Error</h3>
          <pre>{JSON.stringify(geofenceError, null, 2)}</pre>
        </>
      )}
    </main>
  );
}
