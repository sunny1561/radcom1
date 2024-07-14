import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
// import { Sidebar } from "@/components/Sidebar2";
import { ChatBox } from "@/components/ChatBox";
import { UserProvider } from "@/contexts/UserContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Radcom",
  description: "A Generative chatbot by Radcom",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
      <SessionProvider>
          <UserProvider>
            <LoadingProvider>
          <div className="flex h-screen">
            
            {/* <Sidebar /> */}
            <main className="flex-1">
              {/* <ChatBox /> */}
              {children}
            </main>
          </div>
          </LoadingProvider>

          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
