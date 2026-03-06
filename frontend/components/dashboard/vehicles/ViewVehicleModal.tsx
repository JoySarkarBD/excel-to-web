"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VehicleRow } from "@/lib/vehicles/vehicle.types";
import { Loader2 } from "lucide-react";
import { DriverAction } from "@/service/driver";

interface ViewVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: VehicleRow | null;
  loading: boolean;
  standAloneId: string;
}

function formatDate(value?: string | Date): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-foreground text-sm">{value || "—"}</span>
    </div>
  );
}

export default function ViewVehicleModal({
  open,
  onOpenChange,
  vehicle,
  loading,
  standAloneId,
}: ViewVehicleModalProps) {
  const [driverNameMap, setDriverNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !standAloneId) return;
    DriverAction.getDrivers(standAloneId, { showPerPage: 100 })
      .then((res) => {
        if (res.status && res.data?.drivers) {
          const map: Record<string, string> = {};
          res.data.drivers.forEach((d) => {
            map[d._id] = d.fullName;
          });
          setDriverNameMap(map);
        }
      })
      .catch(() => {});
  }, [open, standAloneId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-primary text-xl font-bold">
          Vehicle Details
        </DialogTitle>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : vehicle ? (
          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            {/* Core Fields */}
            <DetailItem label="Vehicle Reg ID" value={vehicle.vehicleRegId} />
            <DetailItem label="Vehicle Type" value={vehicle.vehicleType} />
            <DetailItem label="License Plate" value={vehicle.licensePlate} />
            <DetailItem label="Status" value={vehicle.status} />
            <DetailItem
              label="Driver Pack"
              value={
                <span
                  className={
                    vehicle.driverPack
                      ? "font-medium text-green-600"
                      : "font-medium text-red-500"
                  }
                >
                  {vehicle.driverPack ? "Yes" : "No"}
                </span>
              }
            />
            <DetailItem label="Notes" value={vehicle.notes || "—"} />
            <DetailItem
              label="Assigned Drivers"
              value={
                vehicle.driverIds?.length
                  ? vehicle.driverIds
                      .map((id) => driverNameMap[id] || id)
                      .join(", ")
                  : "—"
              }
            />

            {/* Additional Details */}
            <DetailItem
              label="Ownership Status"
              value={vehicle.additionalDetails?.ownerShipStatus}
            />
            <DetailItem
              label="Chassis Number"
              value={vehicle.additionalDetails?.chassisNumber}
            />
            <DetailItem
              label="Gross Plated Weight"
              value={
                vehicle.additionalDetails?.grossPlatedWeight !== undefined
                  ? `${vehicle.additionalDetails.grossPlatedWeight} kg`
                  : "—"
              }
            />
            <DetailItem
              label="Keys Available"
              value={vehicle.additionalDetails?.keysAvailable ?? "—"}
            />
            <DetailItem
              label="V5 In Name"
              value={
                <span
                  className={
                    vehicle.additionalDetails?.v5InName
                      ? "font-medium text-green-600"
                      : "font-medium text-red-500"
                  }
                >
                  {vehicle.additionalDetails?.v5InName ? "Yes" : "No"}
                </span>
              }
            />
            <DetailItem
              label="Planting Certificate"
              value={
                <span
                  className={
                    vehicle.additionalDetails?.plantingCertificate
                      ? "font-medium text-green-600"
                      : "font-medium text-red-500"
                  }
                >
                  {vehicle.additionalDetails?.plantingCertificate ? "Yes" : "No"}
                </span>
              }
            />
            <DetailItem
              label="Disk Number"
              value={formatDate(vehicle.additionalDetails?.diskNumber)}
            />
            <DetailItem
              label="Last Service Date"
              value={formatDate(vehicle.additionalDetails?.lastServiceDate)}
            />
            <DetailItem
              label="Next Service Date"
              value={formatDate(vehicle.additionalDetails?.nextServiceDate)}
            />
            <DetailItem
              label="Service Due Date"
              value={formatDate(vehicle.additionalDetails?.serviceDueDate)}
            />
            <DetailItem
              label="VED Expiry"
              value={formatDate(vehicle.additionalDetails?.vedExpiry)}
            />
            <DetailItem
              label="Insurance Expiry"
              value={formatDate(vehicle.additionalDetails?.insuranceExpiry)}
            />
            <DetailItem
              label="Date Left"
              value={formatDate(vehicle.additionalDetails?.dateLeft)}
            />
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">No vehicle data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
