interface Props {
  slots: Record<string, unknown>;
}

const LABELS: Record<string, string> = {
  budget_hkd: "Budget",
  occasion: "Occasion",
  wine_type: "Type",
  region: "Region",
  food_pairing: "Food",
};

export default function SlotTracker({ slots }: Props) {
  const filled = Object.entries(slots).filter(([, v]) => v != null);
  if (filled.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2 border-t">
      {filled.map(([key, value]) => (
        <span
          key={key}
          className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1"
        >
          {LABELS[key] ?? key}: {String(value)}
        </span>
      ))}
    </div>
  );
}
