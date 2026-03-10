"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UpdateDriverTachographInput } from "@/lib/driver-tachograph/tachograph.types";
import { TachoGraphTableRow } from "./TachoGraphTable";
import { DriverTachographAction } from "@/service/driver-tachograph";

const editTachographSchema = z.object({
  driverId: z.string().min(1, "Driver is required"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  typeOfInfringement: z.string().optional(),
  details: z.string().optional(),
  actionTaken: z.string().optional(),
  signed: z.coerce.boolean().optional(),
});

type EditTachographForm = z.infer<typeof editTachographSchema>;

interface EditTachographModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateDriverTachographInput) => Promise<void> | void;
  vehicle: TachoGraphTableRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditTachographModal({
  open,
  onOpenChange,
  onSubmit,
  vehicle,
  loading,
  standAloneId,
}: EditTachographModalProps) {
  const [tachographOptions, setTachographOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [tachographLoading, setTachographLoading] = useState(false);
  const [selectedTachographId, setSelectedTachographId] = useState("");
  const [tachographError, setTachographError] = useState("");
  const [tachographPopoverOpen, setTachographPopoverOpen] = useState(false);

  // Fetch tachographs when modal opens
  useEffect(() => {
    if (!open) return;
    setTachographError("");
    setTachographLoading(true);
    DriverTachographAction.getDriverTachographs(standAloneId, {
      showPerPage: 100,
    })
      .then((res) => {
        if (res.status && res.data?.tachographs) {
          setTachographOptions(
            res.data.tachographs.map((t) => ({
              label: t.typeOfInfringement || `Tachograph ${t._id}`,
              value: t._id,
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => setTachographLoading(false));
  }, [open, standAloneId]);

  // Pre-fill selected tachographs when editing
  useEffect(() => {
    if (open && vehicle?.id) {
      setSelectedTachographId(vehicle.id);
    }
  }, [open, vehicle]);

  const selectTachograph = (id: string) => {
    setSelectedTachographId(id);
    setTachographError("");
    setTachographPopoverOpen(false);
  };

  const fields: FieldConfig<EditTachographForm>[] = [
    {
      name: "driverId",
      label: "Driver",
      type: "text",
      required: true,
    },
    {
      name: "vehicleId",
      label: "Vehicle",
      type: "text",
      required: true,
    },
    {
      name: "typeOfInfringement",
      label: "Type of Infringement",
      type: "text",
    },
    {
      name: "details",
      label: "Details",
      type: "textarea",
    },
    {
      name: "actionTaken",
      label: "Action Taken",
      type: "textarea",
    },
    {
      name: "signed",
      label: "Signed",
      type: "checkbox",
    },
  ];

  const handleSubmit = async (data: EditTachographForm) => {
    if (!selectedTachographId) {
      setTachographError("Please select a tachograph");
      return;
    }
    const payload: UpdateDriverTachographInput = {
      id: selectedTachographId,
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      typeOfInfringement: data.typeOfInfringement,
      details: data.details,
      actionTaken: data.actionTaken,
      signed: data.signed,
    };
    await onSubmit(payload);
  };

  if (loading || !vehicle) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle className="sr-only">Edit Tachograph</DialogTitle>
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
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogTitle className="text-primary mb-4 text-xl font-bold">
          Edit Tachograph
        </DialogTitle>
        <DialogDescription className="sr-only">
          Update tachograph details. Reviewer is assigned automatically from the
          logged-in user.
        </DialogDescription>

        {tachographLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Tachograph selector */}
            <div className="bg-white px-6 pb-4 dark:bg-gray-800">
              <div className="flex flex-col">
                <label className="text-foreground mb-4 text-xl font-medium">
                  Select Tachograph <span className="text-red-500"> *</span>
                </label>
                <Popover
                  open={tachographPopoverOpen}
                  onOpenChange={setTachographPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between rounded-none font-normal",
                        "border-input-border border",
                        tachographError && "border-2 border-red-500",
                      )}
                    >
                      {selectedTachographId
                        ? tachographOptions.find(
                            (o) => o.value === selectedTachographId,
                          )?.label || "Select tachograph..."
                        : "Select tachograph..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full min-w-75 p-1" align="start">
                    {tachographOptions.length === 0 ? (
                      <p className="text-muted-foreground p-2 text-sm">
                        No tachographs found
                      </p>
                    ) : (
                      tachographOptions.map((t) => (
                        <div
                          key={t.value}
                          className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded px-2 py-2"
                          onClick={() => selectTachograph(t.value)}
                        >
                          <Checkbox
                            checked={selectedTachographId === t.value}
                            onCheckedChange={() => selectTachograph(t.value)}
                          />
                          <span className="text-sm">{t.label}</span>
                          {selectedTachographId === t.value && (
                            <Check className="text-primary ml-auto h-4 w-4" />
                          )}
                        </div>
                      ))
                    )}
                  </PopoverContent>
                </Popover>
                {tachographError && (
                  <p className="text-destructive mt-1 text-sm">
                    {tachographError}
                  </p>
                )}
              </div>
            </div>

            <UniversalForm<EditTachographForm>
              title="Driver Tachograph Details"
              fields={fields}
              schema={editTachographSchema}
              defaultValues={{
                driverId: vehicle.driverId || "",
                vehicleId: vehicle.vehicleId || "",
                typeOfInfringement: vehicle.typeOfInfringement || "",
                details: vehicle.details || "",
                actionTaken: vehicle.actionTaken || "",
                signed: vehicle.signed || false,
              }}
              onSubmit={handleSubmit}
              submitText="Update Tachograph"
              setOpen={onOpenChange}
            />
            <p className="text-muted-foreground px-6 pb-2 text-xs">
              Reviewed by is set automatically to the currently logged-in user
              on update.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
