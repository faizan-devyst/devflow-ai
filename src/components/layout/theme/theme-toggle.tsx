'use client';

import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import { PiSun, PiMoon, PiMonitor } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const subscribe = () => () => {};

export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);

  // Prevent hydration mismatch without a setState-in-effect (false on the server).
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className={className} disabled aria-label="Toggle theme">
        <PiSun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const currentThemeLabel = theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className={className} aria-label="Toggle theme">
          {isDark ? <PiMoon className="h-4 w-4" /> : <PiSun className="h-4 w-4" />}
          <span className="sr-only">Toggle theme ({currentThemeLabel})</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <div className="flex flex-col gap-1">
          <Button
            variant={theme === "light" ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setTheme("light");
              setOpen(false);
            }}
          >
            <PiSun className="mr-2 h-4 w-4" />
            Light
          </Button>

          <Button
            variant={theme === "dark" ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setTheme("dark");
              setOpen(false);
            }}
          >
            <PiMoon className="mr-2 h-4 w-4" />
            Dark
          </Button>

          <Button
            variant={theme === "system" ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setTheme("system");
              setOpen(false);
            }}
          >
            <PiMonitor className="mr-2 h-4 w-4" />
            System
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
