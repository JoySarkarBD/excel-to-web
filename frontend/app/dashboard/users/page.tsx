"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import UsersHeader from "@/components/dashboard/users/UsersHeader";
import ClientsTable, {
  ClientTableRow,
  toTableRows,
} from "@/components/dashboard/users/ClientsTable";
import AddClientModal from "@/components/dashboard/users/AddClientModal";

import { ClientAction } from "@/service/client";
import { CreateClientInput } from "@/lib/clients/client.types";

export default function UsersPage() {
  const [rows, setRows] = useState<ClientTableRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Fetch clients ----------
  const fetchClients = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const res = await ClientAction.getClients({
        searchKey: search || undefined,
      });
      if (res.status && res.data) {
        setRows(toTableRows(res.data.data));
      } else {
        setError(res.message || "Failed to load clients");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Debounced search — calls API with searchKey
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchClients(value);
    }, 400);
  };

  // ---------- Create client ----------
  const handleCreateClient = async (data: CreateClientInput) => {
    setCreating(true);
    try {
      const res = await ClientAction.createClient(data);
      if (res.status) {
        toast.success(res.message || "Client created successfully");
        setModalOpen(false);
        fetchClients(searchQuery); // Refresh list
      } else {
        toast.error(res.message || "Failed to create client");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create client",
      );
    } finally {
      setCreating(false);
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
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  // ---------- Main UI ----------
  return (
    <div className="mx-auto py-4 lg:mr-10">
      <UsersHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <ClientsTable data={rows} onAddClient={() => setModalOpen(true)} />

      <AddClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateClient}
        loading={creating}
      />
    </div>
  );
}
