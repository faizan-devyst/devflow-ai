"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { PiCheckCircle, PiInfo, PiWarning, PiXCircle, PiSpinnerGap } from "react-icons/pi"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <PiCheckCircle className="size-4 text-success-text" />
        ),
        info: (
          <PiInfo className="size-4 text-info-text" />
        ),
        warning: (
          <PiWarning className="size-4 text-warning-text" />
        ),
        error: (
          <PiXCircle className="size-4 text-alert-text" />
        ),
        loading: (
          <PiSpinnerGap className="size-4 animate-spin text-primary-text" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
