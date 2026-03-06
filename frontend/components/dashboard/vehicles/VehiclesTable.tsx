"use client";

import UniversalTable from "@/components/universal-table/UniversalTable";
import { Column, TableAction } from "@/components/universal-table/table.types";
import { VehicleRow, VehicleStatus } from "@/lib/vehicles/vehicle.types";
import { Eye, Pencil, Trash2, CarFront } from "lucide-react";
import type { HeaderActionGroup } from "@/components/universal-table/UniversalTable";

/** Flat row type used by the vehicles table */
export interface VehicleTableRow {
  _id: string;
  vehicleRegId: string;
  vehicleType: string;
  licensePlate: string;
  status: string;
  driverPack: string;
  ownerShipStatus: string;
  notes: string;
}

/** Map API response → flat table rows */
export function toVehicleTableRows(vehicles: VehicleRow[]): VehicleTableRow[] {
  return vehicles.map((v) => ({
    _id: v._id,
    vehicleRegId: v.vehicleRegId,
    vehicleType: v.vehicleType,
    licensePlate: v.licensePlate,
    status: v.status,
    driverPack: v.driverPack ? "Yes" : "No",
    ownerShipStatus: v.additionalDetails?.ownerShipStatus || "—",
    notes: v.notes || "—",
  }));
}

const columns: Column<VehicleTableRow>[] = [
  { key: "vehicleRegId", title: "Reg ID" },
  { key: "vehicleType", title: "Vehicle Type" },
  { key: "licensePlate", title: "License Plate" },
  {
    key: "status",
    title: "Status",
    render: (row) => (
      <span
        className={
          row.status === VehicleStatus.ACTIVE
            ? "font-medium text-green-600"
            : row.status === VehicleStatus.INACTIVE
              ? "font-medium text-red-500"
              : "font-medium text-yellow-600"
        }
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "driverPack",
    title: "Driver Pack",
    render: (row) => (
      <span
        className={
          row.driverPack === "Yes"
            ? "font-medium text-green-600"
            : "font-medium text-red-500"
        }
      >
        {row.driverPack}
      </span>
    ),
  },
  { key: "ownerShipStatus", title: "Ownership" },
  { key: "notes", title: "Notes" },
];

interface VehiclesTableProps {
  data: VehicleTableRow[];
  onAddVehicle: () => void;
  onView: (row: VehicleTableRow) => void;
  onEdit: (row: VehicleTableRow) => void;
  onDelete: (row: VehicleTableRow) => void;
}

export default function VehiclesTable({
  data,
  onAddVehicle,
  onView,
  onEdit,
  onDelete,
}: VehiclesTableProps) {
  const headerActionGroups: HeaderActionGroup[] = [
    {
      title: "",
      startingActionGroup: [],
      endActionGroup: [
        {
          label: "Add Vehicle",
          className: "btn btn-sm btn-primary rounded-xs",
          onClick: onAddVehicle,
          icon: <CarFront className="h-4 w-4" />,
          visibility: true,
          positionIndex: 1,
        },
      ],
    },
  ];

  const actions: TableAction<VehicleTableRow>[] = [
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
    <UniversalTable<VehicleTableRow>
      data={data}
      columns={columns}
      actions={actions}
      rowKey={(row) => row._id}
      headerActionGroups={headerActionGroups}
    />
  );
}
