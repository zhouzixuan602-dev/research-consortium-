import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neural Web',
  description: 'Biomimetic research collaboration platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
