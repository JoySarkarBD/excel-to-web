"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RenewalTrackerHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function RenewalTrackerHeader({
  searchQuery,
  onSearchChange,
}: RenewalTrackerHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Renewal Tracker</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track renewal items, expiry dates, and reminders
        </p>
      </div>
      <div className="relative w-80">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search renewal items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
