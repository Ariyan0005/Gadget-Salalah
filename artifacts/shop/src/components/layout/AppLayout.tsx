import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
