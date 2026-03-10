"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { DriverRow, CheckStatus } from "@/lib/drivers/driver.types";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

/** Flat row type used by the drivers table */
export interface DriverTableRow {
  _id: string;
  fullName: string;
  licenseNumber: string;
  niNumber: string;
  postCode: string;
  points: number;
  employed: string;
  checkStatus: string;
  nextCheckDueDate: string;
}

/** Map API response → flat table rows */
export function toDriverTableRows(drivers: DriverRow[]): DriverTableRow[] {
  return drivers.map((d) => ({
    _id: d._id,
    fullName: d.fullName,
    licenseNumber: d.licenseNumber,
    niNumber: d.niNumber,
    postCode: d.postCode,
    points: d.points,
    employed: d.employed ? "Yes" : "No",
    checkStatus: d.checkStatus || "—",
    nextCheckDueDate: d.nextCheckDueDate
      ? new Date(d.nextCheckDueDate).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—",
  }));
}

const columns: Column<DriverTableRow>[] = [
  { key: "fullName", title: "Full Name" },
  { key: "licenseNumber", title: "License Number" },
  { key: "niNumber", title: "NI Number" },
  { key: "postCode", title: "Post Code" },
  { key: "points", title: "Points" },
  {
    key: "employed",
    title: "Employed",
    render: (row) => (
      <span
        className={
          row.employed === "Yes"
            ? "font-medium text-green-600"
            : "font-medium text-red-500"
        }
      >
        {row.employed}
      </span>
    ),
  },
  {
    key: "checkStatus",
    title: "Check Status",
    render: (row) => (
      <span
        className={
          row.checkStatus === CheckStatus.OKAY
            ? "font-medium text-green-600"
            : row.checkStatus === CheckStatus.DUE
              ? "font-medium text-yellow-600"
              : "text-muted-foreground"
        }
      >
        {row.checkStatus}
      </span>
    ),
  },
  { key: "nextCheckDueDate", title: "Next Check Due" },
];

interface DriversTableProps {
  data: DriverTableRow[];
  onAddDriver: () => void;
  onView: (row: DriverTableRow) => void;
  onEdit: (row: DriverTableRow) => void;
  onDelete: (row: DriverTableRow) => void;
}

export default function DriversTable({
  data,
  onAddDriver,
  onView,
  onEdit,
  onDelete,
}: DriversTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Driver",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddDriver,
          icon: <UserPlus className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<DriverTableRow>[] = [
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
    <UniversalTable<DriverTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
