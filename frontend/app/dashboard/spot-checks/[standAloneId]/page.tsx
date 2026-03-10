"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import SpotCheckHeader from "@/components/dashboard/spot-checks/SpotCheckHeader";
import SpotChecksTable, {
  SpotCheckTableRow,
  toSpotCheckTableRows,
} from "@/components/dashboard/spot-checks/SpotChecksTable";
import AddSpotCheckModal from "@/components/dashboard/spot-checks/AddSpotCheckModal";
import ViewSpotCheckModal from "@/components/dashboard/spot-checks/ViewSpotCheckModal";
import EditSpotCheckModal from "@/components/dashboard/spot-checks/EditSpotCheckModal";
import DeleteSpotCheckDialog from "@/components/dashboard/spot-checks/DeleteSpotCheckDialog";

import { SpotCheckAction } from "@/service/spot-check";
import {
  CreateSpotCheckInput,
  UpdateSpotCheckInput,
  SpotCheckRow,
} from "@/lib/spot-checks/spot-check.types";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function SpotChecksPage({ params }: PageProps) {
  const { standAloneId } = use(params);

  const [rows, setRows] = useState<SpotCheckTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewSpotCheck, setViewSpotCheck] = useState<SpotCheckRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editSpotCheck, setEditSpotCheck] = useState<SpotCheckRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SpotCheckTableRow | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Fetch spot checks ----------
  const fetchSpotChecks = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await SpotCheckAction.getSpotChecks(standAloneId, {
          searchKey: search || undefined,
          showPerPage: 100,
        });
        if (res.status && res.data) {
          setRows(toSpotCheckTableRows(res.data.spotChecks));
        } else {
          setError(res.message || "Failed to load spot checks");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load spot checks",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    fetchSpotChecks();
  }, [fetchSpotChecks]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSpotChecks(value);
    }, 400);
  };

  // ---------- Create spot check ----------
  const handleCreateSpotCheck = async (data: CreateSpotCheckInput) => {
    try {
      const res = await SpotCheckAction.createSpotCheck(data);
      if (res.status) {
        toast.success(res.message || "Spot check created successfully");
        setAddOpen(false);
        fetchSpotChecks(searchQuery);
      } else {
        toast.error(res.message || "Failed to create spot check");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create spot check",
      );
    }
  };

  // ---------- View spot check ----------
  const handleView = async (row: SpotCheckTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await SpotCheckAction.getSpotCheck(row._id, standAloneId);
      if (res.status && res.data) {
        setViewSpotCheck(res.data);
      } else {
        toast.error(res.message || "Failed to load spot check details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load spot check details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- Edit spot check ----------
  const handleEditOpen = async (row: SpotCheckTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await SpotCheckAction.getSpotCheck(row._id, standAloneId);
      if (res.status && res.data) {
        setEditSpotCheck(res.data);
      } else {
        toast.error(res.message || "Failed to load spot check details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load spot check details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateSpotCheck = async (data: UpdateSpotCheckInput) => {
    if (!editSpotCheck) return;
    try {
      const res = await SpotCheckAction.updateSpotCheck(
        editSpotCheck._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Spot check updated successfully");
        setEditOpen(false);
        setEditSpotCheck(null);
        fetchSpotChecks(searchQuery);
      } else {
        toast.error(res.message || "Failed to update spot check");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update spot check",
      );
    }
  };

  // ---------- Delete spot check ----------
  const handleDeleteOpen = (row: SpotCheckTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await SpotCheckAction.deleteSpotCheck(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Spot check deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchSpotChecks(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete spot check");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete spot check",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ---------- Error state ----------
  if (error) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // ---------- Loading state ----------
  if (loading && rows.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl py-10">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading spot checks...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <SpotCheckHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <SpotChecksTable
        data={rows}
        onAddSpotCheck={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddSpotCheckModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateSpotCheck}
        standAloneId={standAloneId}
      />

      <ViewSpotCheckModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewSpotCheck(null);
        }}
        spotCheck={viewSpotCheck}
        loading={viewLoading}
        standAloneId={standAloneId}
      />

      <EditSpotCheckModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditSpotCheck(null);
        }}
        onSubmit={handleUpdateSpotCheck}
        spotCheck={editSpotCheck}
        loading={editLoading}
        standAloneId={standAloneId}
      />

      <DeleteSpotCheckDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        issueDetails={deleteTarget?.issueDetails || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
