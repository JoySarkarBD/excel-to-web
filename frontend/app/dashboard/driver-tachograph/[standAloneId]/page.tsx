"use client";

import { AddTachographModal } from "@/components/dashboard/driver-tachograph/AddTachographModal";
import DeleteTachographDialog from "@/components/dashboard/driver-tachograph/DeleteTachographModal";
import EditTachographModal from "@/components/dashboard/driver-tachograph/EditTachographModal";
import TachoGraphHeader from "@/components/dashboard/driver-tachograph/TachoGraphHeader";
import {
  default as TachoGraphTable,
  TachoGraphTableRow,
} from "@/components/dashboard/driver-tachograph/TachoGraphTable";
import ViewTachographModal from "@/components/dashboard/driver-tachograph/ViewTachographModal";
import {
  CreateDriverTachographInput,
  DriverTachographRow,
  UpdateDriverTachographInput,
} from "@/lib/driver-tachograph/tachograph.types";
import { DriverTachographAction } from "@/service/driver-tachograph";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

function toTableRow(t: DriverTachographRow): TachoGraphTableRow {
  return {
    id: t._id,
    driverId: t.driverId,
    vehicleId: t.vehicleId,
    typeOfInfringement: t.typeOfInfringement || "—",
    details: t.details || "—",
    actionTaken: t.actionTaken || "—",
    reviewedBy: t.reviewedBy,
    signed: t.signed || false,
  };
}

export default function TachographListPage({ params }: PageProps) {
  const { standAloneId } = use(params);

  const [rows, setRows] = useState<TachoGraphTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewTachograph, setViewTachograph] =
    useState<TachoGraphTableRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editTachograph, setEditTachograph] =
    useState<TachoGraphTableRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TachoGraphTableRow | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Fetch tachographs ----------
  const fetchTachographs = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await DriverTachographAction.getDriverTachographs(
          standAloneId,
          {
            searchKey: search || undefined,
          },
        );
        if (res.status && res.data) {
          const tachographs = Array.isArray(res.data.tachographs)
            ? res.data.tachographs
            : [];
          setRows(tachographs.map(toTableRow));
        } else {
          setError(res.message || "Failed to load tachographs");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load tachographs",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    fetchTachographs();
  }, [fetchTachographs]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTachographs(value);
    }, 400);
  };

  // ---------- Create tachograph ----------
  const handleCreateTachograph = async (data: CreateDriverTachographInput) => {
    try {
      const res = await DriverTachographAction.createDriverTachograph(data);
      if (res.status) {
        toast.success(res.message || "Tachograph created successfully");
        setAddOpen(false);
        fetchTachographs(searchQuery);
      } else {
        toast.error(res.message || "Failed to create tachograph");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create tachograph",
      );
    }
  };

  // ---------- View tachograph ----------
  const handleView = async (row: TachoGraphTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await DriverTachographAction.getDriverTachograph(
        row.id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewTachograph(toTableRow(res.data));
      } else {
        toast.error(res.message || "Failed to load tachograph details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load tachograph details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- Edit tachograph ----------
  const handleEditOpen = async (row: TachoGraphTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await DriverTachographAction.getDriverTachograph(
        row.id,
        standAloneId,
      );
      if (res.status && res.data) {
        setEditTachograph(toTableRow(res.data));
      } else {
        toast.error(res.message || "Failed to load tachograph details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load tachograph details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateTachograph = async (data: UpdateDriverTachographInput) => {
    if (!editTachograph) return;
    try {
      const res = await DriverTachographAction.updateDriverTachograph(
        editTachograph.id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Tachograph updated successfully");
        setEditOpen(false);
        setEditTachograph(null);
        fetchTachographs(searchQuery);
      } else {
        toast.error(res.message || "Failed to update tachograph");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update tachograph",
      );
    }
  };

  // ---------- Delete vehicle ----------
  const handleDeleteOpen = (row: TachoGraphTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await DriverTachographAction.deleteDriverTachograph(
        deleteTarget.id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Tachograph deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchTachographs(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete tachograph");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete vehicle",
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
          <p className="text-muted-foreground">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <TachoGraphHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <TachoGraphTable
        data={rows}
        onAddTachograph={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddTachographModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateTachograph}
        standAloneId={standAloneId}
      />

      <ViewTachographModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewTachograph(null);
        }}
        vehicle={viewTachograph}
        loading={viewLoading}
        standAloneId={standAloneId}
      />

      <EditTachographModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTachograph(null);
        }}
        onSubmit={handleUpdateTachograph}
        vehicle={editTachograph}
        loading={editLoading}
        standAloneId={standAloneId}
      />

      <DeleteTachographDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        tachographId={deleteTarget?.id || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
