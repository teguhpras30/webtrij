import "./globals.css";

export const metadata = {
  title: "TRI J",
  description: "Home Appliance Store",
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