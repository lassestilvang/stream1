"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold">
              MovieApp
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/watched" className="hover:underline">
                Watched
              </Link>
              <Link href="/watchlist" className="hover:underline">
                Watchlist
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {status === "loading" ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            ) : session ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm hidden sm:inline">
                  {session.user?.name || session.user?.email}
                </span>
                <Button onClick={() => signOut()} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button onClick={() => signIn()} variant="outline" size="sm">
                  Sign In
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
