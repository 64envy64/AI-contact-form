import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Contact Form | Улучшение сообщений с помощью AI",
  description: "Контактная форма с AI-улучшением сообщений через Google Gemini API. Отправляйте профессиональные сообщения с помощью искусственного интеллекта.",
  keywords: ["contact form", "AI", "Gemini", "message improvement", "контактная форма"],
  authors: [{ name: "AI Contact Form" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
