'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { PiSun, PiMoon, PiMonitor } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // You can return a placeholder or null while mounting
    return (
      <div className="fixed bottom-6 right-5 z-50">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg"
          disabled
        >
          <PiSun className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // resolvedTheme is "light" or "dark" — used for the current icon
  const isDark = resolvedTheme === "dark";

  // Helper to get display text for current theme
  const currentThemeLabel = theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";

  return (
    <div className="fixed bottom-6 right-5 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Icon changes based on resolved (actual) theme */}
            {isDark ? (
              <PiMoon className="h-5 w-5" />
            ) : (
              <PiSun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme ({currentThemeLabel})</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end">
          <div className="flex flex-col gap-1">
            <Button
              variant={theme === "light" ? "default" : "ghost"}
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
    </div>
  );
};