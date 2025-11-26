import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HRMS Admin Panel",
  description: "A modern HRMS admin dashboard for managing employees.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme'); if(t){ document.documentElement.setAttribute('data-theme', t); if(t==='dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }}catch(e){}})()`,
          }}
        />
        {children}
        <Toaster position="bottom-left" />
      </body>
    </html>
  );
}
