import { ReactNode } from "react";
import BottomNav from "./BottomNav";

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-md pb-24 px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
