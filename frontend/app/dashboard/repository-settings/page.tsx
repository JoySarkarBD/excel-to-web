"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import RepositoryHeader from "@/components/dashboard/repository/RepositoryHeader";
import RepositoryCheckboxGrid from "@/components/dashboard/repository/RepositoryCheckboxGrid";
import RepositoryConfirmDialog from "@/components/dashboard/repository/RepositoryConfirmDialog";

import { RepositorySettingsAction } from "@/service/repository-settings";
import { notifyRepositorySettingsUpdated } from "@/lib/repository/repository.cookies";
import {
  RepositorySettingsFlags,
  SETTINGS_META,
} from "@/lib/repository/repository.types";

export default function RepositorySettings() {
  const [flags, setFlags] = useState<RepositorySettingsFlags | null>(null);
  const [originalFlags, setOriginalFlags] =
    useState<RepositorySettingsFlags | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await RepositorySettingsAction.getSettings();
        if (res.status && res.data) {
          setFlags(res.data);
          setOriginalFlags(res.data);
        } else {
          setError(res.message || "Failed to load settings");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      }
    };
    fetch();
  }, []);

  const handleToggle = (key: keyof RepositorySettingsFlags) => {
    if (!flags) return;
    setFlags({ ...flags, [key]: !flags[key] });
  };

  const handleApply = () => {
    setShowAlert(true);
  };

  const handleConfirmSave = async () => {
    if (!flags || !originalFlags) return;

    // Build a partial payload with only changed keys
    const changed: Partial<RepositorySettingsFlags> = {};
    for (const meta of SETTINGS_META) {
      if (flags[meta.key] !== originalFlags[meta.key]) {
        changed[meta.key] = flags[meta.key];
      }
    }

    if (Object.keys(changed).length === 0) {
      toast.info("No changes to save.");
      setShowAlert(false);
      return;
    }

    setSaving(true);
    try {
      const res = await RepositorySettingsAction.updateSettings(changed);
      if (res.status && res.data) {
        setFlags(res.data);
        setOriginalFlags(res.data);
        notifyRepositorySettingsUpdated();
        toast.success("Repository settings updated successfully.");
      } else {
        toast.error(res.message || "Failed to update settings");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update settings",
      );
    } finally {
      setSaving(false);
      setShowAlert(false);
    }
  };

  const handleCancelSave = () => {
    // Revert to last-saved state
    if (originalFlags) setFlags(originalFlags);
    setShowAlert(false);
  };

  // Filter metadata by search query
  const displayedMeta =
    searchQuery.trim() === ""
      ? SETTINGS_META
      : SETTINGS_META.filter((m) =>
          m.label.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  // ---------- Loading / Error states ----------
  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (!flags) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading Repositories...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <RepositoryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Card className="rounded-none border-none shadow-none">
        <CardContent>
          <RepositoryCheckboxGrid
            items={displayedMeta}
            flags={flags}
            onToggle={handleToggle}
          />

          <div className="mt-4 border-t pt-6">
            <Button className="rounded-none px-10" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <RepositoryConfirmDialog
        open={showAlert}
        onOpenChange={setShowAlert}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
        loading={saving}
      />
    </div>
  );
}
