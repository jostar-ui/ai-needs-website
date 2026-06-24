interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-card border border-dashed border-dove bg-fog px-6 py-16 text-center">
      <p className="text-[17px] font-[480] tracking-[-0.01em] text-ink">
        {title}
      </p>
      {description && (
        <p className="mx-auto mt-2 max-w-[420px] text-[15px] leading-[1.5] text-graphite">
          {description}
        </p>
      )}
    </div>
  );
}
