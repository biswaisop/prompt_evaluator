import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Prompt Playground",
  description: "Test, tune, and track your AI prompts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className={`${geistSans.variable} antialiased bg-white`}>
        {children}
      </body>
    </html>
  );
}
