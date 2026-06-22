import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-primary-solid focus-visible:ring-0 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-alert-solid aria-invalid:ring-0 dark:aria-invalid:ring-0 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary-solid text-primary-on-primary [a]:hover:bg-primary-solid/80",
        secondary:
          "bg-canvas-bg text-canvas-text-contrast [a]:hover:bg-canvas-bg/80",
        destructive:
          "bg-alert-solid/10 text-alert-text focus-visible:ring-0 dark:bg-alert-solid/20 dark:focus-visible:ring-0 [a]:hover:bg-alert-solid/20",
        outline:
          "border-border text-foreground [a]:hover:bg-canvas-bg [a]:hover:text-canvas-text",
        ghost:
          "hover:bg-canvas-bg hover:text-canvas-text dark:hover:bg-canvas-bg/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
