export const metadata = {
  title: 'Next.js 14 Demo',
  description: 'Multi-tenant middleware + PostGIS + Socket.io demo'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', margin: 24 }}>{children}</body>
    </html>
  );
}
