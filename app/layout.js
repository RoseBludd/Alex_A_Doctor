import "./globals.css";

export const metadata = {
  title: "Doctor Alex Practice",
  description: "genius MCAT exam practice",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
