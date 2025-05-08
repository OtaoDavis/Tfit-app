interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // For actions like buttons
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {children && <div className="ml-4">{children}</div>}
      </div>
      {description && (
        <p className="mt-2 text-lg text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
