import { Sparkles } from "lucide-react";
import Link from "next/link";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-fuchsia-500 text-white">
            <Sparkles className="size-4" />
          </span>
          Web Master
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">{children}</nav>
      </div>
    </header>
  );
}
