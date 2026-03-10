import { Column, TableAction } from "@/components/universal-table/table.types";
import UniversalTable, {
  HeaderActionGroup,
} from "@/components/universal-table/UniversalTable";
import { CarFront, Eye, Pencil, Trash2 } from "lucide-react";

export interface TachoGraphTableRow {
  id: string;
  driverId: string;
  vehicleId: string;
  typeOfInfringement?: string;
  details?: string;
  actionTaken?: string;
  reviewedBy: string;
  signed?: boolean;
}

/** Map API response to table row interface */
export function toTachoGraphTableRows(
  tachographEntries: TachoGraphTableRow[],
): TachoGraphTableRow[] {
  return tachographEntries.map((entry) => ({
    id: entry.id,
    driverId: entry.driverId,
    vehicleId: entry.vehicleId,
    typeOfInfringement: entry.typeOfInfringement || "—",
    details: entry.details || "—",
    actionTaken: entry.actionTaken || "—",
    reviewedBy: entry.reviewedBy,
    signed: entry.signed || false,
  }));
}

const columns: Column<TachoGraphTableRow>[] = [
  { key: "driverId", title: "Driver ID" },
  { key: "vehicleId", title: "Vehicle ID" },
  { key: "typeOfInfringement", title: "Type of Infringement" },
  { key: "details", title: "Details" },
  { key: "actionTaken", title: "Action Taken" },
  { key: "reviewedBy", title: "Reviewed By" },
  {
    key: "signed",
    title: "Signed",
    render: (row) => (
      <span
        className={
          row.signed ? "font-medium text-green-600" : "font-medium text-red-500"
        }
      >
        {row.signed ? "Yes" : "No"}
      </span>
    ),
  },
];

interface TachoGraphTableProps {
  data: TachoGraphTableRow[];
  onAddTachograph: () => void;
  onView: (row: TachoGraphTableRow) => void;
  onEdit: (row: TachoGraphTableRow) => void;
  onDelete: (row: TachoGraphTableRow) => void;
}

export default function TachoGraphTable({
  data,
  onAddTachograph,
  onView,
  onEdit,
  onDelete,
}: TachoGraphTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Driver Tachograph",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddTachograph,
          icon: <CarFront className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];
  const actions: TableAction<TachoGraphTableRow>[] = [
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
    <UniversalTable<TachoGraphTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row.id}
      headerActionGroups={headerActionGroups}
    />
  );
}
