"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column } from "@/components/universal-table/table.types";
import { ClientRow } from "@/lib/clients/client.types";
import { UserPlus } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

/** Flat row type used by the table */
export interface ClientTableRow {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  joinedAt: string;
}

/** Map API response → flat rows */
export function toTableRows(rows: ClientRow[]): ClientTableRow[] {
  return rows.map((r) => ({
    _id: r.client._id,
    fullName: r.client.fullName,
    email: r.client.email,
    phone: r.client.phone || "—",
    status: r.status,
    joinedAt: r.approvedAt
      ? new Date(r.approvedAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
  }));
}

const columns: Column<ClientTableRow>[] = [
  { key: "fullName", title: "Full Name" },
  { key: "email", title: "Email" },
  { key: "phone", title: "Phone" },
  {
    key: "status",
    title: "Status",
    render: (row) => (
      <span
        className={
          row.status === "approved"
            ? "text-green-600 font-medium capitalize"
            : row.status === "pending"
              ? "text-yellow-600 font-medium capitalize"
              : "text-muted-foreground font-medium capitalize"
        }
      >
        {row.status}
      </span>
    ),
  },
  { key: "joinedAt", title: "Joined At" },
];

interface ClientsTableProps {
  data: ClientTableRow[];
  onAddClient: () => void;
}

export default function ClientsTable({ data, onAddClient }: ClientsTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Client",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddClient,
          icon: <UserPlus className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  return (
    <UniversalTable<ClientTableRow>
      data={data}
      columns={columns}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
