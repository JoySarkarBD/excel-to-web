"use client";

import { FieldConfig } from "@/components/universal-form/form.types";
import UniversalForm from "@/components/universal-form/UniversalForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateDriverTachographInput } from "@/lib/driver-tachograph/tachograph.types";
import { DriverAction } from "@/service/driver";
import { VehicleAction } from "@/service/vehicle";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

const addTachographSchema = z.object({
  driverId: z.string().min(1, "Driver is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  typeOfInfringement: z.string().optional(),
  details: z.string().optional(),
  actionTaken: z.string().optional(),
  signed: z.coerce.boolean().optional(),
});

type AddTachographForm = z.infer<typeof addTachographSchema>;

interface AddTachographModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateDriverTachographInput) => Promise<void> | void;
  standAloneId: string;
}

export const AddTachographModal = ({
  open,
  onOpenChange,
  onSubmit,
  standAloneId,
}: AddTachographModalProps) => {
  const [driversLoading, setDriversLoading] = useState(false);
  const [driverOptions, setDriverOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [vehicleOptions, setVehicleOptions] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    if (!open) return;

    setDriversLoading(true);
    Promise.all([
      DriverAction.getDrivers(standAloneId, { showPerPage: 100 }),
      VehicleAction.getVehicles(standAloneId, { showPerPage: 100 }),
    ])
      .then(([driversRes, vehiclesRes]) => {
        if (driversRes.status && driversRes.data?.drivers) {
          setDriverOptions(
            driversRes.data.drivers.map((driver) => ({
              label: `${driver.fullName} (${driver._id})`,
              value: driver._id,
            })),
          );
        } else {
          setDriverOptions([]);
        }

        if (vehiclesRes.status && vehiclesRes.data?.vehicles) {
          setVehicleOptions(
            vehiclesRes.data.vehicles.map((vehicle) => ({
              label: `${vehicle.vehicleRegId} (${vehicle._id})`,
              value: vehicle._id,
            })),
          );
        } else {
          setVehicleOptions([]);
        }
      })
      .catch(() => {
        setDriverOptions([]);
        setVehicleOptions([]);
      })
      .finally(() => setDriversLoading(false));
  }, [open, standAloneId]);

  const fields: FieldConfig<AddTachographForm>[] = [
    {
      name: "driverId",
      label: "Driver",
      type: "select",
      placeholder: "Select driver",
      options: driverOptions,
      required: true,
    },
    {
      name: "vehicleId",
      label: "Vehicle",
      type: "select",
      placeholder: "Select vehicle",
      options: vehicleOptions,
      required: true,
    },
    {
      name: "typeOfInfringement",
      label: "Type of Infringement",
      type: "text",
      placeholder: "Enter infringement type",
    },
    {
      name: "details",
      label: "Details",
      type: "textarea",
      placeholder: "Enter details (optional)",
    },
    {
      name: "actionTaken",
      label: "Action Taken",
      type: "textarea",
      placeholder: "Enter action taken (optional)",
    },
    {
      name: "signed",
      label: "Signed",
      type: "select",
      options: [
        { label: "Yes", value: "true" },
        { label: "No", value: "false" },
      ],
    },
  ];

  const handleSubmit = async (data: AddTachographForm) => {
    const payload: CreateDriverTachographInput = {
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      typeOfInfringement: data.typeOfInfringement,
      details: data.details,
      actionTaken: data.actionTaken,
      signed: data.signed ?? false,
      standAloneId,
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogTitle className="text-primary mb-4 text-2xl font-bold">
          Add New Tachograph
        </DialogTitle>
        <DialogDescription className="sr-only">
          Create a new tachograph record by selecting an existing driver and
          vehicle.
        </DialogDescription>

        {driversLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : (
          <UniversalForm<AddTachographForm>
            title="Tachograph Details"
            fields={fields}
            schema={addTachographSchema}
            defaultValues={{
              driverId: "",
              vehicleId: "",
              typeOfInfringement: "",
              details: "",
              actionTaken: "",
              signed: false,
            }}
            onSubmit={handleSubmit}
            submitText="Create Tachograph"
            setOpen={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
