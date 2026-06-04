"use client";

import React from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { PasswordGate } from "@/components/shared/PasswordGate";
import { ToastProvider } from "@/components/ui/toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <PasswordGate>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="ml-56 flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </PasswordGate>
    </ToastProvider>
  );
}
