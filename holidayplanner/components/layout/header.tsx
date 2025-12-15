"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Clock className="h-5 w-5" />
          <span>Time Sync</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <ThemeTogglerButton
            variant="ghost"
            size="sm"
            modes={["light", "dark", "system"]}
          />
        </div>
      </div>
    </header>
  );
}
