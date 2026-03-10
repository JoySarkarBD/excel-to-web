"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import VehicleHeader from "@/components/dashboard/vehicles/VehicleHeader";
import VehiclesTable, {
  VehicleTableRow,
  toVehicleTableRows,
} from "@/components/dashboard/vehicles/VehiclesTable";
import AddVehicleModal from "@/components/dashboard/vehicles/AddVehicleModal";
import ViewVehicleModal from "@/components/dashboard/vehicles/ViewVehicleModal";
import EditVehicleModal from "@/components/dashboard/vehicles/EditVehicleModal";
import DeleteVehicleDialog from "@/components/dashboard/vehicles/DeleteVehicleDialog";

import { VehicleAction } from "@/service/vehicle";
import {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleRow,
} from "@/lib/vehicles/vehicle.types";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function VehicleListPage({ params }: PageProps) {
  const { standAloneId } = use(params);

  const [rows, setRows] = useState<VehicleTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewVehicle, setViewVehicle] = useState<VehicleRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<VehicleRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VehicleTableRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Fetch vehicles ----------
  const fetchVehicles = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await VehicleAction.getVehicles(standAloneId, {
          searchKey: search || undefined,
        });
        if (res.status && res.data) {
          setRows(toVehicleTableRows(res.data.vehicles));
        } else {
          setError(res.message || "Failed to load vehicles");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load vehicles",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchVehicles(value);
    }, 400);
  };

  // ---------- Create vehicle ----------
  const handleCreateVehicle = async (data: CreateVehicleInput) => {
    try {
      const res = await VehicleAction.createVehicle(data);
      if (res.status) {
        toast.success(res.message || "Vehicle created successfully");
        setAddOpen(false);
        fetchVehicles(searchQuery);
      } else {
        toast.error(res.message || "Failed to create vehicle");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create vehicle",
      );
    }
  };

  // ---------- View vehicle ----------
  const handleView = async (row: VehicleTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await VehicleAction.getVehicle(row._id, standAloneId);
      if (res.status && res.data) {
        setViewVehicle(res.data);
      } else {
        toast.error(res.message || "Failed to load vehicle details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load vehicle details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- Edit vehicle ----------
  const handleEditOpen = async (row: VehicleTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await VehicleAction.getVehicle(row._id, standAloneId);
      if (res.status && res.data) {
        setEditVehicle(res.data);
      } else {
        toast.error(res.message || "Failed to load vehicle details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load vehicle details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateVehicle = async (data: UpdateVehicleInput) => {
    if (!editVehicle) return;
    try {
      const res = await VehicleAction.updateVehicle(
        editVehicle._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Vehicle updated successfully");
        setEditOpen(false);
        setEditVehicle(null);
        fetchVehicles(searchQuery);
      } else {
        toast.error(res.message || "Failed to update vehicle");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update vehicle",
      );
    }
  };

  // ---------- Delete vehicle ----------
  const handleDeleteOpen = (row: VehicleTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await VehicleAction.deleteVehicle(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Vehicle deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchVehicles(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete vehicle");
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
      <VehicleHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <VehiclesTable
        data={rows}
        onAddVehicle={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddVehicleModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateVehicle}
        standAloneId={standAloneId}
      />

      <ViewVehicleModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewVehicle(null);
        }}
        vehicle={viewVehicle}
        loading={viewLoading}
        standAloneId={standAloneId}
      />

      <EditVehicleModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditVehicle(null);
        }}
        onSubmit={handleUpdateVehicle}
        vehicle={editVehicle}
        loading={editLoading}
        standAloneId={standAloneId}
      />

      <DeleteVehicleDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        vehicleRegId={deleteTarget?.vehicleRegId || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
