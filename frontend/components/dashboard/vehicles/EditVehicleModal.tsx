"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  VehicleRow,
  UpdateVehicleInput,
  VehicleStatus,
  OwnerShipStatus,
} from "@/lib/vehicles/vehicle.types";
import { DriverAction } from "@/service/driver";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Zod schema for edit vehicle form (additionalDetails flattened with 'ad' prefix) */
const editVehicleSchema = z.object({
  vehicleRegId: z
    .string()
    .min(1, "Vehicle registration ID is required")
    .max(100, "Vehicle registration ID is too long"),
  vehicleType: z
    .string()
    .min(1, "Vehicle type is required")
    .max(100, "Vehicle type is too long"),
  licensePlate: z
    .string()
    .min(1, "License plate is required")
    .max(50, "License plate is too long"),
  status: z.nativeEnum(VehicleStatus, {
    message: "Please select a valid status",
  }),
  driverPack: z.coerce.boolean(),
  notes: z.string().optional(),
  // additionalDetails (flattened)
  adGrossPlatedWeight: z.coerce
    .number()
    .min(0, "Gross plated weight must be 0 or more"),
  adOwnerShipStatus: z.nativeEnum(OwnerShipStatus, {
    message: "Please select a valid ownership status",
  }),
  adDiskNumber: z.string().min(1, "Disk number date is required"),
  adChassisNumber: z.string().min(1, "Chassis number is required"),
  adKeysAvailable: z.coerce
    .number()
    .int()
    .min(0, "Keys available must be 0 or more"),
  adV5InName: z.coerce.boolean(),
  adPlantingCertificate: z.coerce.boolean(),
  adLastServiceDate: z.string().optional(),
  adNextServiceDate: z.string().optional(),
  adDateLeft: z.string().optional(),
  adVedExpiry: z.string().optional(),
  adInsuranceExpiry: z.string().optional(),
  adServiceDueDate: z.string().optional(),
});

type EditVehicleForm = z.infer<typeof editVehicleSchema>;

/** Format a date string/Date to YYYY-MM-DD for form defaults */
function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateVehicleInput) => Promise<void> | void;
  vehicle: VehicleRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditVehicleModal({
  open,
  onOpenChange,
  onSubmit,
  vehicle,
  loading,
  standAloneId,
}: EditVehicleModalProps) {
  const [driverOptions, setDriverOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [driverError, setDriverError] = useState("");
  const [driverPopoverOpen, setDriverPopoverOpen] = useState(false);

  // Fetch drivers when modal opens
  useEffect(() => {
    if (!open) return;
    setDriverError("");
    setDriversLoading(true);
    DriverAction.getDrivers(standAloneId, { showPerPage: 100 })
      .then((res) => {
        if (res.status && res.data?.drivers) {
          setDriverOptions(
            res.data.drivers.map((d) => ({
              label: d.fullName,
              value: d._id,
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => setDriversLoading(false));
  }, [open, standAloneId]);

  // Pre-fill selected drivers from existing vehicle
  useEffect(() => {
    if (open && vehicle?.driverIds) {
      setSelectedDriverIds(vehicle.driverIds);
    }
  }, [open, vehicle]);

  const toggleDriver = (id: string) => {
    setSelectedDriverIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
    setDriverError("");
  };

  const fields: FieldConfig<EditVehicleForm>[] = [
    {
      name: "vehicleRegId",
      label: "Vehicle Registration ID",
      type: "text",
      placeholder: "Enter registration ID",
      required: true,
    },
    {
      name: "vehicleType",
      label: "Vehicle Type",
      type: "text",
      placeholder: "e.g. HGV, Van, Truck",
      required: true,
    },
    {
      name: "licensePlate",
      label: "License Plate",
      type: "text",
      placeholder: "Enter license plate",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Pending", value: VehicleStatus.PENDING },
        { label: "Active", value: VehicleStatus.ACTIVE },
        { label: "Inactive", value: VehicleStatus.INACTIVE },
      ],
      required: true,
    },
    {
      name: "driverPack",
      label: "Driver Pack",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      required: true,
    },
    {
      name: "adGrossPlatedWeight",
      label: "Gross Plated Weight (kg)",
      type: "number",
      placeholder: "0",
      required: true,
    },
    {
      name: "adOwnerShipStatus",
      label: "Ownership Status",
      type: "select",
      options: [
        { label: "Individual Ownership", value: OwnerShipStatus.Individual_Ownership },
        { label: "Joint Ownership", value: OwnerShipStatus.Joint_Ownership },
        { label: "Company/Business Ownership", value: OwnerShipStatus.Company_Business_Ownership },
        { label: "Leased/Financed", value: OwnerShipStatus.Leased_Financed },
        { label: "Fleet Management", value: OwnerShipStatus.Fleet_Management },
      ],
      required: true,
    },
    {
      name: "adDiskNumber",
      label: "Disk Number (Date)",
      type: "date",
      required: true,
    },
    {
      name: "adChassisNumber",
      label: "Chassis Number",
      type: "text",
      placeholder: "Enter chassis number",
      required: true,
    },
    {
      name: "adKeysAvailable",
      label: "Keys Available",
      type: "number",
      placeholder: "0",
      required: true,
    },
    {
      name: "adV5InName",
      label: "V5 In Name",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      required: true,
    },
    {
      name: "adPlantingCertificate",
      label: "Planting Certificate",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
      required: true,
    },
    {
      name: "adLastServiceDate",
      label: "Last Service Date",
      type: "date",
    },
    {
      name: "adNextServiceDate",
      label: "Next Service Date",
      type: "date",
    },
    {
      name: "adVedExpiry",
      label: "VED Expiry",
      type: "date",
    },
    {
      name: "adInsuranceExpiry",
      label: "Insurance Expiry",
      type: "date",
    },
    {
      name: "adServiceDueDate",
      label: "Service Due Date",
      type: "date",
    },
    {
      name: "adDateLeft",
      label: "Date Left",
      type: "date",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Any additional notes",
    },
  ];

  const handleSubmit = async (data: EditVehicleForm) => {
    if (selectedDriverIds.length === 0) {
      setDriverError("Please select at least one driver");
      return;
    }
    const payload: UpdateVehicleInput = {
      vehicleRegId: data.vehicleRegId,
      vehicleType: data.vehicleType,
      licensePlate: data.licensePlate,
      status: data.status,
      driverPack: data.driverPack,
      driverIds: selectedDriverIds,
      additionalDetails: {
        grossPlatedWeight: data.adGrossPlatedWeight,
        ownerShipStatus: data.adOwnerShipStatus,
        diskNumber: data.adDiskNumber,
        chassisNumber: data.adChassisNumber,
        keysAvailable: data.adKeysAvailable,
        v5InName: data.adV5InName,
        plantingCertificate: data.adPlantingCertificate,
        ...(data.adLastServiceDate && { lastServiceDate: data.adLastServiceDate }),
        ...(data.adNextServiceDate && { nextServiceDate: data.adNextServiceDate }),
        ...(data.adDateLeft && { dateLeft: data.adDateLeft }),
        ...(data.adVedExpiry && { vedExpiry: data.adVedExpiry }),
        ...(data.adInsuranceExpiry && { insuranceExpiry: data.adInsuranceExpiry }),
        ...(data.adServiceDueDate && { serviceDueDate: data.adServiceDueDate }),
      },
      ...(data.notes && { notes: data.notes }),
    };
    await onSubmit(payload);
  };

  if (loading || !vehicle) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Edit Vehicle</DialogTitle>
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogTitle className="text-primary text-xl font-bold mb-4">Edit Vehicle</DialogTitle>

        {driversLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Driver multi-select */}
            <div className="bg-white px-6 pb-4 dark:bg-gray-800">
              <div className="flex flex-col">
              <label className="text-foreground mb-4 text-xl font-medium">
                Assign Drivers <span className="text-red-500"> *</span>
              </label>
              <Popover open={driverPopoverOpen} onOpenChange={setDriverPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between rounded-none font-normal","border-input-border border",
                      driverError && "border-red-500 border-2",
                    )}
                  >
                    {selectedDriverIds.length > 0
                      ? `${selectedDriverIds.length} driver(s) selected`
                      : "Select drivers..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full min-w-75 p-1" align="start">
                  {driverOptions.length === 0 ? (
                    <p className="p-2 text-sm text-muted-foreground">No drivers found</p>
                  ) : (
                    driverOptions.map((d) => (
                      <div
                        key={d.value}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 hover:bg-muted"
                        onClick={() => toggleDriver(d.value)}
                      >
                        <Checkbox
                          checked={selectedDriverIds.includes(d.value)}
                          onCheckedChange={() => toggleDriver(d.value)}
                        />
                        <span className="text-sm">{d.label}</span>
                        {selectedDriverIds.includes(d.value) && (
                          <Check className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))
                  )}
                </PopoverContent>
              </Popover>
              {selectedDriverIds.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {selectedDriverIds.map((id) => {
                    const label = driverOptions.find((o) => o.value === id)?.label ?? id;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary cursor-pointer hover:bg-primary/20"
                        onClick={() => toggleDriver(id)}
                      >
                        {label} ✕
                      </span>
                    );
                  })}
                </div>
              )}
              {driverError && (
                <p className="mt-1 text-sm text-destructive">{driverError}</p>
              )}
              </div>
            </div>

            <UniversalForm<EditVehicleForm>
              title="Vehicle Details"
              fields={fields}
            schema={editVehicleSchema}
            defaultValues={{
              vehicleRegId: vehicle.vehicleRegId,
              vehicleType: vehicle.vehicleType,
              licensePlate: vehicle.licensePlate,
              status: vehicle.status,
              driverPack: vehicle.driverPack,
              notes: vehicle.notes || "",
              adGrossPlatedWeight: vehicle.additionalDetails?.grossPlatedWeight ?? 0,
              adOwnerShipStatus:
                vehicle.additionalDetails?.ownerShipStatus ??
                OwnerShipStatus.Individual_Ownership,
              adDiskNumber: toDateInput(vehicle.additionalDetails?.diskNumber),
              adChassisNumber: vehicle.additionalDetails?.chassisNumber || "",
              adKeysAvailable: vehicle.additionalDetails?.keysAvailable ?? 0,
              adV5InName: vehicle.additionalDetails?.v5InName ?? false,
              adPlantingCertificate:
                vehicle.additionalDetails?.plantingCertificate ?? false,
              adLastServiceDate: toDateInput(vehicle.additionalDetails?.lastServiceDate),
              adNextServiceDate: toDateInput(vehicle.additionalDetails?.nextServiceDate),
              adDateLeft: toDateInput(vehicle.additionalDetails?.dateLeft),
              adVedExpiry: toDateInput(vehicle.additionalDetails?.vedExpiry),
              adInsuranceExpiry: toDateInput(vehicle.additionalDetails?.insuranceExpiry),
              adServiceDueDate: toDateInput(vehicle.additionalDetails?.serviceDueDate),
            }}
            onSubmit={handleSubmit}
            submitText="Update Vehicle"
            setOpen={onOpenChange}
          />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
