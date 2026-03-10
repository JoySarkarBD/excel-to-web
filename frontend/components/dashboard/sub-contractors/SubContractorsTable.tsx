"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { SubContractorRow } from "@/lib/sub-contractors/sub-contractor.types";
import { Eye, Pencil, Trash2, Handshake } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

/** Flat row type used by the sub-contractors table */
export interface SubContractorTableRow {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  hiabAvailable: string;
  rating: string;
}

/** Map API response → flat table rows */
export function toSubContractorTableRows(
  subContractors: SubContractorRow[],
): SubContractorTableRow[] {
  return subContractors.map((sc) => ({
    _id: sc._id,
    companyName: sc.companyName,
    contactPerson: sc.contactPerson,
    phone: sc.phone,
    email: sc.email,
    hiabAvailable: sc.hiabAvailable ? "Yes" : "No",
    rating: sc.rating ? `${sc.rating}/5` : "—",
  }));
}

const columns: Column<SubContractorTableRow>[] = [
  { key: "companyName", title: "Company Name" },
  { key: "contactPerson", title: "Contact Person" },
  { key: "phone", title: "Phone" },
  { key: "email", title: "Email" },
  {
    key: "hiabAvailable",
    title: "HIAB",
    render: (row) => (
      <span
        className={
          row.hiabAvailable === "Yes"
            ? "font-medium text-green-600"
            : "font-medium text-red-500"
        }
      >
        {row.hiabAvailable}
      </span>
    ),
  },
  { key: "rating", title: "Rating" },
];

interface SubContractorsTableProps {
  data: SubContractorTableRow[];
  onAddSubContractor: () => void;
  onView: (row: SubContractorTableRow) => void;
  onEdit: (row: SubContractorTableRow) => void;
  onDelete: (row: SubContractorTableRow) => void;
}

export default function SubContractorsTable({
  data,
  onAddSubContractor,
  onView,
  onEdit,
  onDelete,
}: SubContractorsTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Subcontractor",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddSubContractor,
          icon: <Handshake className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<SubContractorTableRow>[] = [
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
    <UniversalTable<SubContractorTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
