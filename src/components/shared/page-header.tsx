interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-canvas-border/50 pb-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-medium tracking-tight text-canvas-text-contrast">{title}</h1>
        {description && <p className="mt-1 text-sm text-canvas-text">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </header>
  );
}
