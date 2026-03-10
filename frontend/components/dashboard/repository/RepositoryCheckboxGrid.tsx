"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RepositorySettingsFlags, SettingMeta } from "@/lib/repository/repository.types";

interface RepositoryCheckboxGridProps {
  items: SettingMeta[];
  flags: RepositorySettingsFlags;
  onToggle: (key: keyof RepositorySettingsFlags) => void;
}

export default function RepositoryCheckboxGrid({
  items,
  flags,
  onToggle,
}: RepositoryCheckboxGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-foreground py-8 text-center">
        No matching repositories found.
      </div>
    );
  }

  const half = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, half);
  const rightColumn = items.slice(half);

  const renderItem = (meta: SettingMeta) => (
    <div key={meta.key} className="flex items-center space-x-3 py-2">
      <Checkbox
        id={meta.key}
        checked={flags[meta.key]}
        onCheckedChange={() => onToggle(meta.key)}
      />
      <Label
        htmlFor={meta.key}
        className="text-foreground cursor-pointer text-sm font-normal"
      >
        {meta.label}
      </Label>
    </div>
  );

  return (
    <div className="text-foreground grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
      <div className="space-y-2">{leftColumn.map(renderItem)}</div>
      <div className="space-y-2">{rightColumn.map(renderItem)}</div>
    </div>
  );
}
