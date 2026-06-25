"use client";

import { PiCaretLeft, PiCaretRight } from "react-icons/pi";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
}: DataTablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 border-t border-canvas-border/50 pt-3">
      <p className="text-sm text-canvas-text">
        {total === 0 ? "No results" : `Showing ${from} to ${to} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-canvas-text">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <PiCaretLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <PiCaretRight />
        </Button>
      </div>
    </div>
  );
}
