"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import UniversalForm from "@/components/universal-form/UniversalForm";
import { FieldConfig } from "@/components/universal-form/form.types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  SpotCheckRow,
  UpdateSpotCheckInput,
} from "@/lib/spot-checks/spot-check.types";
import { VehicleAction } from "@/service/vehicle";

/** Zod schema for edit spot-check form */
const editSpotCheckSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  issueDetails: z
    .string()
    .min(2, "Issue details must be at least 2 characters")
    .max(2000, "Issue details is too long"),
  rectificationRequired: z.string().optional(),
  actionTaken: z.string().optional(),
  dateCompleted: z.string().optional(),
  completedBy: z.string().optional(),
  followUpNeeded: z.string().optional(),
  notes: z.string().optional(),
});

type EditSpotCheckForm = z.infer<typeof editSpotCheckSchema>;

/** Format a date string/Date to YYYY-MM-DD for form defaults */
function toDateInput(value?: string | Date): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface EditSpotCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateSpotCheckInput) => Promise<void> | void;
  spotCheck: SpotCheckRow | null;
  loading: boolean;
  standAloneId: string;
}

export default function EditSpotCheckModal({
  open,
  onOpenChange,
  onSubmit,
  spotCheck,
  loading,
  standAloneId,
}: EditSpotCheckModalProps) {
  const [vehicleOptions, setVehicleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  // Fetch vehicles when modal opens
  useEffect(() => {
    if (!open) return;
    setVehiclesLoading(true);
    VehicleAction.getVehicles(standAloneId, { showPerPage: 100 })
      .then((res) => {
        if (res.status && res.data?.vehicles) {
          setVehicleOptions(
            res.data.vehicles.map((v) => ({
              label: `${v.vehicleRegId} — ${v.licensePlate}`,
              value: v._id,
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => setVehiclesLoading(false));
  }, [open, standAloneId]);

  const fields: FieldConfig<EditSpotCheckForm>[] = [
    {
      name: "vehicleId",
      label: "Vehicle",
      type: "select",
      options: vehicleOptions,
      required: true,
    },
    {
      name: "issueDetails",
      label: "Issue Details",
      type: "textarea",
      placeholder: "Describe the issue",
      required: true,
    },
    {
      name: "rectificationRequired",
      label: "Rectification Required",
      type: "date",
    },
    {
      name: "actionTaken",
      label: "Action Taken",
      type: "textarea",
      placeholder: "Describe action taken",
    },
    {
      name: "dateCompleted",
      label: "Date Completed",
      type: "date",
    },
    {
      name: "completedBy",
      label: "Completed By",
      type: "text",
      placeholder: "Name of person who completed",
    },
    {
      name: "followUpNeeded",
      label: "Follow-Up Needed",
      type: "text",
      placeholder: "Any follow-up required",
    },
    {
      name: "notes",
      label: "Notes",
      type: "textarea",
      placeholder: "Any additional notes",
    },
  ];

  const handleSubmit = async (data: EditSpotCheckForm) => {
    const payload: UpdateSpotCheckInput = {
      vehicleId: data.vehicleId,
      issueDetails: data.issueDetails,
      ...(data.rectificationRequired && {
        rectificationRequired: data.rectificationRequired,
      }),
      ...(data.actionTaken && { actionTaken: data.actionTaken }),
      ...(data.dateCompleted && { dateCompleted: data.dateCompleted }),
      ...(data.completedBy && { completedBy: data.completedBy }),
      ...(data.followUpNeeded && { followUpNeeded: data.followUpNeeded }),
      ...(data.notes && { notes: data.notes }),
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogTitle className="text-primary text-xl font-bold mb-4">
          Edit Spot Check
        </DialogTitle>

        {loading || vehiclesLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : spotCheck ? (
          <UniversalForm<EditSpotCheckForm>
            title="Spot Check Details"
            fields={fields}
            schema={editSpotCheckSchema}
            defaultValues={{
              vehicleId: spotCheck.vehicleId || "",
              issueDetails: spotCheck.issueDetails || "",
              rectificationRequired: toDateInput(
                spotCheck.rectificationRequired,
              ),
              actionTaken: spotCheck.actionTaken || "",
              dateCompleted: toDateInput(spotCheck.dateCompleted),
              completedBy: spotCheck.completedBy || "",
              followUpNeeded: spotCheck.followUpNeeded || "",
              notes: spotCheck.notes || "",
            }}
            onSubmit={handleSubmit}
            submitText="Update Spot Check"
            setOpen={onOpenChange}
          />
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No spot check data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
