"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import SubContractorHeader from "@/components/dashboard/sub-contractors/SubContractorHeader";
import SubContractorsTable, {
  SubContractorTableRow,
  toSubContractorTableRows,
} from "@/components/dashboard/sub-contractors/SubContractorsTable";
import AddSubContractorModal from "@/components/dashboard/sub-contractors/AddSubContractorModal";
import ViewSubContractorModal from "@/components/dashboard/sub-contractors/ViewSubContractorModal";
import EditSubContractorModal from "@/components/dashboard/sub-contractors/EditSubContractorModal";
import DeleteSubContractorDialog from "@/components/dashboard/sub-contractors/DeleteSubContractorDialog";

import { SubContractorAction } from "@/service/sub-contractor";
import {
  CreateSubContractorInput,
  UpdateSubContractorInput,
  SubContractorRow,
} from "@/lib/sub-contractors/sub-contractor.types";

interface PageProps {
  params: Promise<{ standAloneId: string }>;
}

export default function SubContractorDetailsPage({ params }: PageProps) {
  const { standAloneId } = use(params);

  const [rows, setRows] = useState<SubContractorTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);

  // View modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewSubContractor, setViewSubContractor] =
    useState<SubContractorRow | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editSubContractor, setEditSubContractor] =
    useState<SubContractorRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<SubContractorTableRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Fetch sub-contractors ----------
  const fetchSubContractors = useCallback(
    async (search?: string) => {
      try {
        setLoading(true);
        const res = await SubContractorAction.getSubContractors(standAloneId, {
          searchKey: search || undefined,
          showPerPage: 100,
        });
        if (res.status && res.data) {
          setRows(toSubContractorTableRows(res.data.subContractors));
        } else {
          setError(res.message || "Failed to load subcontractors");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load subcontractors",
        );
      } finally {
        setLoading(false);
      }
    },
    [standAloneId],
  );

  useEffect(() => {
    fetchSubContractors();
  }, [fetchSubContractors]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSubContractors(value);
    }, 400);
  };

  // ---------- Create sub-contractor ----------
  const handleCreateSubContractor = async (data: CreateSubContractorInput) => {
    try {
      const res = await SubContractorAction.createSubContractor(data);
      if (res.status) {
        toast.success(res.message || "Subcontractor created successfully");
        setAddOpen(false);
        fetchSubContractors(searchQuery);
      } else {
        toast.error(res.message || "Failed to create subcontractor");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create subcontractor",
      );
    }
  };

  // ---------- View sub-contractor ----------
  const handleView = async (row: SubContractorTableRow) => {
    setViewOpen(true);
    setViewLoading(true);
    try {
      const res = await SubContractorAction.getSubContractor(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setViewSubContractor(res.data);
      } else {
        toast.error(res.message || "Failed to load subcontractor details");
        setViewOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load subcontractor details",
      );
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // ---------- Edit sub-contractor ----------
  const handleEditOpen = async (row: SubContractorTableRow) => {
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await SubContractorAction.getSubContractor(
        row._id,
        standAloneId,
      );
      if (res.status && res.data) {
        setEditSubContractor(res.data);
      } else {
        toast.error(res.message || "Failed to load subcontractor details");
        setEditOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load subcontractor details",
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateSubContractor = async (data: UpdateSubContractorInput) => {
    if (!editSubContractor) return;
    try {
      const res = await SubContractorAction.updateSubContractor(
        editSubContractor._id,
        standAloneId,
        data,
      );
      if (res.status) {
        toast.success(res.message || "Subcontractor updated successfully");
        setEditOpen(false);
        setEditSubContractor(null);
        fetchSubContractors(searchQuery);
      } else {
        toast.error(res.message || "Failed to update subcontractor");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update subcontractor",
      );
    }
  };

  // ---------- Delete sub-contractor ----------
  const handleDeleteOpen = (row: SubContractorTableRow) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await SubContractorAction.deleteSubContractor(
        deleteTarget._id,
        standAloneId,
      );
      if (res.status) {
        toast.success(res.message || "Subcontractor deleted successfully");
        setDeleteOpen(false);
        setDeleteTarget(null);
        fetchSubContractors(searchQuery);
      } else {
        toast.error(res.message || "Failed to delete subcontractor");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete subcontractor",
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
          <p className="text-muted-foreground">Loading subcontractors...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <SubContractorHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <SubContractorsTable
        data={rows}
        onAddSubContractor={() => setAddOpen(true)}
        onView={handleView}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
      />

      <AddSubContractorModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleCreateSubContractor}
        standAloneId={standAloneId}
      />

      <ViewSubContractorModal
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewSubContractor(null);
        }}
        subContractor={viewSubContractor}
        loading={viewLoading}
      />

      <EditSubContractorModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditSubContractor(null);
        }}
        onSubmit={handleUpdateSubContractor}
        subContractor={editSubContractor}
        loading={editLoading}
      />

      <DeleteSubContractorDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        companyName={deleteTarget?.companyName || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
