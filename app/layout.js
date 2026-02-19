import "./globals.css";

export const metadata = {
  title: "Alex – MCAT Exam Study",
  description: "MCAT study app with quiz and flashcard modes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
