"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { SpotCheckRow } from "@/lib/spot-checks/spot-check.types";
import { Eye, Pencil, Trash2, ShieldAlert } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

/** Flat row type used by the spot-checks table */
export interface SpotCheckTableRow {
  _id: string;
  issueDetails: string;
  actionTaken: string;
  completedBy: string;
  followUpNeeded: string;
  notes: string;
}

/** Map API response → flat table rows */
export function toSpotCheckTableRows(
  spotChecks: SpotCheckRow[],
): SpotCheckTableRow[] {
  return spotChecks.map((sc) => ({
    _id: sc._id,
    issueDetails: sc.issueDetails,
    actionTaken: sc.actionTaken || "—",
    completedBy: sc.completedBy || "—",
    followUpNeeded: sc.followUpNeeded || "—",
    notes: sc.notes || "—",
  }));
}

const columns: Column<SpotCheckTableRow>[] = [
  { key: "issueDetails", title: "Issue Details" },
  { key: "actionTaken", title: "Action Taken" },
  { key: "completedBy", title: "Completed By" },
  { key: "followUpNeeded", title: "Follow-Up Needed" },
  { key: "notes", title: "Notes" },
];

interface SpotChecksTableProps {
  data: SpotCheckTableRow[];
  onAddSpotCheck: () => void;
  onView: (row: SpotCheckTableRow) => void;
  onEdit: (row: SpotCheckTableRow) => void;
  onDelete: (row: SpotCheckTableRow) => void;
}

export default function SpotChecksTable({
  data,
  onAddSpotCheck,
  onView,
  onEdit,
  onDelete,
}: SpotChecksTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Spot Check",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddSpotCheck,
          icon: <ShieldAlert className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<SpotCheckTableRow>[] = [
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
    <UniversalTable<SpotCheckTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
