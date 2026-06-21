interface SummaryListProps {
  title: string;
  items: string[];
}

export function SummaryList({ title, items }: SummaryListProps) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
