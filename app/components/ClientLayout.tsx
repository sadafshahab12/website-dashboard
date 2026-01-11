"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <SessionProvider>
      <ProtectedRoute>
        <Navbar />
        {children}
      </ProtectedRoute>
    </SessionProvider>
  );
}
