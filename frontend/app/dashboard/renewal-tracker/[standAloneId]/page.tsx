"use client";

import AddRenewalTrackerModal from "@/components/dashboard/renewal-tracker/AddRenewalTrackerModal";
import DeleteRenewalTrackerDialog from "@/components/dashboard/renewal-tracker/DeleteRenewalTrackerDialog";
import EditRenewalTrackerModal from "@/components/dashboard/renewal-tracker/EditRenewalTrackerModal";
import RenewalTrackerHeader from "@/components/dashboard/renewal-tracker/RenewalTrackerHeader";
import {
  default as RenewalTrackerTable,
  RenewalTrackerTableRow,
  toRenewalTrackerTableRows,
} from "@/components/dashboard/renewal-tracker/RenewalTrackerTable";
import ViewRenewalTrackerModal from "@/components/dashboard/renewal-tracker/ViewRenewalTrackerModal";
import {
  CreateRenewalTrackerInput,
  UpdateRenewalTrackerInput,
} from "@/lib/renewal-tracker/renewal-tracker.types";
import { RenewalTrackerAction } from "@/service/renewal-tracker";
import { PolicyProcedureAction } from "@/service/policy-procedure";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PolicyProcedureOption {
  value: string;
  label: string;
  responsiblePerson: string;
}

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function RenewalTrackerListPage({ params }: PageProps) {
  const { standAloneId } = use(params);

  const [rows, setRows] = useState<RenewalTrackerTableRow[]>([]);
  const [policyProcedureOptions, setPolicyProcedureOptions] = useState<
    PolicyProcedureOption[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewRenewalTracker, setViewRenewalTracker] =
    useState<RenewalTrackerTableRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editRenewalTracker, setEditRenewalTracker] =
    useState<RenewalTrackerTableRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<RenewalTrackerTableRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Fetch renewal trackers ----------
  const fetchRenewalTrackers = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await RenewalTrackerAction.getRenewalTrackers(
          standAloneId,
          {
            searchKey: search || undefined,
          },
        );
        if (res.status && res.data) {
          const renewalTrackers = Array.isArray(res.data.renewalTrackers)
            ? res.data.renewalTrackers
            : [];
          setRows(toRenewalTrackerTableRows(renewalTrackers));
        } else {
          setError(res.message || "Failed to load renewal trackers");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load renewal trackers",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  const fetchPolicyProcedureOptions = useCallback(async () => {
    try {
      let policies: Array<{
        _id: string;
        policyName: string;
        responsiblePerson: string;
      }> = [];

      try {
        const managerRes = await PolicyProcedureAction.getPolicyProcedures(
          standAloneId,
          {
            showPerPage: 200,
          },
        );

        if (managerRes.status && managerRes.data?.policyProcedures) {
          policies = managerRes.data.policyProcedures;
        }
      } catch {
        // Fallback for standalone-user flows where standAloneId query is not accepted.
        const standAloneRes =
          await PolicyProcedureAction.getPolicyProceduresAsStandAlone({
            showPerPage: 200,
          });
        if (standAloneRes.status && standAloneRes.data?.policyProcedures) {
          policies = standAloneRes.data.policyProcedures;
        }
      }

      const options = policies.map((policy) => ({
        value: policy._id,
        label: policy.policyName,
        responsiblePerson: policy.responsiblePerson,
      }));

      setPolicyProcedureOptions(options);
    } catch {
      setPolicyProcedureOptions([]);
    }
  }, [standAloneId]);

  useEffect(() => {
    fetchRenewalTrackers();
    fetchPolicyProcedureOptions();
  }, [fetchRenewalTrackers, fetchPolicyProcedureOptions]);

  useEffect(() => {
    if (addOpen || editOpen) {
      fetchPolicyProcedureOptions();
    }
  }, [addOpen, editOpen, fetchPolicyProcedureOptions]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchRenewalTrackers(value);
    }, 400);
  };

  // ---------- Create renewal tracker ----------
  const handleCreateRenewalTracker = async (
    data: CreateRenewalTrackerInput,
  ) => {
    try {
      const res = await RenewalTrackerAction.createRenewalTracker(data);
      if (res.status) {
        toast.success(res.message || "Renewal tracker created successfully");
        setAddOpen(false);
        fetchRenewalTrackers(searchQuery);
      } else {
        toast.error(res.message || "Failed to create renewal tracker");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create renewal tracker",
      );
    }
  };

  // ---------- View renewal tracker ----------
  const handleView = async (row: RenewalTrackerTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await RenewalTrackerAction.getRenewalTracker(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewRenewalTracker(toRenewalTrackerTableRows([res.data])[0]);
      } else {
        toast.error(res.message || "Failed to load renewal tracker details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load renewal tracker details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- Edit renewal tracker ----------
  const handleEditOpen = async (row: RenewalTrackerTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await RenewalTrackerAction.getRenewalTracker(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setEditRenewalTracker(toRenewalTrackerTableRows([res.data])[0]);
      } else {
        toast.error(res.message || "Failed to load renewal tracker details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load renewal tracker details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateRenewalTracker = async (
    data: UpdateRenewalTrackerInput,
  ) => {
    if (!editRenewalTracker) return;
    try {
      const res = await RenewalTrackerAction.updateRenewalTracker(
        editRenewalTracker._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Renewal tracker updated successfully");
        setEditOpen(false);
        setEditRenewalTracker(null);
        fetchRenewalTrackers(searchQuery);
      } else {
        toast.error(res.message || "Failed to update renewal tracker");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update renewal tracker",
      );
    }
  };

  // ---------- Delete renewal tracker ----------
  const handleDeleteOpen = (row: RenewalTrackerTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await RenewalTrackerAction.deleteRenewalTracker(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Renewal tracker deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchRenewalTrackers(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete renewal tracker");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete renewal tracker",
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
          <p className="text-muted-foreground">Loading renewal trackers...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <RenewalTrackerHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <RenewalTrackerTable
        data={rows}
        onAddRenewalTracker={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddRenewalTrackerModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateRenewalTracker}
        standAloneId={standAloneId}
        policyProcedureOptions={policyProcedureOptions}
      />

      <ViewRenewalTrackerModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewRenewalTracker(null);
        }}
        renewalTracker={viewRenewalTracker}
        loading={viewLoading}
      />

      <EditRenewalTrackerModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditRenewalTracker(null);
        }}
        onSubmit={handleUpdateRenewalTracker}
        renewalTracker={editRenewalTracker}
        loading={editLoading}
        policyProcedureOptions={policyProcedureOptions}
      />

      <DeleteRenewalTrackerDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.item || ""}
        loading={deleteLoading}
      />
    </div>
  );
}
