"use client";

import { useEffect, useState } from "react";
import { PiStar, PiGitFork } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

export const REPO_URL = "https://github.com/faizan-devyst/devflow-ai";

function formatCount(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${value}`;
}

function Count({ value }: { value: number | null }) {
  if (value === null) return null;
  return (
    <span className="ml-1 rounded-full bg-canvas-bg px-2 py-0.5 text-xs tabular-nums text-canvas-text-contrast">
      {formatCount(value)}
    </span>
  );
}

export function GithubStars() {
  const [stars, setStars] = useState<number | null>(null);
  const [forks, setForks] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<{ stars: number | null; forks: number | null }>("/api/github/stars")
      .then((data) => {
        setStars(data.stars);
        setForks(data.forks);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button asChild size="lg" variant="outline">
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          <PiStar />
          Star on GitHub
          <Count value={stars} />
        </a>
      </Button>
      <Button asChild size="lg" variant="ghost">
        <a href={`${REPO_URL}/fork`} target="_blank" rel="noopener noreferrer">
          <PiGitFork />
          Fork the repo
          <Count value={forks} />
        </a>
      </Button>
    </div>
  );
}
