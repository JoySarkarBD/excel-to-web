import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { PolicyProcedureRow } from "@/lib/policy-procedures/policy-procedure.types";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";

/* ── flat row for the table ── */

export interface PolicyProcedureTableRow {
  _id: string;
  policyName: string;
  policyCategory: string;
  versionNumber: string;
  reviewStatus: string;
  type: string;
  responsiblePerson: string;
  effectiveDate: string;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function toPolicyProcedureTableRows(
  items: PolicyProcedureRow[],
): PolicyProcedureTableRow[] {
  return items.map((p) => ({
    _id: p._id,
    policyName: p.policyName,
    policyCategory: p.policyCategory,
    versionNumber: `v${p.versionNumber}`,
    reviewStatus: p.reviewStatus,
    type: p.type,
    responsiblePerson: p.responsiblePerson,
    effectiveDate: formatDate(p.effectiveDate),
  }));
}

/* ── columns ── */

const columns: Column<PolicyProcedureTableRow>[] = [
  { key: "policyName", title: "Policy Name" },
  { key: "policyCategory", title: "Category" },
  { key: "type", title: "Type" },
  { key: "versionNumber", title: "Version" },
  {
    key: "reviewStatus",
    title: "Review Status",
    render: (row) => {
      const lower = row.reviewStatus.toLowerCase();
      const color =
        lower === "approved" || lower === "completed"
          ? "text-green-600"
          : lower === "pending"
            ? "text-yellow-600"
            : lower === "overdue" || lower === "rejected"
              ? "text-red-500"
              : "text-foreground";
      return <span className={`font-medium ${color}`}>{row.reviewStatus}</span>;
    },
  },
  { key: "responsiblePerson", title: "Responsible Person" },
  { key: "effectiveDate", title: "Effective Date" },
];

/* ── component ── */

interface PolicyProceduresTableProps {
  data: PolicyProcedureTableRow[];
  onAddPolicy: () => void;
  onView: (row: PolicyProcedureTableRow) => void;
  onEdit: (row: PolicyProcedureTableRow) => void;
  onDelete: (row: PolicyProcedureTableRow) => void;
}

export default function PolicyProceduresTable({
  data,
  onAddPolicy,
  onView,
  onEdit,
  onDelete,
}: PolicyProceduresTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Policy",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddPolicy,
          icon: <FileText className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<PolicyProcedureTableRow>[] = [
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
    <UniversalTable<PolicyProcedureTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
