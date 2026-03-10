"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import {
  RenewalTrackerRow,
  RenewalTrackerStatus,
} from "@/lib/renewal-tracker/renewal-tracker.types";
import { Eye, Pencil, Trash2, Calendar } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

/** Flat row type used by the renewal tracker table */
export interface RenewalTrackerTableRow {
  _id: string;
  type: string;
  item: string;
  description: string;
  refOrPolicyNoId: string;
  refOrPolicyNo: string;
  responsiblePersonId: string;
  responsiblePerson: string;
  providerOrIssuer: string;
  startDate: string;
  expiryOrDueDate: string;
  status: string;
  reminderSet: string;
  notes: string;
}

/** Map API response → flat table rows */
export function toRenewalTrackerTableRows(
  renewalTrackers: RenewalTrackerRow[],
): RenewalTrackerTableRow[] {
  return renewalTrackers.map((rt) => ({
    _id: rt._id,
    type: rt.type,
    item: rt.item,
    description: rt.description || "—",
    refOrPolicyNoId: rt.refOrPolicyNo || "",
    refOrPolicyNo: rt.refOrPolicyNoName || rt.refOrPolicyNo || "—",
    responsiblePersonId: rt.responsiblePerson || "",
    responsiblePerson: rt.responsiblePersonName || rt.responsiblePerson || "—",
    providerOrIssuer: rt.providerOrIssuer || "—",
    startDate: rt.startDate ? new Date(rt.startDate).toLocaleDateString() : "—",
    expiryOrDueDate: rt.expiryOrDueDate
      ? new Date(rt.expiryOrDueDate).toLocaleDateString()
      : "—",
    status: rt.status || "—",
    reminderSet: rt.reminderSet ? "Yes" : "No",
    notes: rt.notes || "—",
  }));
}

const columns: Column<RenewalTrackerTableRow>[] = [
  { key: "type", title: "Type" },
  { key: "item", title: "Item" },
  { key: "description", title: "Description" },
  { key: "refOrPolicyNo", title: "Ref/Policy No" },
  { key: "responsiblePerson", title: "Responsible Person" },
  { key: "providerOrIssuer", title: "Provider/Issuer" },
  { key: "expiryOrDueDate", title: "Expiry/Due Date" },
  {
    key: "status",
    title: "Status",
    render: (row) => {
      let colorClass = "font-medium text-gray-600";
      if (row.status === RenewalTrackerStatus.ACTIVE) {
        colorClass = "font-medium text-green-600";
      } else if (row.status === RenewalTrackerStatus.DUE_SOON) {
        colorClass = "font-medium text-yellow-600";
      } else if (row.status === RenewalTrackerStatus.EXPIRED) {
        colorClass = "font-medium text-red-500";
      } else if (row.status === RenewalTrackerStatus.SCHEDULED) {
        colorClass = "font-medium text-blue-600";
      }
      return <span className={colorClass}>{row.status}</span>;
    },
  },
  {
    key: "reminderSet",
    title: "Reminder",
    render: (row) => (
      <span
        className={
          row.reminderSet === "Yes"
            ? "font-medium text-green-600"
            : "font-medium text-gray-500"
        }
      >
        {row.reminderSet}
      </span>
    ),
  },
  { key: "notes", title: "Notes" },
];

interface RenewalTrackerTableProps {
  data: RenewalTrackerTableRow[];
  onAddRenewalTracker: () => void;
  onView: (row: RenewalTrackerTableRow) => void;
  onEdit: (row: RenewalTrackerTableRow) => void;
  onDelete: (row: RenewalTrackerTableRow) => void;
}

export default function RenewalTrackerTable({
  data,
  onAddRenewalTracker,
  onView,
  onEdit,
  onDelete,
}: RenewalTrackerTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Renewal Tracker",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddRenewalTracker,
          icon: <Calendar className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<RenewalTrackerTableRow>[] = [
    {
      label: "",
      variant: "view",
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
    },
    {
      label: "",
      variant: "edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      label: "",
      variant: "delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
    },
  ];

  return (
    <UniversalTable<RenewalTrackerTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
