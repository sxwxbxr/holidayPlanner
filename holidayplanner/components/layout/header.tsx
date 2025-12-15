"use client";

import Link from "next/link";
import { Plane, Users, Calendar } from "lucide-react";
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Plane className="h-5 w-5" />
          <span>Holiday Planner</span>
        </Link>

        <nav className="flex items-center gap-6 ml-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Link>
          <Link
            href="/trips"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plane className="h-4 w-4" />
            Trips
          </Link>
          <Link
            href="/participants"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Users className="h-4 w-4" />
            People
          </Link>
        </nav>

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
