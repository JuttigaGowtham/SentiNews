// app/layout.js
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata = {
  title: "Sentinews | Financial Intelligence & Terminal",
  description: "Advanced financial data, news scraper, and stock market intelligence terminal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <WatchlistProvider>
              {children}
            </WatchlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
