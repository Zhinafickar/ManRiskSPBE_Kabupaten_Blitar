
'use client';

// No longer needs a provider, just pass children through.
export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
