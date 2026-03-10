import "./globals.css";

export const metadata = {
  title: "ACEDDI HR",
  description: "ACEDDI HR System",
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
